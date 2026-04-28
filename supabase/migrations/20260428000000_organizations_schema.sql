-- ── FUR-53: Organizations schema migration ────────────────────────────────────
-- Migrates the DB from user-centric to org-centric ownership so collaboration
-- and future per-org billing are structurally sound.
--
-- Strategy:
--   1. Create organizations + organization_members tables with RLS
--   2. Backfill: create a personal org for every existing user
--   3. Add organization_id to projects and backfill from user_id → personal org
--   4. Replace user_id-based RLS on projects/rooms/room_links/shared_presentations
--      with org-membership-based policies
--   5. Install a trigger that auto-creates a personal org on new user signup
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. organizations ─────────────────────────────────────────────────────────

CREATE TABLE public.organizations (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  slug           TEXT        NOT NULL UNIQUE,
  type           TEXT        NOT NULL DEFAULT 'personal', -- personal | pro
  logo_url       TEXT,
  primary_color  TEXT,
  metadata       JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Owner and members can read the org
CREATE POLICY "org_owner_or_member_select" ON public.organizations
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_owner_insert" ON public.organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "org_owner_update" ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "org_owner_delete" ON public.organizations
  FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 2. organization_members ───────────────────────────────────────────────────

CREATE TABLE public.organization_members (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role             TEXT        NOT NULL DEFAULT 'admin', -- admin | editor | viewer
  invited_by       UUID        REFERENCES auth.users(id),
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Users see their own memberships; org owners see all members of their orgs
CREATE POLICY "member_self_or_owner_select" ON public.organization_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

-- Only org owner can add/modify/remove members
CREATE POLICY "owner_manage_members" ON public.organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );


-- ── 3. Backfill: personal org + admin membership for every existing user ──────

INSERT INTO public.organizations (owner_id, name, slug, type)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    NULLIF(split_part(u.email, '@', 1), ''),
    'My Studio'
  ),
  lower(regexp_replace(
    COALESCE(NULLIF(split_part(u.email, '@', 1), ''), 'user'),
    '[^a-z0-9]+', '-', 'g'
  )) || '-' || substr(u.id::text, 1, 8),
  'personal'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations o
  WHERE o.owner_id = u.id AND o.type = 'personal'
);

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT o.id, o.owner_id, 'admin'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.organization_members m
  WHERE m.organization_id = o.id AND m.user_id = o.owner_id
);


-- ── 4. Add organization_id to projects ───────────────────────────────────────

ALTER TABLE public.projects
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill: link each project to its owner's personal org
UPDATE public.projects p
SET organization_id = o.id
FROM public.organizations o
WHERE o.owner_id = p.user_id
  AND o.type = 'personal';

ALTER TABLE public.projects
  ALTER COLUMN organization_id SET NOT NULL;


-- ── 5. Replace projects RLS (user_id → org membership) ───────────────────────

DROP POLICY IF EXISTS "Users can view own projects"   ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "org_member_select_projects" ON public.projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_insert_projects" ON public.projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_update_projects" ON public.projects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_delete_projects" ON public.projects
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );


-- ── 6. Replace rooms RLS ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view rooms in own projects"   ON public.rooms;
DROP POLICY IF EXISTS "Users can create rooms in own projects" ON public.rooms;
DROP POLICY IF EXISTS "Users can update rooms in own projects" ON public.rooms;
DROP POLICY IF EXISTS "Users can delete rooms in own projects" ON public.rooms;

CREATE POLICY "org_member_select_rooms" ON public.rooms
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_insert_rooms" ON public.rooms
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_update_rooms" ON public.rooms
  FOR UPDATE USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_delete_rooms" ON public.rooms
  FOR DELETE USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );


-- ── 7. Replace room_links RLS ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view room_links in own projects"   ON public.room_links;
DROP POLICY IF EXISTS "Users can create room_links in own projects" ON public.room_links;
DROP POLICY IF EXISTS "Users can update room_links in own projects" ON public.room_links;
DROP POLICY IF EXISTS "Users can delete room_links in own projects" ON public.room_links;

CREATE POLICY "org_member_select_room_links" ON public.room_links
  FOR SELECT USING (
    room_id IN (
      SELECT r.id FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_insert_room_links" ON public.room_links
  FOR INSERT WITH CHECK (
    room_id IN (
      SELECT r.id FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_update_room_links" ON public.room_links
  FOR UPDATE USING (
    room_id IN (
      SELECT r.id FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_delete_room_links" ON public.room_links
  FOR DELETE USING (
    room_id IN (
      SELECT r.id FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );


-- ── 8. Replace shared_presentations RLS ──────────────────────────────────────

DROP POLICY IF EXISTS "Users can create shares for own projects" ON public.shared_presentations;
DROP POLICY IF EXISTS "Users can view own shares"                ON public.shared_presentations;
DROP POLICY IF EXISTS "Users can update own shares"             ON public.shared_presentations;
DROP POLICY IF EXISTS "Users can delete own shares"             ON public.shared_presentations;
-- Keep: "Anyone can view by share token" — public read for share links stays intact

CREATE POLICY "org_member_insert_shares" ON public.shared_presentations
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_select_shares" ON public.shared_presentations
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_update_shares" ON public.shared_presentations
  FOR UPDATE USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_member_delete_shares" ON public.shared_presentations
  FOR DELETE USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );


-- ── 9. Trigger: auto-create personal org on new user signup ──────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user_org()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  INSERT INTO public.organizations (owner_id, name, slug, type)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'My Studio'
    ),
    lower(regexp_replace(
      COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'user'),
      '[^a-z0-9]+', '-', 'g'
    )) || '-' || substr(NEW.id::text, 1, 8),
    'personal'
  )
  RETURNING id INTO v_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_org();


-- Admin function: aggregate stats per user (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  user_id        UUID,
  user_email     TEXT,
  user_created_at TIMESTAMPTZ,
  project_count  BIGINT,
  product_count  BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id                       AS user_id,
    u.email::TEXT              AS user_email,
    u.created_at               AS user_created_at,
    COUNT(DISTINCT p.id)       AS project_count,
    COUNT(DISTINCT l.id)       AS product_count
  FROM auth.users u
  LEFT JOIN public.projects p ON p.user_id = u.id
  LEFT JOIN public.links    l ON l.user_id = u.id
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO anon, authenticated;

-- Admin function: aggregate product count per project (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_admin_projects()
RETURNS TABLE (
  project_id         UUID,
  project_name       TEXT,
  project_created_at TIMESTAMPTZ,
  user_id            UUID,
  product_count      BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id                              AS project_id,
    p.name                            AS project_name,
    p.created_at                      AS project_created_at,
    p.user_id                         AS user_id,
    COUNT(DISTINCT rl.link_id)        AS product_count
  FROM public.projects  p
  LEFT JOIN public.rooms     r  ON r.project_id = p.id
  LEFT JOIN public.room_links rl ON rl.room_id  = r.id
  GROUP BY p.id, p.name, p.created_at, p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_projects() TO anon, authenticated;

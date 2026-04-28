-- ── FUR-55: Project status, cover photo, and storage bucket ─────────────────
-- Adds status (draft | active | archived) and cover_url to projects.
-- Creates the project-covers Supabase Storage bucket with appropriate policies.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Add columns to projects ────────────────────────────────────────────────

ALTER TABLE public.projects
  ADD COLUMN status    TEXT NOT NULL DEFAULT 'draft',    -- draft | active | archived
  ADD COLUMN cover_url TEXT;


-- ── 2. project-covers storage bucket ────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-covers',
  'project-covers',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload / update their own cover files
CREATE POLICY "auth_upload_project_covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-covers'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "auth_update_project_covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-covers'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "auth_delete_project_covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-covers'
    AND auth.role() = 'authenticated'
  );

-- Bucket is public: anyone (including anon for shared presentations) can read
CREATE POLICY "public_read_project_covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-covers');

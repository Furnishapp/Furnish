
-- Function: get_admin_stats
-- Returns one row per user with their email, join date, project count, and product count.
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  user_created_at timestamptz,
  project_count bigint,
  product_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text AS user_email,
    u.created_at AS user_created_at,
    (SELECT count(*) FROM public.projects p WHERE p.user_id = u.id) AS project_count,
    (SELECT count(*) FROM public.links l WHERE l.user_id = u.id) AS product_count
  FROM auth.users u
  ORDER BY u.created_at DESC;
$$;

-- Function: get_admin_projects
-- Returns one row per project with its owner and product count.
CREATE OR REPLACE FUNCTION public.get_admin_projects()
RETURNS TABLE (
  project_id uuid,
  project_name text,
  project_created_at timestamptz,
  user_id uuid,
  product_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.created_at::timestamptz AS project_created_at,
    p.user_id,
    (
      SELECT count(*)
      FROM public.rooms r
      JOIN public.room_links rl ON rl.room_id = r.id
      WHERE r.project_id = p.id
    ) AS product_count
  FROM public.projects p
  ORDER BY p.created_at DESC;
$$;

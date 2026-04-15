-- Revoke public access to admin aggregation functions.
--
-- These functions use SECURITY DEFINER (run as postgres superuser) and expose
-- all user emails, project names, and product counts. They must only be callable
-- by the service_role, which is used exclusively by the admin-stats edge function
-- after server-side password verification via ADMIN_PASSWORD secret.
--
-- Direct calls with the anon key (embedded in the JS bundle) will now return:
--   {"code":"42501","message":"permission denied for function get_admin_stats"}

REVOKE EXECUTE ON FUNCTION public.get_admin_stats()    FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_projects() FROM anon, authenticated;

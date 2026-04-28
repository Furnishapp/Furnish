-- ── Bypass email confirmation ────────────────────────────────────────────────
-- Confirms all existing unconfirmed users and installs a trigger that
-- auto-confirms every new signup so users can log in immediately.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Confirm existing unconfirmed users
UPDATE auth.users
  SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Trigger: auto-confirm email on every new signup
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE auth.users SET email_confirmed_at = now() WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user_email();

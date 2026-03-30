
-- Protect sensitive profile columns from being modified by non-service-role users
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service_role can modify these sensitive fields
  IF current_setting('role') != 'service_role' THEN
    -- Prevent changes to access_until
    IF NEW.access_until IS DISTINCT FROM OLD.access_until THEN
      RAISE EXCEPTION 'You are not allowed to modify access_until';
    END IF;
    -- Prevent changes to active_session_id
    IF NEW.active_session_id IS DISTINCT FROM OLD.active_session_id THEN
      RAISE EXCEPTION 'You are not allowed to modify active_session_id';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_sensitive_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_sensitive_fields();

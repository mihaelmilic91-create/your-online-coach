-- Fix site_settings: restrict public read to allowlisted key prefixes
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

CREATE POLICY "Public can view whitelisted settings"
ON public.site_settings FOR SELECT
TO public
USING (
  key LIKE 'pixel_%' OR key LIKE 'product_%'
);

-- Admins already have a SELECT policy via existing admin policies
-- But add explicit one to ensure admins see all settings
DROP POLICY IF EXISTS "Admins can view all settings" ON public.site_settings;
CREATE POLICY "Admins can view all settings"
ON public.site_settings FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix function search_path for enqueue_email
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT pgmq.send(queue_name, payload); $$;

-- Fix function search_path for read_email_batch
CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $$;

-- Fix function search_path for delete_email
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT pgmq.delete(queue_name, message_id); $$;

-- Fix function search_path for move_to_dlq
CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$$;
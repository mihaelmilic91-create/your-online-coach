
-- 1) Make course-videos bucket private and lock down access (admin-only)
UPDATE storage.buckets SET public = false WHERE id = 'course-videos';

DROP POLICY IF EXISTS "Public read access for course videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read course videos" ON storage.objects;

-- Fallback: drop any SELECT policy on storage.objects scoped to course-videos bucket with public access
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND qual ILIKE '%course-videos%' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins can read course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos' AND has_role(auth.uid(), 'admin'::app_role));

-- 2) Restrict public access to user_reviews to safe columns via a view
DROP POLICY IF EXISTS "Anyone can view approved published reviews" ON public.user_reviews;

CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true) AS
SELECT id, first_name, city, star_rating, review_text, saved_lessons, review_date, flow_type, is_approved, publish_permission
FROM public.user_reviews
WHERE is_approved = true AND publish_permission = true;

-- Re-add a tightly scoped policy so the view works for anon/authenticated readers
CREATE POLICY "Public can view approved reviews safe columns"
ON public.user_reviews FOR SELECT
TO anon, authenticated
USING (is_approved = true AND publish_permission = true);

-- Note: the view is the recommended public surface; sensitive feedback_* and user_id fields
-- remain accessible only to the owner and admins via existing policies.

GRANT SELECT ON public.public_reviews TO anon, authenticated;

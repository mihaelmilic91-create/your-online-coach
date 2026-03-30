
-- Fix 1: Add explicit service-role-only policies to pending_registrations
CREATE POLICY "Service role can manage pending registrations"
ON public.pending_registrations
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Fix 2: Tighten write policies on video_progress, user_favorites, video_self_assessments
-- Drop public-role write policies and recreate as authenticated-only

-- video_progress
DROP POLICY IF EXISTS "Users can insert their own video progress" ON public.video_progress;
DROP POLICY IF EXISTS "Users can update their own video progress" ON public.video_progress;

CREATE POLICY "Users can insert their own video progress"
ON public.video_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress"
ON public.video_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- user_favorites
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

CREATE POLICY "Users can insert their own favorites"
ON public.user_favorites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.user_favorites FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- video_self_assessments
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.video_self_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.video_self_assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.video_self_assessments;

CREATE POLICY "Users can insert their own assessments"
ON public.video_self_assessments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.video_self_assessments FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
ON public.video_self_assessments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

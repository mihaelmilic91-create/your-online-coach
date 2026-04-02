-- Drop the existing public SELECT policy on videos
DROP POLICY IF EXISTS "Anyone can view published videos from published categories" ON public.videos;

-- Create new policy: only authenticated users can view published videos
CREATE POLICY "Authenticated users can view published videos"
ON public.videos
FOR SELECT
TO authenticated
USING (
  (is_published = true AND EXISTS (
    SELECT 1 FROM video_categories
    WHERE video_categories.id = videos.category_id
    AND video_categories.is_published = true
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);
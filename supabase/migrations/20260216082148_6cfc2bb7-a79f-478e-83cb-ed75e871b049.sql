
-- Create self-assessment table for video skill ratings
CREATE TABLE public.video_self_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.video_self_assessments ENABLE ROW LEVEL SECURITY;

-- Users can view their own assessments
CREATE POLICY "Users can view their own assessments"
ON public.video_self_assessments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own assessments
CREATE POLICY "Users can insert their own assessments"
ON public.video_self_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update their own assessments"
ON public.video_self_assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "Users can delete their own assessments"
ON public.video_self_assessments FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all assessments
CREATE POLICY "Admins can view all assessments"
ON public.video_self_assessments FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

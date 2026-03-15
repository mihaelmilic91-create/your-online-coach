
-- Table for user reviews and feedback
CREATE TABLE public.user_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  first_name text,
  city text,
  registration_date timestamp with time zone,
  review_date timestamp with time zone NOT NULL DEFAULT now(),
  helpfulness text NOT NULL,
  saved_lessons text,
  star_rating smallint,
  review_text text,
  publish_permission boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  feedback_missing text,
  feedback_missing_other text,
  feedback_improve text,
  flow_type text NOT NULL DEFAULT 'review',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
ON public.user_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own reviews
CREATE POLICY "Users can view their own reviews"
ON public.user_reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.user_reviews FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reviews (approve/reject)
CREATE POLICY "Admins can update reviews"
ON public.user_reviews FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
ON public.user_reviews FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view approved reviews with publish permission
CREATE POLICY "Anyone can view approved published reviews"
ON public.user_reviews FOR SELECT
TO anon
USING (is_approved = true AND publish_permission = true);

-- Updated_at trigger
CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON public.user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table for tracking popup dismissals
CREATE TABLE public.review_popup_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  last_dismissed_at timestamp with time zone,
  last_completed_at timestamp with time zone,
  dismiss_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.review_popup_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own popup tracking"
ON public.review_popup_tracking FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

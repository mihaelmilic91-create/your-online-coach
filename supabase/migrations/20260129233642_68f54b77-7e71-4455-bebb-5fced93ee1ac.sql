-- Add watch_count column to track how many times a video was watched
ALTER TABLE public.video_progress 
ADD COLUMN watch_count INTEGER NOT NULL DEFAULT 1;
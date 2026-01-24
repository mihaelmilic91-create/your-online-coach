-- Add access_until column to profiles table for tracking subscription expiry
ALTER TABLE public.profiles 
ADD COLUMN access_until TIMESTAMP WITH TIME ZONE;
-- Remove the public SELECT policy that exposes coupon details
DROP POLICY IF EXISTS "Anyone can validate active coupons" ON public.coupons;
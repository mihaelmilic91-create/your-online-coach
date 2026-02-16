CREATE POLICY "Anyone can validate active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);
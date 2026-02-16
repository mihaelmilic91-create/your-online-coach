-- Create the missing trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert missing profile for the user who registered via free coupon
INSERT INTO public.profiles (user_id, display_name, access_until)
SELECT '9382bb18-c2c1-4797-a27f-457c6acde811', 'Mihael Milic', (now() + interval '1 year')
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = '9382bb18-c2c1-4797-a27f-457c6acde811');
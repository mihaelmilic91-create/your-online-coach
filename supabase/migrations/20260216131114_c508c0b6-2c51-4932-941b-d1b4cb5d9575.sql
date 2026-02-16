
-- Create pages table for static content pages
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view published pages
CREATE POLICY "Anyone can view published pages"
ON public.pages
FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert
CREATE POLICY "Admins can insert pages"
ON public.pages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update pages"
ON public.pages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete pages"
ON public.pages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with placeholder pages
INSERT INTO public.pages (slug, title, content, is_published) VALUES
('preise', 'Preise', '', false),
('faq', 'FAQ', '', false),
('ueber-uns', 'Über uns', '', false),
('kontakt', 'Kontakt', '', false),
('blog', 'Blog', '', false),
('impressum', 'Impressum', '', false),
('datenschutz', 'Datenschutz', '', false),
('agb', 'AGB', '', false);

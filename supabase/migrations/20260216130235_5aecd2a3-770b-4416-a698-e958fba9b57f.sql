
-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  rating SMALLINT NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can view published testimonials
CREATE POLICY "Anyone can view published testimonials"
ON public.testimonials
FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert
CREATE POLICY "Admins can insert testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing hardcoded testimonials as seed data
INSERT INTO public.testimonials (name, location, rating, text, sort_order) VALUES
('Lara K.', 'Olten', 5, 'Die Videos sind genau das, was ich gebraucht habe, um mich zwischen den Fahrstunden sicher zu fühlen. Ich konnte gezielt mit meinen Eltern üben und wusste immer, worauf ich achten muss. Mein Fahrlehrer war beeindruckt, wie schnell ich Fortschritte gemacht habe!', 0),
('Giulia T.', 'Baar', 5, 'Endlich versteht man, was wirklich wichtig ist! Die Erklärungen sind super klar und praxisnah. So konnten meine Eltern mir viel besser helfen, weil sie auch gesehen haben, wie es richtig geht.', 1),
('Adam D.', 'Wädenswil', 5, 'Ich konnte mir mehrere Fahrlektionen sparen, weil ich mit den Videos schon so viel gelernt habe. Die echten Aufnahmen von Schweizer Strassen haben mir enorm geholfen, mich auf die Prüfung vorzubereiten.', 2);

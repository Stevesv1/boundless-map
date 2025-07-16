-- Create a new table for user notes without country_name
CREATE TABLE public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  twitter_username TEXT NOT NULL,
  comment TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select and insert (customize as needed)
CREATE POLICY "Anyone can view notes" ON public.user_notes FOR SELECT USING (true);
CREATE POLICY "Anyone can create notes" ON public.user_notes FOR INSERT WITH CHECK (true); 
-- Create a reactions table for emoji reactions on comments
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.user_comments(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  user_identifier TEXT NOT NULL, -- Store user's identifier (could be IP, session, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, emoji, user_identifier)
);

-- Enable RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Anyone can view reactions" 
ON public.comment_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reactions" 
ON public.comment_reactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own reactions" 
ON public.comment_reactions 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on user_comments
CREATE TRIGGER update_user_comments_updated_at
    BEFORE UPDATE ON public.user_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
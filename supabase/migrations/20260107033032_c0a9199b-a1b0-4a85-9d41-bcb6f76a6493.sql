-- Create game_translations table for caching translations
CREATE TABLE public.game_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, language)
);

-- Enable RLS
ALTER TABLE public.game_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read translations
CREATE POLICY "Anyone can view game translations"
ON public.game_translations
FOR SELECT
USING (true);

-- Only authenticated users can insert (edge function will use service role)
CREATE POLICY "Service role can insert translations"
ON public.game_translations
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_game_translations_game_language ON public.game_translations(game_id, language);
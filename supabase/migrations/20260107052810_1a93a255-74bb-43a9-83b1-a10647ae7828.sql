-- Add source content columns to game_translations for cache invalidation
ALTER TABLE public.game_translations 
ADD COLUMN IF NOT EXISTS source_description text,
ADD COLUMN IF NOT EXISTS source_long_description text;

-- Create news_translations table
CREATE TABLE IF NOT EXISTS public.news_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT,
  content TEXT,
  source_title TEXT,
  source_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(news_id, language)
);

-- Enable RLS on news_translations
ALTER TABLE public.news_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can view news translations
CREATE POLICY "Anyone can view news translations"
ON public.news_translations
FOR SELECT
USING (true);
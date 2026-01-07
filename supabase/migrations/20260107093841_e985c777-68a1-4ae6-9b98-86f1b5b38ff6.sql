-- Add category field to news table for filtering
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add an index for better performance on category filtering
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
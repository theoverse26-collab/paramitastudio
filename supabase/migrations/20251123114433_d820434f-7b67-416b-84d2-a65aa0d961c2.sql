-- Add hero_image_url field to games table
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
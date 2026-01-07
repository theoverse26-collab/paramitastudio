-- Add body_images column to news table for additional inline images
ALTER TABLE public.news ADD COLUMN body_images TEXT[] DEFAULT '{}';
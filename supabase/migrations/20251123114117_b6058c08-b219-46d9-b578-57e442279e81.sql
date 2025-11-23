-- Add developer, release_date, and platform fields to games table
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS developer TEXT NOT NULL DEFAULT 'Paramita Studio',
ADD COLUMN IF NOT EXISTS release_date TEXT NOT NULL DEFAULT '2024',
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'PC, PlayStation, Xbox';
-- Remove overly permissive INSERT policy; service role bypasses RLS
DROP POLICY IF EXISTS "Service role can insert translations" ON public.game_translations;
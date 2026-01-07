-- Clear game_translations cache entries that contain unicode escape sequences
-- This will force re-translation with the fixed edge function
DELETE FROM game_translations 
WHERE description LIKE '%\u%' 
   OR long_description LIKE '%\u%';
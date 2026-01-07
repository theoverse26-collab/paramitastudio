import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface TranslatedContent {
  description: string;
  long_description: string;
}

interface UseGameTranslationProps {
  gameId: string;
  description: string;
  longDescription?: string;
}

export const useGameTranslation = ({ gameId, description, longDescription = '' }: UseGameTranslationProps) => {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState<TranslatedContent>({
    description,
    long_description: longDescription,
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const currentLang = i18n.language;

    // If English or no gameId, use original content
    if (currentLang === 'en' || !gameId) {
      setTranslated({ description, long_description: longDescription });
      return;
    }

    const fetchTranslation = async () => {
      setIsTranslating(true);

      try {
        // First check cache directly from database
        const { data: cached } = await supabase
          .from('game_translations')
          .select('description, long_description')
          .eq('game_id', gameId)
          .eq('language', currentLang)
          .maybeSingle();

        if (cached) {
          setTranslated({
            description: cached.description || description,
            long_description: cached.long_description || longDescription,
          });
          setIsTranslating(false);
          return;
        }

        // If not cached, call the edge function to translate
        const { data, error } = await supabase.functions.invoke('translate-game-content', {
          body: {
            game_id: gameId,
            target_language: currentLang,
            description,
            long_description: longDescription,
          },
        });

        if (error) {
          console.error('Translation error:', error);
          // Fallback to original content
          setTranslated({ description, long_description: longDescription });
        } else if (data) {
          setTranslated({
            description: data.description || description,
            long_description: data.long_description || longDescription,
          });
        }
      } catch (err) {
        console.error('Translation fetch error:', err);
        setTranslated({ description, long_description: longDescription });
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslation();
  }, [gameId, description, longDescription, i18n.language]);

  return { translated, isTranslating };
};

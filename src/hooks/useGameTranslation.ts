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

    const needsLong = !!longDescription?.trim();

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

        const cachedDesc = cached?.description;
        const cachedLong = cached?.long_description;

        const hasDesc = !!cachedDesc?.trim() && cachedDesc.trim().toLowerCase() !== 'n/a';
        const hasLong = !!cachedLong?.trim() && cachedLong.trim().toLowerCase() !== 'n/a';

        // If cache satisfies what we need, use it
        if (cached && hasDesc && (!needsLong || hasLong)) {
          setTranslated({
            description: cachedDesc || description,
            long_description: cachedLong || longDescription,
          });
          return;
        }

        // Otherwise call backend to translate (and it will upsert cache)
        const { data, error } = await supabase.functions.invoke('translate-game-content', {
          body: {
            game_id: gameId,
            target_language: currentLang,
            description,
            long_description: needsLong ? longDescription : null,
          },
        });

        if (error) {
          console.error('Translation error:', error);
          setTranslated({ description, long_description: longDescription });
          return;
        }

        setTranslated({
          description: data?.description || description,
          long_description: data?.long_description || longDescription,
        });
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

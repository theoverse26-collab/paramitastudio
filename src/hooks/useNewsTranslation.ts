import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface TranslatedContent {
  title: string;
  content: string;
}

interface UseNewsTranslationProps {
  newsId: string;
  title: string;
  content: string;
}

export const useNewsTranslation = ({ newsId, title, content }: UseNewsTranslationProps) => {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState<TranslatedContent>({
    title,
    content,
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const currentLang = i18n.language;

    // If no newsId, use original content
    if (!newsId) {
      setTranslated({ title, content });
      return;
    }

    const fetchTranslation = async () => {
      setIsTranslating(true);

      try {
        // First check cache directly from database
        const { data: cached } = await supabase
          .from('news_translations')
          .select('title, content, source_title, source_content')
          .eq('news_id', newsId)
          .eq('language', currentLang)
          .maybeSingle();

        const cachedTitle = cached?.title;
        const cachedContent = cached?.content;
        const sourceTitle = cached?.source_title;
        const sourceContent = cached?.source_content;

        const hasTitle = !!cachedTitle?.trim();
        const hasContent = !!cachedContent?.trim();

        // Check if source matches (cache is valid) - NULL source means cache is stale
        const titleMatches = sourceTitle != null && sourceTitle === title;
        const contentMatches = sourceContent != null && sourceContent === content;
        const cacheValid = titleMatches && contentMatches;

        // If cache is valid and has what we need, use it
        if (cached && cacheValid && hasTitle && hasContent) {
          setTranslated({
            title: cachedTitle || title,
            content: cachedContent || content,
          });
          setIsTranslating(false);
          return;
        }

        // Otherwise call backend to translate (and it will upsert cache)
        const { data, error } = await supabase.functions.invoke('translate-news-content', {
          body: {
            news_id: newsId,
            target_language: currentLang,
            title,
            content,
          },
        });

        if (error) {
          console.error('News translation error:', error);
          setTranslated({ title, content });
          return;
        }

        setTranslated({
          title: data?.title || title,
          content: data?.content || content,
        });
      } catch (err) {
        console.error('News translation fetch error:', err);
        setTranslated({ title, content });
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslation();
  }, [newsId, title, content, i18n.language]);

  return { translated, isTranslating };
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { news_id, target_language, title, content } = await req.json();

    if (!news_id || !target_language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: news_id, target_language' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const needsTitle = typeof title === 'string' && title.trim().length > 0;
    const needsContent = typeof content === 'string' && content.trim().length > 0;

    // If there's nothing to translate, return originals
    if (!needsTitle && !needsContent) {
      return new Response(
        JSON.stringify({ title: title ?? '', content: content ?? '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if translation already exists in cache
    const { data: existingTranslation } = await supabase
      .from('news_translations')
      .select('title, content, source_title, source_content')
      .eq('news_id', news_id)
      .eq('language', target_language)
      .maybeSingle();

    const cachedTitle = existingTranslation?.title;
    const cachedContent = existingTranslation?.content;
    const sourceTitle = existingTranslation?.source_title;
    const sourceContent = existingTranslation?.source_content;

    const cachedHasTitle = !!cachedTitle?.trim();
    const cachedHasContent = !!cachedContent?.trim();

    // Check if source content has changed (cache invalidation)
    const titleSourceMatches = !needsTitle || sourceTitle === title;
    const contentSourceMatches = !needsContent || sourceContent === content;
    const cacheValid = titleSourceMatches && contentSourceMatches;

    if (existingTranslation && cacheValid && (!needsTitle || cachedHasTitle) && (!needsContent || cachedHasContent)) {
      console.log('Returning cached translation for news', news_id, target_language);
      return new Response(
        JSON.stringify({
          title: cachedTitle || (title ?? ''),
          content: cachedContent || (content ?? ''),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingTranslation && !cacheValid) {
      console.log('Cache invalidated for news', news_id, target_language, '- source content changed');
    }

    // Get language name for better translation
    const languageNames: Record<string, string> = {
      id: 'Indonesian',
      en: 'English',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      es: 'Spanish',
    };
    const targetLangName = languageNames[target_language] || target_language;

    // Translate using Lovable AI - supports bi-directional translation
    // Note: Content may be HTML from TipTap editor - we need to preserve structure
    const promptParts = [
      `Translate the following news article to ${targetLangName}.`,
      `The source text may be in any language - detect it and translate to ${targetLangName}.`,
      `Return ONLY a JSON object with exactly two keys: "title" and "content".`,
      `Rules:`,
      `- DO NOT translate game names, product names, proper nouns, or brand names. Keep them in their original form.`,
      `- Examples of names to keep unchanged: "Nightfall Odyssey", "Shadow Warrior", "Paramita Games", "Steam", "PlayStation", etc.`,
      `- If a field is missing/empty, return an empty string for that field.`,
      `- The content field may contain HTML tags. Preserve ALL HTML tags exactly as they are (like <p>, <img>, <h1>, <h2>, <ul>, <li>, <strong>, <em>, etc).`,
      `- Only translate the text content between HTML tags, not the tags themselves or their attributes.`,
      `- Keep all image URLs, links, and other attributes unchanged.`,
      `- Preserve paragraph breaks and formatting.`,
      `- No markdown, no code fences, JSON only.`,
      '',
      `Title:`,
      needsTitle ? title : '',
      '',
      `Content:`,
      needsContent ? content : '',
    ];

    console.log('Calling Lovable AI for news translation to', targetLangName);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate naturally while preserving the tone and style of the original. Respond with valid JSON only.',
          },
          { role: 'user', content: promptParts.join('\n') },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI translation failed:', aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Translation rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Translation credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Translation service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content;

    if (!responseContent) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Translation failed - no response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let translatedContent: any;
    try {
      let jsonStr = responseContent.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      translatedContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      return new Response(
        JSON.stringify({ error: 'Translation parsing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translatedTitle = needsTitle ? (translatedContent.title?.trim() || title) : '';
    const translatedContentText = needsContent ? (translatedContent.content?.trim() || content) : '';

    // Upsert the translation cache with source content for cache invalidation
    const upsertPayload: Record<string, any> = {
      news_id,
      language: target_language,
    };

    if (needsTitle) {
      upsertPayload.title = translatedTitle;
      upsertPayload.source_title = title;
    }
    if (needsContent) {
      upsertPayload.content = translatedContentText;
      upsertPayload.source_content = content;
    }

    const { error: upsertError } = await supabase
      .from('news_translations')
      .upsert(upsertPayload, { onConflict: 'news_id,language' });

    if (upsertError) {
      console.error('Failed to upsert news translation cache:', upsertError);
    } else {
      console.log('Upserted news translation for', news_id, target_language);
    }

    return new Response(
      JSON.stringify({
        title: needsTitle ? translatedTitle : (title ?? ''),
        content: needsContent ? translatedContentText : (content ?? ''),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-news-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

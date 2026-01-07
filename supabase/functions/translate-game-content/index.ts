import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decode unicode escape sequences like \u2014 to actual characters
const decodeUnicodeEscapes = (str: string): string => {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
};

// Simple language detection - checks if text contains Indonesian-specific patterns
const detectLanguage = (text: string): 'id' | 'en' | 'unknown' => {
  if (!text || text.trim().length === 0) return 'unknown';
  
  // Common Indonesian words and patterns
  const indonesianPatterns = [
    /\b(dan|atau|yang|dengan|untuk|dari|ini|itu|adalah|di|ke|pada|dalam|akan|sudah|telah|tidak|bisa|dapat|juga|serta|oleh|karena|seperti|saat|ketika|setelah|sebelum|namun|tetapi|meskipun|agar|supaya|jika|bila|kalau|maka|bahwa|antara|tentang|terhadap|melalui|selama|hingga|sampai|tanpa|bersama|menuju|sekitar|sekali|sangat|lebih|paling|hanya|masih|lagi|lalu|kemudian)\b/gi,
    /\b(bermain|dimainkan|pemain|permainan|petualangan|dunia|kamu|kita|mereka|kami)\b/gi,
  ];
  
  let indonesianMatches = 0;
  for (const pattern of indonesianPatterns) {
    const matches = text.match(pattern);
    if (matches) indonesianMatches += matches.length;
  }
  
  // If we find several Indonesian words, it's likely Indonesian
  if (indonesianMatches >= 3) return 'id';
  
  // Check for English patterns
  const englishPatterns = [
    /\b(the|and|or|with|for|from|this|that|is|are|was|were|will|would|can|could|have|has|had|not|but|also|which|when|where|what|how|who|why|your|you|they|them|their|our|its|into|over|through|during|before|after|between|about|against|under|above|below|only|just|still|even|then|now|here|there|very|more|most|some|any|each|every|both|few|many|much|such|these|those)\b/gi,
  ];
  
  let englishMatches = 0;
  for (const pattern of englishPatterns) {
    const matches = text.match(pattern);
    if (matches) englishMatches += matches.length;
  }
  
  if (englishMatches >= 3) return 'en';
  
  return 'unknown';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { game_id, target_language, description, long_description } = await req.json();

    if (!game_id || !target_language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: game_id, target_language' }),
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

    const needsDesc = typeof description === 'string' && description.trim().length > 0;
    const needsLong = typeof long_description === 'string' && long_description.trim().length > 0;

    // If there's nothing to translate, return originals without caching
    if (!needsDesc && !needsLong) {
      return new Response(
        JSON.stringify({ description: description ?? '', long_description: long_description ?? '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect source language from the content
    const textToCheck = description || long_description || '';
    const detectedSourceLang = detectLanguage(textToCheck);
    console.log('Detected source language:', detectedSourceLang, 'Target:', target_language);

    // If source and target are the same, return original content
    if (detectedSourceLang === target_language) {
      console.log('Source and target language are the same, returning original');
      return new Response(
        JSON.stringify({
          description: description ?? '',
          long_description: long_description ?? '',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if translation already exists in cache
    const { data: existingTranslation } = await supabase
      .from('game_translations')
      .select('description, long_description, source_description, source_long_description')
      .eq('game_id', game_id)
      .eq('language', target_language)
      .maybeSingle();

    // Check if cached translation is valid (source content matches current content)
    const cachedDesc = existingTranslation?.description;
    const cachedLong = existingTranslation?.long_description;
    const sourceDesc = existingTranslation?.source_description;
    const sourceLong = existingTranslation?.source_long_description;
    
    const cachedHasDesc = !!cachedDesc?.trim() && cachedDesc.trim().toLowerCase() !== 'n/a';
    const cachedHasLong = !!cachedLong?.trim() && cachedLong.trim().toLowerCase() !== 'n/a';
    
    // Check if source content has changed (cache invalidation)
    const descSourceMatches = !needsDesc || sourceDesc === description;
    const longSourceMatches = !needsLong || sourceLong === long_description;
    const cacheValid = descSourceMatches && longSourceMatches;

    if (existingTranslation && cacheValid && (!needsDesc || cachedHasDesc) && (!needsLong || cachedHasLong)) {
      console.log('Returning cached translation for', game_id, target_language);
      return new Response(
        JSON.stringify({
          description: cachedDesc || (description ?? ''),
          long_description: cachedLong || (long_description ?? ''),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingTranslation && !cacheValid) {
      console.log('Cache invalidated for', game_id, target_language, '- source content changed');
    }

    // Get language names for better translation
    const languageNames: Record<string, string> = {
      en: 'English',
      id: 'Indonesian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      es: 'Spanish',
    };
    const targetLangName = languageNames[target_language] || target_language;
    const sourceLangName = detectedSourceLang !== 'unknown' 
      ? languageNames[detectedSourceLang] || detectedSourceLang
      : 'the source language';

    // Translate using Lovable AI
    const promptParts = [
      `Translate the following video game text from ${sourceLangName} to ${targetLangName}.`,
      `Return ONLY a JSON object with exactly two keys: "description" and "long_description".`,
      `Rules:`,
      `- If a field is missing/empty, return an empty string for that field (NOT "N/A").`,
      `- Return plain text characters, do NOT use unicode escape sequences like \\u2014.`,
      `- Preserve any dashes, em-dashes, or special punctuation as actual characters.`,
      `- No markdown, no code fences, JSON only.`,
      '',
      `Short description:`,
      needsDesc ? description : '',
      '',
      `Long description:`,
      needsLong ? long_description : '',
    ];

    console.log('Calling Lovable AI for translation from', sourceLangName, 'to', targetLangName);

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
            content:
              'You are a professional translator specializing in video game content. Translate naturally while preserving gaming terminology and tone. Return plain text characters, never unicode escape sequences. Respond with valid JSON only.',
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
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Translation failed - no response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response (handle potential markdown code blocks)
    let translatedContent: any;
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      translatedContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Translation parsing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clean = (v: unknown) => {
      if (typeof v !== 'string') return '';
      let s = v.trim();
      if (!s) return '';
      if (s.toLowerCase() === 'n/a') return '';
      // Decode any unicode escape sequences that might have slipped through
      s = decodeUnicodeEscapes(s);
      return s;
    };

    const translatedDesc = needsDesc ? clean(translatedContent.description) : '';
    const translatedLong = needsLong ? clean(translatedContent.long_description) : '';

    // Upsert the translation cache with source content for cache invalidation
    const upsertPayload: Record<string, any> = {
      game_id,
      language: target_language,
    };

    // Store both translated content and source content for cache invalidation
    if (needsDesc) {
      upsertPayload.description = translatedDesc || description;
      upsertPayload.source_description = description;
    }
    if (needsLong) {
      upsertPayload.long_description = translatedLong || long_description;
      upsertPayload.source_long_description = long_description;
    }

    const { error: upsertError } = await supabase
      .from('game_translations')
      .upsert(upsertPayload, { onConflict: 'game_id,language' });

    if (upsertError) {
      console.error('Failed to upsert translation cache:', upsertError);
    } else {
      console.log('Upserted translation for', game_id, target_language);
    }

    return new Response(
      JSON.stringify({
        description: needsDesc ? (translatedDesc || description || '') : (description ?? ''),
        long_description: needsLong ? (translatedLong || long_description || '') : (long_description ?? ''),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-game-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
    const { game_id, target_language, description, long_description } = await req.json();

    if (!game_id || !target_language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: game_id, target_language' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If target is English, just return the original content
    if (target_language === 'en') {
      return new Response(
        JSON.stringify({
          description: description ?? '',
          long_description: long_description ?? '',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Check if translation already exists in cache
    const { data: existingTranslation } = await supabase
      .from('game_translations')
      .select('description, long_description')
      .eq('game_id', game_id)
      .eq('language', target_language)
      .maybeSingle();

    // If cache has what we need, return it
    const cachedDesc = existingTranslation?.description;
    const cachedLong = existingTranslation?.long_description;
    const cachedHasDesc = !!cachedDesc?.trim() && cachedDesc.trim().toLowerCase() !== 'n/a';
    const cachedHasLong = !!cachedLong?.trim() && cachedLong.trim().toLowerCase() !== 'n/a';

    if (existingTranslation && (!needsDesc || cachedHasDesc) && (!needsLong || cachedHasLong)) {
      console.log('Returning cached translation for', game_id, target_language);
      return new Response(
        JSON.stringify({
          description: cachedDesc || (description ?? ''),
          long_description: cachedLong || (long_description ?? ''),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get language name for better translation
    const languageNames: Record<string, string> = {
      id: 'Indonesian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      es: 'Spanish',
    };
    const targetLangName = languageNames[target_language] || target_language;

    // Translate using Lovable AI
    const promptParts = [
      `Translate the following video game text to ${targetLangName}.`,
      `Return ONLY a JSON object with exactly two keys: "description" and "long_description".`,
      `Rules:`,
      `- If a field is missing/empty, return an empty string for that field (NOT "N/A").`,
      `- No markdown, no code fences, JSON only.`,
      '',
      `Short description:`,
      needsDesc ? description : '',
      '',
      `Long description:`,
      needsLong ? long_description : '',
    ];

    console.log('Calling Lovable AI for translation to', targetLangName);

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
              'You are a professional translator specializing in video game content. Translate naturally while preserving gaming terminology and tone. Respond with valid JSON only.',
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
      const s = v.trim();
      if (!s) return '';
      if (s.toLowerCase() === 'n/a') return '';
      return s;
    };

    const translatedDesc = needsDesc ? clean(translatedContent.description) : '';
    const translatedLong = needsLong ? clean(translatedContent.long_description) : '';

    // Upsert the translation cache (service role bypasses RLS)
    const upsertPayload: Record<string, any> = {
      game_id,
      language: target_language,
    };

    // Only write fields that were requested; never write "N/A"
    if (needsDesc) upsertPayload.description = translatedDesc || description;
    if (needsLong) upsertPayload.long_description = translatedLong || long_description;

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

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
        JSON.stringify({ description, long_description }),
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

    // Check if translation already exists in cache
    const { data: existingTranslation } = await supabase
      .from('game_translations')
      .select('description, long_description')
      .eq('game_id', game_id)
      .eq('language', target_language)
      .maybeSingle();

    if (existingTranslation) {
      console.log('Returning cached translation for', game_id, target_language);
      return new Response(
        JSON.stringify(existingTranslation),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get language name for better translation
    const languageNames: Record<string, string> = {
      'id': 'Indonesian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'es': 'Spanish',
    };
    const targetLangName = languageNames[target_language] || target_language;

    // Translate using Lovable AI
    const prompt = `Translate the following game descriptions to ${targetLangName}. 
Return ONLY a JSON object with exactly two keys: "description" and "long_description".
Do not include any other text, markdown formatting, or code blocks.

Short description: ${description || 'N/A'}

Long description: ${long_description || 'N/A'}`;

    console.log('Calling Lovable AI for translation to', targetLangName);
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional translator specializing in video game content. Translate naturally while preserving gaming terminology and the original tone. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
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
    let translatedContent;
    try {
      let jsonStr = content.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      translatedContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Translation parsing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the translation
    const { error: insertError } = await supabase
      .from('game_translations')
      .insert({
        game_id,
        language: target_language,
        description: translatedContent.description || description,
        long_description: translatedContent.long_description || long_description,
      });

    if (insertError) {
      console.error('Failed to cache translation:', insertError);
      // Don't fail the request, just log the error
    } else {
      console.log('Cached translation for', game_id, target_language);
    }

    return new Response(
      JSON.stringify({
        description: translatedContent.description || description,
        long_description: translatedContent.long_description || long_description,
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

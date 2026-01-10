import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch live data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch games data
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, title, genre, description, price, developer, release_date, platform, features")
      .limit(50);

    if (gamesError) {
      console.error("Error fetching games:", gamesError);
    }

    // Fetch news data
    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("id, title, content, category, published_at")
      .order("published_at", { ascending: false })
      .limit(20);

    if (newsError) {
      console.error("Error fetching news:", newsError);
    }

    // Build context from database
    const gamesContext = games?.map(g => 
      `Game: "${g.title}" - Genre: ${g.genre}, Price: $${g.price}, Developer: ${g.developer}, Platform: ${g.platform}, Release: ${g.release_date}. Description: ${g.description}. Features: ${g.features?.join(", ") || "N/A"}`
    ).join("\n\n") || "No games available.";

    const newsContext = news?.map(n => 
      `News: "${n.title}" (${n.category}) - Published: ${new Date(n.published_at).toLocaleDateString()}. Content: ${n.content?.substring(0, 300)}...`
    ).join("\n\n") || "No news available.";

    const systemPrompt = `You are a helpful AI assistant for Paramita Studio, a game development studio. You help users with questions about games, news, and the studio.

CURRENT GAMES IN OUR CATALOG:
${gamesContext}

LATEST NEWS & UPDATES:
${newsContext}

GUIDELINES:
- Be friendly, helpful, and enthusiastic about games
- When users ask about games, provide accurate information from the catalog above
- When users ask about news or updates, reference the latest news
- If asked about something not in the data, politely say you don't have that information
- Keep responses concise but informative
- You can recommend games based on user preferences (genre, price, etc.)
- For purchase inquiries, direct users to the Marketplace page
- For technical support, suggest contacting support via the Contact page`;

    console.log("Sending request to Lovable AI with context from", games?.length || 0, "games and", news?.length || 0, "news articles");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

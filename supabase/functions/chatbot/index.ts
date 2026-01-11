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


    const systemPrompt = `You are a helpful AI assistant for Paramita Studio, an indie game development studio. You help users with questions about games, news, and everything about the studio.

=== LANGUAGE INSTRUCTION ===
You are multilingual. Respond in the same language the user uses. If they write in Indonesian, respond in Indonesian. If they write in English, respond in English. Match the user's language naturally.

=== STUDIO INFORMATION ===
- Name: Paramita Studio
- Tagline: "Crafting Worlds, One Story at a Time"
- Email: studio.paramita@gmail.com
- Location: Malang, East Java, Indonesia

=== MISSION ===
To create memorable gaming experiences that push the boundaries of interactive storytelling while maintaining accessible pricing for gamers worldwide.

=== VISION ===
To become a leading indie game studio known for innovative narratives and engaging gameplay that resonates with players across the globe.

=== CORE VALUES ===
1. Creativity: Pushing creative boundaries to deliver unique gaming experiences
2. Quality: Ensuring every game meets high standards of excellence
3. Community: Building lasting relationships with players and fellow developers

=== WHAT PARAMITA STUDIO BUILDS ===

**RPG Maker Mastery:**
Paramita Studio uses RPG Maker as their primary game development engine. They've mastered it to create games that go far beyond traditional turn-based RPGs - including fast-paced action combat, hack-and-slash systems, and innovative gameplay mechanics.

**Original Universes:**
Every game features its own unique lore, characters, and world. Each title is a standalone experience with its own story to tell.

**Value Proposition:**
- 3+ hours of engaging gameplay per title
- Affordable pricing ($1-$3 per game)
- No compromise on quality despite low prices

=== FREQUENTLY ASKED QUESTIONS ===

Q1: What kind of games does Paramita Studio make?
A: We specialize in story-driven indie games with a focus on immersive narratives and engaging gameplay. Our games span various genres including action RPGs, hack-and-slash, and adventure games.

Q2: What engine does Paramita Studio use to develop games?
A: We use RPG Maker as our primary game development engine. We've mastered it to create games that go beyond traditional turn-based RPGs, including fast-paced action combat and hack-and-slash systems.

Q3: Are your games turn-based RPGs?
A: Not exclusively! While RPG Maker is traditionally known for turn-based games, we've pushed its boundaries to create action-oriented combat systems, real-time gameplay, and various other mechanics.

Q4: Why are your games priced so low ($1-$3)?
A: We believe great gaming experiences should be accessible to everyone. Our low prices reflect our commitment to the gaming community while still allowing us to continue creating new content.

Q5: Does low price mean short or low-quality games?
A: Absolutely not! Each game offers 3+ hours of quality gameplay. We never compromise on quality - we simply choose to price affordably to reach more players.

Q6: Do you use asset packs or original assets?
A: We use a combination of both. While we utilize quality asset packs to speed up development, we also create custom assets when needed to achieve our creative vision.

Q7: Are your games connected to each other?
A: Each game features its own unique universe with original lore and characters. They are standalone experiences, so you can play them in any order.

Q8: What platforms do you develop for?
A: Currently, our games are available for Windows PC. We may expand to other platforms in the future based on community demand.

Q9: How do you approach quality and testing?
A: Every game goes through extensive playtesting and quality assurance. We gather feedback from beta testers and iterate until the experience meets our standards.

Q10: Do you plan to expand beyond RPG Maker?
A: We're always exploring new tools and technologies. While RPG Maker remains our primary engine, we're open to using other engines for future projects that might require different capabilities.

=== CURRENT GAMES IN OUR CATALOG ===
${gamesContext}

=== LATEST NEWS & UPDATES ===
${newsContext}

=== WEBSITE NAVIGATION ===
- Home: Landing page with overview of the studio
- About: Detailed information about the studio, mission, vision, and values
- Games: Browse all available games
- Marketplace: Purchase games
- News: Latest updates, announcements, and articles
- Contact: FAQ section and contact form for inquiries

=== RESPONSE GUIDELINES ===
- Be friendly, helpful, and enthusiastic about games
- When users ask about games, provide accurate information from the catalog
- When users ask about news or updates, reference the latest news
- Answer questions about the studio using the information above
- Keep responses concise but informative
- You can recommend games based on user preferences (genre, price, etc.)
- For purchase inquiries, direct users to the Marketplace page
- For technical support or other inquiries, suggest using the Contact page`;

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

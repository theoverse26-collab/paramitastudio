import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User authenticated:", user.id);

    const { game_id } = await req.json();
    console.log("Requested game_id:", game_id);

    // Verify user has purchased this game
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", game_id)
      .eq("payment_status", "completed")
      .single();

    if (purchaseError || !purchase) {
      console.error("Purchase verification failed:", purchaseError);
      return new Response(JSON.stringify({ error: "Game not purchased" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Purchase verified:", purchase.id);

    // Get game file URL
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("title, file_url")
      .eq("id", game_id)
      .single();

    if (gameError || !game?.file_url) {
      console.error("Game not found or no file URL:", gameError);
      return new Response(JSON.stringify({ error: "Game file not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching file from:", game.file_url);

    // Fetch file from Dropbox (server-side, no CORS)
    const fileResponse = await fetch(game.file_url);
    if (!fileResponse.ok) {
      console.error("Failed to fetch from storage:", fileResponse.status, fileResponse.statusText);
      throw new Error("Failed to fetch file from storage");
    }

    console.log("File fetched successfully, streaming to client");

    const fileBlob = await fileResponse.blob();
    const fileName = `${game.title.replace(/[^a-zA-Z0-9]/g, "-")}.zip`;

    return new Response(fileBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Download error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

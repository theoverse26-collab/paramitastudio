import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== Check DOKU Payment Status ===");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Server configuration error");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { invoiceNumber } = await req.json();

    if (!invoiceNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing invoice number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking status for invoice:", invoiceNumber);

    // Query the purchase record
    const { data: purchase, error: findError } = await supabase
      .from("purchases")
      .select(`
        *,
        games:game_id (title)
      `)
      .eq("gateway_order_id", invoiceNumber)
      .single();

    if (findError || !purchase) {
      console.error("Purchase not found:", findError);
      return new Response(
        JSON.stringify({ success: false, error: "Purchase not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Purchase found:", {
      id: purchase.id,
      status: purchase.payment_status,
      gameTitle: purchase.games?.title,
    });

    return new Response(
      JSON.stringify({
        success: true,
        purchase: {
          id: purchase.id,
          status: purchase.payment_status,
          gameTitle: purchase.games?.title || "Unknown Game",
          amount: purchase.amount,
          purchaseDate: purchase.purchase_date,
          paymentDetails: purchase.payment_details,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error checking payment status:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check status";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

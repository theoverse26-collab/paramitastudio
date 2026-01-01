import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sandbox URL for testing
const DOKU_API_URL = "https://api-sandbox.doku.com/checkout/v1/payment";

// Generate HMAC-SHA256 signature per DOKU spec
async function generateSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  requestTarget: string,
  body: string,
  secretKey: string
): Promise<{ signature: string; digest: string }> {
  const encoder = new TextEncoder();
  
  // Calculate digest of request body (just base64 SHA-256, no prefix)
  const bodyBytes = encoder.encode(body);
  const digestBuffer = await crypto.subtle.digest("SHA-256", bodyBytes);
  const digestB64 = btoa(String.fromCharCode(...new Uint8Array(digestBuffer)));
  
  // Build signature component string per DOKU spec
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digestB64}`;
  
  console.log("Component signature string:", componentSignature);
  
  // Generate HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(componentSignature)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  
  return {
    signature: `HMACSHA256=${signatureB64}`,
    digest: digestB64
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const dokuClientId = Deno.env.get("DOKU_CLIENT_ID");
    const dokuSecretKey = Deno.env.get("DOKU_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!dokuClientId || !dokuSecretKey) {
      console.error("DOKU credentials not configured");
      throw new Error("Payment gateway not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      throw new Error("Database not configured");
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { gameId, amount, gameTitle, userEmail, userId, callbackUrl } = await req.json();
    
    if (!gameId || !amount || !userId) {
      throw new Error("Missing required fields: gameId, amount, userId");
    }

    console.log(`Creating DOKU payment for game ${gameId}, amount: ${amount} IDR, user: ${userId}`);

    // Generate unique request ID
    const requestId = crypto.randomUUID();
    
    // Generate UTC timestamp in ISO8601 format
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    
    // Build invoice number
    const invoiceNumber = `INV-${Date.now()}-${gameId.substring(0, 8)}`;
    
    // Request target (path only)
    const requestTarget = "/checkout/v1/payment";

    // Get origin for callback URLs
    const origin = req.headers.get("origin") || "https://paramitastudio.lovable.app";
    
    // Notification URL for DOKU to call when payment is completed
    const notificationUrl = `${supabaseUrl}/functions/v1/doku-payment-notification`;
    
    // Build DOKU request body
    const dokuBody = {
      order: {
        amount: Math.round(amount), // DOKU requires integer IDR amount
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url: notificationUrl, // Server-to-server notification
        callback_url_result: callbackUrl || `${origin}/payment-success?invoice=${invoiceNumber}`,
        language: "EN",
        auto_redirect: true,
      },
      payment: {
        payment_due_date: 60, // 60 minutes to complete payment
      },
      customer: {
        id: userId,
        email: userEmail || "customer@example.com",
        name: userEmail?.split("@")[0] || "Customer",
      },
    };
    
    const bodyString = JSON.stringify(dokuBody);
    
    // Generate signature and digest
    const { signature, digest } = await generateSignature(
      dokuClientId,
      requestId,
      timestamp,
      requestTarget,
      bodyString,
      dokuSecretKey
    );
    
    console.log("Digest:", digest);
    console.log("Request-Target:", requestTarget);
    console.log("Notification URL:", notificationUrl);
    console.log("Calling DOKU API with headers:", {
      "Client-Id": dokuClientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
    });

    // Call DOKU API
    const response = await fetch(DOKU_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": dokuClientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        "Signature": signature,
        "Digest": digest,
      },
      body: bodyString,
    });

    const responseText = await response.text();
    console.log("DOKU API response status:", response.status);
    console.log("DOKU API response:", responseText);

    if (!response.ok) {
      console.error("DOKU API error:", responseText);
      throw new Error(`DOKU API error: ${response.status}`);
    }

    const dokuResponse = JSON.parse(responseText);
    
    // Extract payment URL
    const paymentUrl = dokuResponse.response?.payment?.url;
    
    if (!paymentUrl) {
      console.error("No payment URL in response:", dokuResponse);
      throw new Error("Failed to get payment URL from DOKU");
    }

    // Check for existing purchase for this user/game combo
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single();

    if (existingPurchase) {
      if (existingPurchase.payment_status === "completed") {
        console.log("Game already purchased by user");
        return new Response(
          JSON.stringify({
            success: false,
            error: "You have already purchased this game",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Update existing pending purchase with new invoice
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          gateway_order_id: invoiceNumber,
          payment_status: "pending",
          payment_details: {
            doku_session_id: dokuResponse.response?.order?.session_id,
            expired_date: dokuResponse.response?.payment?.expired_date,
          },
        })
        .eq("id", existingPurchase.id);

      if (updateError) {
        console.error("Error updating pending purchase:", updateError);
      } else {
        console.log("Updated existing pending purchase for invoice:", invoiceNumber);
      }
    } else {
      // Create new pending purchase record
      const { error: insertError } = await supabase
        .from("purchases")
        .insert({
          user_id: userId,
          game_id: gameId,
          amount: amount,
          payment_gateway: "doku",
          gateway_order_id: invoiceNumber,
          payment_status: "pending",
          payment_details: {
            doku_session_id: dokuResponse.response?.order?.session_id,
            expired_date: dokuResponse.response?.payment?.expired_date,
          },
        });

      if (insertError) {
        console.error("Error creating pending purchase:", insertError);
      } else {
        console.log("Pending purchase created for invoice:", invoiceNumber);
      }
    }

    console.log("Payment URL generated:", paymentUrl);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl,
        invoiceNumber,
        expiredDate: dokuResponse.response?.payment?.expired_date,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating DOKU payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

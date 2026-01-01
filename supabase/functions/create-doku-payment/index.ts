import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOKU_SANDBOX_URL = "https://api-sandbox.doku.com/checkout/v1/payment";

// Generate HMAC-SHA256 signature per DOKU spec
async function generateSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  requestTarget: string,
  body: string,
  secretKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  
  // Calculate digest of request body
  const bodyBytes = encoder.encode(body);
  const digestBuffer = await crypto.subtle.digest("SHA-256", bodyBytes);
  const digestB64 = btoa(String.fromCharCode(...new Uint8Array(digestBuffer)));
  const digest = `SHA-256=${digestB64}`;
  
  // Build signature component string
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  
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
  
  return `HMACSHA256=${signatureB64}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const dokuClientId = Deno.env.get("DOKU_CLIENT_ID");
    const dokuSecretKey = Deno.env.get("DOKU_SECRET_KEY");
    
    if (!dokuClientId || !dokuSecretKey) {
      console.error("DOKU credentials not configured");
      throw new Error("Payment gateway not configured");
    }

    // Parse request body
    const { gameId, amount, gameTitle, userEmail, userId, callbackUrl } = await req.json();
    
    if (!gameId || !amount) {
      throw new Error("Missing required fields: gameId, amount");
    }

    console.log(`Creating DOKU payment for game ${gameId}, amount: ${amount} IDR`);

    // Generate unique request ID
    const requestId = crypto.randomUUID();
    
    // Generate UTC timestamp in ISO8601 format
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    
    // Build invoice number
    const invoiceNumber = `INV-${Date.now()}-${gameId.substring(0, 8)}`;
    
    // Request target (path only)
    const requestTarget = "/checkout/v1/payment";
    
    // Build DOKU request body
    const dokuBody = {
      order: {
        amount: Math.round(amount), // DOKU requires integer IDR amount
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url_result: callbackUrl || `${req.headers.get("origin")}/marketplace`,
        language: "EN",
        auto_redirect: true,
      },
      payment: {
        payment_due_date: 60, // 60 minutes to complete payment
      },
      customer: {
        id: userId || "guest",
        email: userEmail || "customer@example.com",
        name: userEmail?.split("@")[0] || "Customer",
      },
    };
    
    const bodyString = JSON.stringify(dokuBody);
    
    // Generate signature
    const signature = await generateSignature(
      dokuClientId,
      requestId,
      timestamp,
      requestTarget,
      bodyString,
      dokuSecretKey
    );
    
    console.log("Calling DOKU API with headers:", {
      "Client-Id": dokuClientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
    });

    // Call DOKU API
    const response = await fetch(DOKU_SANDBOX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": dokuClientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        "Signature": signature,
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

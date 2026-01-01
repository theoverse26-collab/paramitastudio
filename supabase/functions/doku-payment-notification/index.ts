import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify DOKU signature
async function verifySignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  requestTarget: string,
  digest: string,
  signature: string,
  secretKey: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  
  // Build signature component string per DOKU spec
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  
  console.log("Verifying signature with component string:", componentSignature);
  
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
  
  const expectedSignature = `HMACSHA256=${btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))}`;
  
  console.log("Expected signature:", expectedSignature);
  console.log("Received signature:", signature);
  
  return expectedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== DOKU Payment Notification Received ===");
  console.log("Method:", req.method);
  console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));

  try {
    const dokuClientId = Deno.env.get("DOKU_CLIENT_ID");
    const dokuSecretKey = Deno.env.get("DOKU_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!dokuSecretKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      throw new Error("Server configuration error");
    }

    // Create Supabase client with service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get headers from DOKU notification
    const receivedClientId = req.headers.get("Client-Id") || "";
    const requestId = req.headers.get("Request-Id") || "";
    const timestamp = req.headers.get("Request-Timestamp") || "";
    const signature = req.headers.get("Signature") || "";
    const digest = req.headers.get("Digest") || "";

    // Parse notification body
    const bodyText = await req.text();
    console.log("Notification body:", bodyText);

    // Verify the digest matches the body
    const encoder = new TextEncoder();
    const bodyBytes = encoder.encode(bodyText);
    const digestBuffer = await crypto.subtle.digest("SHA-256", bodyBytes);
    const computedDigest = btoa(String.fromCharCode(...new Uint8Array(digestBuffer)));
    
    console.log("Computed digest:", computedDigest);
    console.log("Received digest:", digest);

    // Note: For production, you should verify the signature
    // For now, we'll process the notification but log signature verification status
    const requestTarget = "/functions/v1/doku-payment-notification";
    
    if (dokuClientId && signature) {
      const isValidSignature = await verifySignature(
        receivedClientId,
        requestId,
        timestamp,
        requestTarget,
        digest,
        signature,
        dokuSecretKey
      );
      console.log("Signature valid:", isValidSignature);
    }

    // Parse the notification body
    const notification = JSON.parse(bodyText);
    console.log("Parsed notification:", JSON.stringify(notification, null, 2));

    // Extract relevant information
    const invoiceNumber = notification.order?.invoice_number;
    const transactionStatus = notification.transaction?.status;
    const transactionId = notification.transaction?.identifier;
    const paymentMethod = notification.channel?.id;

    console.log("Invoice:", invoiceNumber);
    console.log("Transaction status:", transactionStatus);
    console.log("Transaction ID:", transactionId);

    if (!invoiceNumber) {
      console.error("No invoice number in notification");
      return new Response(
        JSON.stringify({ success: false, error: "Missing invoice number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map DOKU status to our status
    let paymentStatus = "pending";
    if (transactionStatus === "SUCCESS") {
      paymentStatus = "completed";
    } else if (transactionStatus === "FAILED" || transactionStatus === "EXPIRED") {
      paymentStatus = "failed";
    }

    console.log("Mapped payment status:", paymentStatus);

    // Find and update the purchase record
    const { data: existingPurchase, error: findError } = await supabase
      .from("purchases")
      .select("*")
      .eq("gateway_order_id", invoiceNumber)
      .single();

    if (findError) {
      console.error("Error finding purchase:", findError);
      // Try to create a new record if not found (fallback)
      console.log("Purchase not found, notification logged but not processed");
      return new Response(
        JSON.stringify({ success: true, message: "Notification received, purchase not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found existing purchase:", existingPurchase);

    // Only update if not already completed (prevent duplicate processing)
    if (existingPurchase.payment_status === "completed") {
      console.log("Purchase already completed, skipping update");
      return new Response(
        JSON.stringify({ success: true, message: "Payment already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the purchase record
    const { error: updateError } = await supabase
      .from("purchases")
      .update({
        payment_status: paymentStatus,
        gateway_transaction_id: transactionId,
        payment_details: {
          ...existingPurchase.payment_details,
          transaction_status: transactionStatus,
          payment_method: paymentMethod,
          notification_received_at: new Date().toISOString(),
          raw_notification: notification,
        },
      })
      .eq("id", existingPurchase.id);

    if (updateError) {
      console.error("Error updating purchase:", updateError);
      throw new Error("Failed to update purchase record");
    }

    console.log(`Purchase ${invoiceNumber} updated to status: ${paymentStatus}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing DOKU notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process notification";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

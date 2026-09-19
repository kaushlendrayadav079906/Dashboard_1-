// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

// Public webhook endpoint - no JWT required (verified via signature)
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!WEBHOOK_SECRET) {
      throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const expected = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expected !== signature) {
      console.error("Signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(rawBody);
    console.log("Razorpay webhook event:", event.event);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;

    if (!razorpayOrderId) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map event to payment_status
    let newPaymentStatus: string | null = null;
    switch (event.event) {
      case "payment.captured":
      case "order.paid":
        newPaymentStatus = "paid";
        break;
      case "payment.failed":
        newPaymentStatus = "failed";
        break;
      case "refund.created":
      case "refund.processed":
        newPaymentStatus = "refunded";
        break;
    }

    if (!newPaymentStatus) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find matching order by razorpay_order_id column
    const { data: orders } = await supabase
      .from("orders")
      .select("id, status, payment_status, user_id")
      .eq("razorpay_order_id", razorpayOrderId)
      .limit(1);

    if (orders && orders.length > 0) {
      const order = orders[0];
      
      // Idempotency check
      if (order.payment_status === newPaymentStatus) {
        console.log(`Order ${order.id} already has payment_status ${newPaymentStatus}`);
        return new Response(JSON.stringify({ ok: true, duplicate: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase
        .from("orders")
        .update({ payment_status: newPaymentStatus, razorpay_payment_id: razorpayPaymentId || undefined })
        .eq("id", order.id);

      await supabase.from("funnel_events").insert([{
        user_id: order.user_id,
        event_type: "webhook_status_update",
        metadata: { order_id: order.id, payment_status: newPaymentStatus, event: event.event },
      }]);

      console.log(`Order ${order.id} payment_status updated to ${newPaymentStatus}`);
    } else {
      console.log("No matching order for razorpay_order_id:", razorpayOrderId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

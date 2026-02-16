import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { couponCode } = await req.json();

    if (!couponCode || typeof couponCode !== "string" || couponCode.trim().length === 0) {
      return new Response(JSON.stringify({ valid: false, error: "Kein Gutscheincode angegeben" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("code, discount_type, discount_value, is_active, max_uses, current_uses, valid_from, valid_until")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return new Response(JSON.stringify({ valid: false, error: "Ungültiger Gutscheincode" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(JSON.stringify({ valid: false, error: "Dieser Gutschein ist noch nicht gültig" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(JSON.stringify({ valid: false, error: "Dieser Gutschein ist abgelaufen" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return new Response(JSON.stringify({ valid: false, error: "Dieser Gutschein wurde bereits eingelöst" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Return only what the client needs: code, discount type/value (no usage counts or dates)
    return new Response(JSON.stringify({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Validate coupon error:", error);
    return new Response(JSON.stringify({ valid: false, error: "Fehler beim Prüfen des Gutscheins" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

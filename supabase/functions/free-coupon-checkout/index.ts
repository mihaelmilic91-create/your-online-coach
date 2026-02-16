import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { couponCode } = await req.json();

    if (!couponCode) {
      throw new Error("Kein Gutscheincode angegeben");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Nicht authentifiziert");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new Error("Nicht authentifiziert");
    }

    const userId = userData.user.id;

    // Validate coupon server-side
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      throw new Error("Ungültiger Gutscheincode");
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      throw new Error("Dieser Gutschein ist noch nicht gültig");
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      throw new Error("Dieser Gutschein ist abgelaufen");
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      throw new Error("Dieser Gutschein wurde bereits eingelöst");
    }

    // Check that coupon gives 100% discount
    const basePrice = 79.0;
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = basePrice * (coupon.discount_value / 100);
    } else {
      discountAmount = coupon.discount_value;
    }
    const finalPrice = Math.max(0, basePrice - discountAmount);

    if (finalPrice > 0) {
      throw new Error("Gutschein deckt nicht den vollen Betrag ab");
    }

    // Update access_until (1 year)
    const accessUntil = new Date();
    accessUntil.setFullYear(accessUntil.getFullYear() + 1);

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ access_until: accessUntil.toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Fehler beim Aktualisieren des Zugangs");
    }

    // Increment coupon usage
    await supabaseAdmin
      .from("coupons")
      .update({ current_uses: coupon.current_uses + 1 })
      .eq("id", coupon.id);

    return new Response(JSON.stringify({
      success: true,
      accessUntil: accessUntil.toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Free coupon checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, billingAddress, password, couponCode, freeCheckout } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      throw new Error("Missing required fields");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === email);
    if (emailExists) {
      throw new Error("Diese E-Mail-Adresse ist bereits registriert");
    }

    // If freeCheckout with coupon, validate coupon and create user directly
    if (freeCheckout && couponCode) {
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

      // Check if discount results in free checkout
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

      // Create user account directly
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: `${firstName} ${lastName}`,
        },
      });

      if (authError) {
        console.error("Error creating user:", authError);
        throw new Error("Fehler beim Erstellen des Kontos: " + authError.message);
      }

      // Wait for profile trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set access_until (1 year)
      const accessUntil = new Date();
      accessUntil.setFullYear(accessUntil.getFullYear() + 1);

      if (authData.user) {
        await supabaseAdmin
          .from("profiles")
          .update({
            access_until: accessUntil.toISOString(),
            display_name: `${firstName} ${lastName}`,
          })
          .eq("user_id", authData.user.id);
      }

      // Increment coupon usage
      await supabaseAdmin
        .from("coupons")
        .update({ current_uses: coupon.current_uses + 1 })
        .eq("id", coupon.id);

      return new Response(JSON.stringify({
        success: true,
        freeCheckout: true,
        email,
        firstName,
        lastName,
        accessUntil: accessUntil.toISOString(),
        tempPassword: password,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Normal flow: Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: email,
        name: `${firstName} ${lastName}`,
        address: billingAddress ? {
          line1: billingAddress.street,
          city: billingAddress.city,
          postal_code: billingAddress.postalCode,
          country: 'CH',
          state: billingAddress.canton,
        } : undefined,
      });
      customerId = customer.id;
    }

    const { data: pendingReg, error: pendingError } = await supabaseAdmin
      .from('pending_registrations')
      .insert({
        email: email,
        password_hash: password,
        first_name: firstName,
        last_name: lastName,
        billing_address: billingAddress,
      })
      .select()
      .single();

    if (pendingError) {
      console.error("Error creating pending registration:", pendingError);
      throw new Error("Fehler bei der Registrierung");
    }

    const origin = req.headers.get("origin") || "https://coach-from-scratch.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: "price_1RwI39DdM2PPWMJrRNcHkV11",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&registration_id=${pendingReg.id}`,
      cancel_url: `${origin}/checkout?payment=canceled`,
      metadata: {
        registration_id: pendingReg.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
      },
    });

    await supabaseAdmin
      .from('pending_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', pendingReg.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

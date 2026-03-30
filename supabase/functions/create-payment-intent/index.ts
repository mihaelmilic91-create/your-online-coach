import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, billingAddress, password, couponCode } = await req.json();

    if (!email || !firstName || !lastName || !password || !billingAddress) {
      throw new Error("Alle Pflichtfelder müssen ausgefüllt sein.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if user is already authenticated (existing user buying access)
    const authHeader = req.headers.get("Authorization");
    let isExistingUser = false;
    let existingUserId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData?.user) {
        isExistingUser = true;
        existingUserId = userData.user.id;
        console.log("Existing authenticated user:", userData.user.email);
      }
    }

    // Only check for duplicate email if this is a NEW user registration
    if (!isExistingUser) {
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        console.error("Error checking existing users:", listError);
        throw new Error("Fehler bei der Überprüfung der E-Mail.");
      }

      const emailExists = existingUsers.users.some(
        (user) => user.email?.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        throw new Error("Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an.");
      }
    }

    // Validate coupon server-side if provided
    const basePrice = 7900; // CHF 79.00 in cents
    let finalAmount = basePrice;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon && !couponError) {
        const now = new Date();
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) <= now : true;
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) >= now : true;
        const usesOk = !coupon.max_uses || coupon.current_uses < coupon.max_uses;

        if (validFrom && validUntil && usesOk) {
          if (coupon.discount_type === "percentage") {
            finalAmount = Math.round(basePrice * (1 - coupon.discount_value / 100));
          } else {
            finalAmount = Math.max(0, basePrice - Math.round(coupon.discount_value * 100));
          }
          appliedCouponCode = coupon.code;
          console.log(`Coupon ${coupon.code} applied: ${basePrice} -> ${finalAmount} cents`);
        }
      }
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeSecretKey);

    // Check if customer exists or create new
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        address: {
          line1: billingAddress.street,
          city: billingAddress.city,
          postal_code: billingAddress.postalCode,
          state: billingAddress.canton || undefined,
          country: "CH",
        },
      });
    }

    // Only store pending registration for new users
    if (!isExistingUser) {
      await supabaseAdmin
        .from("pending_registrations")
        .delete()
        .eq("email", email);

      const { error: insertError } = await supabaseAdmin
        .from("pending_registrations")
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          password_hash: password,
          billing_address: billingAddress,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (insertError) {
        console.error("Error storing pending registration:", insertError);
        throw new Error("Fehler beim Speichern der Registrierung.");
      }
    }

    // Create PaymentIntent with possibly discounted amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "chf",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email,
        firstName,
        lastName,
        product: "Online Drivecoach - Jahreslizenz",
        existingUserId: existingUserId || "",
        couponCode: appliedCouponCode || "",
      },
    });

    // Determine which publishable key the frontend should use
    const publishableKey = paymentIntent.livemode
      ? (Deno.env.get("VITE_STRIPE_PUBLISHABLE_KEY_LIVE") || Deno.env.get("VITE_STRIPE_PUBLISHABLE_KEY") || "")
      : (Deno.env.get("VITE_STRIPE_PUBLISHABLE_KEY_TEST") || "");

    if (!publishableKey) {
      throw new Error(
        paymentIntent.livemode
          ? "Missing publishable key for LIVE mode (VITE_STRIPE_PUBLISHABLE_KEY_LIVE)"
          : "Missing publishable key for TEST mode (VITE_STRIPE_PUBLISHABLE_KEY_TEST)"
      );
    }

    // Update pending registration with payment intent ID (only for new users)
    if (!isExistingUser) {
      await supabaseAdmin
        .from("pending_registrations")
        .update({ stripe_session_id: paymentIntent.id })
        .eq("email", email);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        livemode: paymentIntent.livemode,
        publishableKey,
        finalAmount,
        appliedCouponCode,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    const errorMessage = error?.message || "Unknown error";
    // Only pass through known user-facing errors
    const userFacingPrefixes = ["Alle Pflichtfelder", "Diese E-Mail-Adresse", "Fehler bei", "STRIPE_SECRET_KEY", "Missing publishable"];
    const isSafe = userFacingPrefixes.some(p => errorMessage.startsWith(p));
    return new Response(
      JSON.stringify({ error: isSafe ? errorMessage : "Ein interner Fehler ist aufgetreten. Bitte versuche es erneut." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

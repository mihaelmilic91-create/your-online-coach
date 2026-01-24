import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
    const { email, firstName, lastName, billingAddress, password } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      throw new Error("Missing required fields");
    }

    // Initialize Supabase with service role to access pending_registrations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if email already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === email);
    if (emailExists) {
      throw new Error("Diese E-Mail-Adresse ist bereits registriert");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer record exists for this email
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create a new customer
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

    // Store pending registration (password stored temporarily - will be used after payment)
    const { data: pendingReg, error: pendingError } = await supabaseAdmin
      .from('pending_registrations')
      .insert({
        email: email,
        password_hash: password, // Will be used to create account after payment
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

    // Get origin for redirect URLs - fallback to production URL if not available
    const origin = req.headers.get("origin") || "https://coach-from-scratch.lovable.app";

    // Create a one-time payment session for the yearly access
    // Let Stripe automatically enable available payment methods based on currency and customer location
    // This includes: Card, TWINT, Apple Pay, Google Pay, and other Swiss payment methods
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: "price_1RwI39DdM2PPWMJrRNcHkV11",
          quantity: 1,
        },
      ],
      mode: "payment",
      // Don't specify payment_method_types to let Stripe auto-detect best options
      // Apple Pay and Google Pay work automatically when card is enabled
      // TWINT is auto-enabled for CHF transactions in Switzerland
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&registration_id=${pendingReg.id}`,
      cancel_url: `${origin}/checkout?payment=canceled`,
      metadata: {
        registration_id: pendingReg.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
      },
    });

    // Update pending registration with session ID
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

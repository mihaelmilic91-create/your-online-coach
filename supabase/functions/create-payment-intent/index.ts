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
    const { email, firstName, lastName, billingAddress, password } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !password || !billingAddress) {
      throw new Error("Alle Pflichtfelder müssen ausgefüllt sein.");
    }

    // Create Supabase admin client to check for existing users
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if email already exists in auth.users
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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

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

    // Store pending registration
    const { error: insertError } = await supabaseAdmin
      .from("pending_registrations")
      .upsert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: password, // Will be hashed by Supabase Auth during actual registration
        billing_address: billingAddress,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }, {
        onConflict: "email",
      });

    if (insertError) {
      console.error("Error storing pending registration:", insertError);
      throw new Error("Fehler beim Speichern der Registrierung.");
    }

    // Create PaymentIntent for CHF 79.00
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 7900, // CHF 79.00 in cents
      currency: "chf",
      customer: customer.id,
      // Enable automatic payment methods - Stripe will show best options
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email,
        firstName,
        lastName,
        product: "Online Drivecoach - Jahreslizenz",
      },
    });

    // Update pending registration with payment intent ID
    await supabaseAdmin
      .from("pending_registrations")
      .update({ stripe_session_id: paymentIntent.id })
      .eq("email", email);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

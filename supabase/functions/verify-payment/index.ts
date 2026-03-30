import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Helper: poll Stripe PaymentIntent until it leaves "processing" status
async function waitForPaymentIntent(stripe: Stripe, paymentIntentId: string, maxAttempts = 10, delayMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`Poll attempt ${i + 1}: status = ${pi.status}`);
    if (pi.status !== "processing") {
      return pi;
    }
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  // Return the last state even if still processing
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_intent_id, session_id, registration_id } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");

    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let paymentStatus: string;
    let email: string;
    let firstName: string;
    let lastName: string;
    let existingUserId: string | null = null;

    // Handle PaymentIntent (embedded checkout)
    if (payment_intent_id) {
      // Poll for payment completion (handles async methods like TWINT)
      const paymentIntent = await waitForPaymentIntent(stripe, payment_intent_id);
      
      if (paymentIntent.status !== "succeeded") {
        console.error(`Payment not completed. Status: ${paymentIntent.status}`);
        throw new Error(`Zahlung nicht abgeschlossen (Status: ${paymentIntent.status}). Bitte versuche es erneut.`);
      }

      email = paymentIntent.metadata.email;
      firstName = paymentIntent.metadata.firstName;
      lastName = paymentIntent.metadata.lastName;
      existingUserId = paymentIntent.metadata.existingUserId || null;
      paymentStatus = paymentIntent.status;

      // Increment coupon usage if a coupon was applied
      const couponCode = paymentIntent.metadata.couponCode;
      if (couponCode) {
        const { data: coupon } = await supabaseAdmin
          .from("coupons")
          .select("id, current_uses")
          .eq("code", couponCode)
          .single();

        if (coupon) {
          await supabaseAdmin
            .from("coupons")
            .update({ current_uses: coupon.current_uses + 1 })
            .eq("id", coupon.id)
            .eq("current_uses", coupon.current_uses);
          console.log(`Coupon ${couponCode} usage incremented`);
        }
      }

      console.log("PaymentIntent verified:", { email, firstName, existingUserId });

    // Handle legacy Checkout Session
    } else if (session_id && registration_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      // Get pending registration
      const { data: pendingReg, error: fetchError } = await supabaseAdmin
        .from('pending_registrations')
        .select('*')
        .eq('id', registration_id)
        .eq('stripe_session_id', session_id)
        .is('completed_at', null)
        .single();

      if (fetchError || !pendingReg) {
        console.error("Pending registration not found:", fetchError);
        throw new Error("Registration not found or already completed");
      }

      email = pendingReg.email;
      firstName = pendingReg.first_name;
      lastName = pendingReg.last_name;
      paymentStatus = session.payment_status;
    } else {
      throw new Error("Missing payment_intent_id or session_id");
    }

    // Calculate access_until (1 year from now)
    const accessUntil = new Date();
    accessUntil.setFullYear(accessUntil.getFullYear() + 1);

    // Handle existing user (just update access)
    if (existingUserId) {
      console.log("Updating access for existing user:", existingUserId);
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ access_until: accessUntil.toISOString() })
        .eq('user_id', existingUserId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw new Error("Fehler beim Aktualisieren des Zugangs");
      }

      return new Response(JSON.stringify({ 
        success: true,
        isExistingUser: true,
        email,
        firstName,
        lastName,
        accessUntil: accessUntil.toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle new user - get pending registration
    const { data: pendingReg, error: pendingError } = await supabaseAdmin
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pendingError || !pendingReg) {
      console.error("Pending registration not found for new user:", pendingError);
      throw new Error("Registrierung nicht gefunden");
    }

    // Store the original password before creating user (for auto-login)
    const originalPassword = pendingReg.password_hash;

    // Create the user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: pendingReg.email,
      password: originalPassword,
      email_confirm: true,
      user_metadata: {
        display_name: `${pendingReg.first_name} ${pendingReg.last_name}`,
      },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      throw new Error("Fehler beim Erstellen des Kontos: " + authError.message);
    }

    // Update profile with access_until date
    if (authData.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await supabaseAdmin
        .from('profiles')
        .update({ 
          access_until: accessUntil.toISOString(),
          display_name: `${pendingReg.first_name} ${pendingReg.last_name}`,
        })
        .eq('user_id', authData.user.id);
    }

    // Mark pending registration as completed
    await supabaseAdmin
      .from('pending_registrations')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', pendingReg.id);

    // Return tempPassword for auto-login on frontend
    return new Response(JSON.stringify({ 
      success: true,
      isExistingUser: false,
      email: pendingReg.email,
      firstName: pendingReg.first_name,
      lastName: pendingReg.last_name,
      accessUntil: accessUntil.toISOString(),
      tempPassword: originalPassword, // For auto-login
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    // Return user-facing validation errors, sanitize system errors
    const userFacingPrefixes = ["Zahlung nicht abgeschlossen", "Registrierung nicht gefunden", "Fehler beim"];
    const isSafe = userFacingPrefixes.some(p => errorMessage.startsWith(p));
    return new Response(JSON.stringify({ error: isSafe ? errorMessage : "Ein interner Fehler ist aufgetreten. Bitte versuche es erneut." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

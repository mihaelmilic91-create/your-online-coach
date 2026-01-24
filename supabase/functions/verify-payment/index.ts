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
    const { session_id, registration_id } = await req.json();

    if (!session_id || !registration_id) {
      throw new Error("Missing session_id or registration_id");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    // Create the user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: pendingReg.email,
      password: pendingReg.password_hash,
      email_confirm: true, // Auto-confirm since they paid
      user_metadata: {
        display_name: `${pendingReg.first_name} ${pendingReg.last_name}`,
      },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      throw new Error("Fehler beim Erstellen des Kontos: " + authError.message);
    }

    // Calculate access_until (1 year from now)
    const accessUntil = new Date();
    accessUntil.setFullYear(accessUntil.getFullYear() + 1);

    // Update profile with access_until date
    if (authData.user) {
      await supabaseAdmin
        .from('profiles')
        .update({ access_until: accessUntil.toISOString() })
        .eq('user_id', authData.user.id);
    }

    // Mark pending registration as completed
    await supabaseAdmin
      .from('pending_registrations')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', registration_id);

    // Return success with user info
    return new Response(JSON.stringify({ 
      success: true,
      email: pendingReg.email,
      firstName: pendingReg.first_name,
      lastName: pendingReg.last_name,
      accessUntil: accessUntil.toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

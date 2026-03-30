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
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.email) {
      // Fallback to getUser if getClaims fails
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !userData.user?.email) {
        throw new Error("User not authenticated");
      }
      var userEmail = userData.user.email;
    } else {
      var userEmail = claimsData.claims.email as string;
    }
    console.log("Fetching billing info for:", userEmail);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");

    // Find customer by email
    const customers = await stripe.customers.list({ 
      email: userEmail, 
      limit: 1 
    });

    if (customers.data.length === 0) {
      console.log("No Stripe customer found for:", userEmail);
      return new Response(JSON.stringify({ 
        payments: [],
        hasPaymentMethod: false,
        portalUrl: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("Found customer:", customerId);

    // Get payment intents (charges) for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 20,
    });

    // Get invoices for this customer (they contain invoice PDF links)
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
    });

    // Also get charges directly (for one-time payments without invoices)
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 20,
    });

    // Build payments array from charges
    const payments = charges.data
      .filter((charge: Stripe.Charge) => charge.status === "succeeded")
      .map((charge: Stripe.Charge) => {
        // Try to find matching invoice
        const invoice = invoices.data.find((inv: Stripe.Invoice) => 
          inv.charge === charge.id || inv.payment_intent === charge.payment_intent
        );

        return {
          id: charge.id,
          amount: charge.amount / 100, // Convert cents to CHF
          currency: charge.currency.toUpperCase(),
          date: new Date(charge.created * 1000).toISOString(),
          description: charge.description || "Jahreszugang Online DriveCoach",
          status: charge.status,
          receiptUrl: charge.receipt_url,
          invoiceUrl: invoice?.invoice_pdf || null,
          invoiceNumber: invoice?.number || null,
        };
      });

    // Check for payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });

    const hasPaymentMethod = paymentMethods.data.length > 0;

    // Create customer portal URL
    const origin = req.headers.get("origin") || "https://coach-from-scratch.lovable.app";
    let portalUrl = null;
    
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/dashboard`,
      });
      portalUrl = portalSession.url;
    } catch (portalError) {
      console.log("Could not create portal session:", portalError);
    }

    console.log(`Found ${payments.length} payments for customer`);

    return new Response(JSON.stringify({ 
      payments,
      hasPaymentMethod,
      portalUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error fetching billing info:", error);
    return new Response(JSON.stringify({ error: "Ein interner Fehler ist aufgetreten." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

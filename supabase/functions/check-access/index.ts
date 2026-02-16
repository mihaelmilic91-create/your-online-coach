import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;

    // Get profile with access_until
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('access_until, display_name')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Profil nicht gefunden");
    }

    // Check if access is still valid
    const now = new Date();
    const accessUntil = profile.access_until ? new Date(profile.access_until) : null;
    const hasAccess = accessUntil ? accessUntil > now : false;

    return new Response(JSON.stringify({ 
      hasAccess,
      accessUntil: profile.access_until,
      displayName: profile.display_name,
      daysRemaining: accessUntil ? Math.max(0, Math.ceil((accessUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error checking access:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage, hasAccess: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
});

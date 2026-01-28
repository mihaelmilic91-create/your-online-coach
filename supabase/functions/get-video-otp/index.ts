import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VDOCIPHER_API_URL = "https://dev.vdocipher.com/api";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VDOCIPHER_API_SECRET = Deno.env.get("VDOCIPHER_API_SECRET");
    if (!VDOCIPHER_API_SECRET) {
      throw new Error("VDOCIPHER_API_SECRET is not configured");
    }

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

    // Check if user is admin OR has valid access
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleData;

    if (!isAdmin) {
      // Check access_until for regular users
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("access_until")
        .eq("user_id", userId)
        .single();

      if (!profile?.access_until || new Date(profile.access_until) < new Date()) {
        throw new Error("Access expired or not available");
      }
    }

    // Get video ID from request body
    const { videoId } = await req.json();
    
    if (!videoId) {
      throw new Error("Video ID is required");
    }

    // Generate OTP from VdoCipher
    const response = await fetch(`${VDOCIPHER_API_URL}/videos/${videoId}/otp`, {
      method: "POST",
      headers: {
        "Authorization": `Apisecret ${VDOCIPHER_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ttl: 300, // 5 minutes validity
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VdoCipher API error:", response.status, errorText);
      throw new Error(`VdoCipher API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      otp: data.otp,
      playbackInfo: data.playbackInfo,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error generating video OTP:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
});

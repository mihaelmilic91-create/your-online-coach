import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VDOCIPHER_API_URL = "https://dev.vdocipher.com/api";

// The welcome video ID that is publicly accessible
const WELCOME_VIDEO_VDOCIPHER_ID = "fbe405996ffd475393cd737d4a1bed37";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VDOCIPHER_API_SECRET = Deno.env.get("VDOCIPHER_API_SECRET");
    if (!VDOCIPHER_API_SECRET) {
      throw new Error("VDOCIPHER_API_SECRET is not configured");
    }

    const { videoId } = await req.json();

    // Only allow the welcome video to be played publicly
    if (videoId !== WELCOME_VIDEO_VDOCIPHER_ID) {
      return new Response(JSON.stringify({ error: "This video is not publicly available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Generate OTP from VdoCipher
    const response = await fetch(`${VDOCIPHER_API_URL}/videos/${videoId}/otp`, {
      method: "POST",
      headers: {
        "Authorization": `Apisecret ${VDOCIPHER_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: 300 }),
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
    console.error("Error generating public video OTP:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

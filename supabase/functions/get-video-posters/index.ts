import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VDOCIPHER_API_URL = "https://dev.vdocipher.com/api";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VDOCIPHER_API_SECRET = Deno.env.get("VDOCIPHER_API_SECRET");
    if (!VDOCIPHER_API_SECRET) {
      throw new Error("VDOCIPHER_API_SECRET is not configured");
    }

    const { videoIds } = await req.json();
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      throw new Error("videoIds array is required");
    }

    // Fetch poster URLs for all videos in parallel
    const posterPromises = videoIds.map(async (videoId: string) => {
      try {
        const response = await fetch(`${VDOCIPHER_API_URL}/meta/${videoId}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Apisecret ${VDOCIPHER_API_SECRET}`,
          },
        });

        if (!response.ok) {
          console.error(`VdoCipher meta error for ${videoId}:`, response.status);
          return { videoId, posterUrl: null };
        }

        const data = await response.json();
        // Get the highest quality poster
        const posters = data.posters || [];
        const bestPoster = posters.length > 0 ? posters[posters.length - 1] : null;
        
        return { videoId, posterUrl: bestPoster?.url || null };
      } catch (err) {
        console.error(`Error fetching poster for ${videoId}:`, err);
        return { videoId, posterUrl: null };
      }
    });

    const results = await Promise.all(posterPromises);
    
    // Convert to a map for easy lookup
    const posterMap: Record<string, string | null> = {};
    results.forEach(r => { posterMap[r.videoId] = r.posterUrl; });

    return new Response(JSON.stringify({ posters: posterMap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error fetching video posters:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

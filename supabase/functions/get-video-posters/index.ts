import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

const VDOCIPHER_API_URL = "https://dev.vdocipher.com/api";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VDOCIPHER_API_SECRET = Deno.env.get("VDOCIPHER_API_SECRET");
    if (!VDOCIPHER_API_SECRET) {
      throw new Error("VDOCIPHER_API_SECRET is not configured");
    }

    const body = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Support both legacy videoIds mode and new categoryIds mode
    let videoIdsToPosterUrl: { videoId: string; categoryId?: string }[] = [];

    if (body.categoryIds && Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
      // New mode: look up first video per category server-side

      const { data: videos } = await supabaseAdmin
        .from("videos")
        .select("category_id, vdocipher_video_id")
        .eq("is_published", true)
        .in("category_id", body.categoryIds)
        .order("sort_order", { ascending: true });

      // Get first video per category
      const seen = new Set<string>();
      for (const v of videos || []) {
        if (!seen.has(v.category_id)) {
          seen.add(v.category_id);
          videoIdsToPosterUrl.push({ videoId: v.vdocipher_video_id, categoryId: v.category_id });
        }
      }
    } else if (body.videoIds && Array.isArray(body.videoIds) && body.videoIds.length > 0) {
      // Legacy mode: direct video IDs
      videoIdsToPosterUrl = body.videoIds.map((id: string) => ({ videoId: id }));
    } else {
      throw new Error("categoryIds or videoIds array is required");
    }

    // Fetch poster URLs for all videos in parallel
    const posterPromises = videoIdsToPosterUrl.map(async ({ videoId, categoryId }) => {
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
          return { videoId, categoryId, posterUrl: null };
        }

        const data = await response.json();
        const posters = data.posters || [];
        const bestPoster = posters.length > 0 ? posters[posters.length - 1] : null;
        
        return { videoId, categoryId, posterUrl: bestPoster?.url || null };
      } catch (err) {
        console.error(`Error fetching poster for ${videoId}:`, err);
        return { videoId, categoryId, posterUrl: null };
      }
    });

    const results = await Promise.all(posterPromises);
    
    // Build response based on mode
    if (body.categoryIds) {
      // Return keyed by categoryId, include video counts
      const posterMap: Record<string, string | null> = {};
      results.forEach(r => { if (r.categoryId) posterMap[r.categoryId] = r.posterUrl; });

      // Count videos per category
      const { data: allVids } = await supabaseAdmin
        .from("videos")
        .select("category_id")
        .eq("is_published", true)
        .in("category_id", body.categoryIds);

      const countMap: Record<string, number> = {};
      allVids?.forEach(v => {
        countMap[v.category_id] = (countMap[v.category_id] || 0) + 1;
      });

      return new Response(JSON.stringify({ posters: posterMap, counts: countMap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Legacy: keyed by videoId
      const posterMap: Record<string, string | null> = {};
      results.forEach(r => { posterMap[r.videoId] = r.posterUrl; });
      return new Response(JSON.stringify({ posters: posterMap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error: unknown) {
    console.error("Error fetching video posters:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

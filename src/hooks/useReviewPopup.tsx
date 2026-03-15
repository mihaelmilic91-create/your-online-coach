import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewPopupState {
  shouldShow: boolean;
  loading: boolean;
}

export const useReviewPopup = (userId: string | undefined): ReviewPopupState => {
  const [shouldShow, setShouldShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkConditions = async () => {
      try {
        // Check popup tracking first
        const { data: tracking } = await supabase
          .from("review_popup_tracking")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        // If completed within last 6 months, don't show
        if (tracking?.last_completed_at) {
          const completedAt = new Date(tracking.last_completed_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          if (completedAt > sixMonthsAgo) {
            setLoading(false);
            return;
          }
        }

        // If dismissed recently (within 7 days), don't show
        if (tracking?.last_dismissed_at) {
          const dismissedAt = new Date(tracking.last_dismissed_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          if (dismissedAt > sevenDaysAgo) {
            setLoading(false);
            return;
          }
        }

        const dismissCount = tracking?.dismiss_count || 0;

        // Get user's watched video count
        const { count: watchedCount } = await supabase
          .from("video_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // Get total published videos count
        const { count: totalVideos } = await supabase
          .from("videos")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true);

        // Get user profile for registration date
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("user_id", userId)
          .maybeSingle();

        const watched = watchedCount || 0;
        const total = totalVideos || 30;

        // Condition checks
        const threshold = dismissCount > 0 ? 7 : 3;
        const hasWatchedEnough = watched >= threshold;
        const hasWatchedHalf = total > 0 && watched >= total * 0.5;

        let accountAge21Days = false;
        if (profile?.created_at) {
          const created = new Date(profile.created_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          accountAge21Days = diffDays >= 21;
        }

        if (hasWatchedEnough || hasWatchedHalf || accountAge21Days) {
          setShouldShow(true);
        }
      } catch (err) {
        console.error("Error checking review popup conditions:", err);
      } finally {
        setLoading(false);
      }
    };

    // Delay check by 3 seconds after dashboard loads
    const timer = setTimeout(checkConditions, 3000);
    return () => clearTimeout(timer);
  }, [userId]);

  return { shouldShow, loading };
};

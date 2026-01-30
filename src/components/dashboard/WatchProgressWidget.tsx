import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface WatchProgressWidgetProps {
  totalVideos: number;
  userId: string;
}

const WatchProgressWidget = ({ totalVideos, userId }: WatchProgressWidgetProps) => {
  const [watchedCount, setWatchedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { count, error } = await supabase
          .from("video_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gt("watch_count", 0);

        if (error) throw error;
        setWatchedCount(count || 0);
      } catch (err) {
        console.error("Error fetching watch progress:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  const percentage = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

  const getMessage = () => {
    if (percentage === 0) return "Starte jetzt mit dem ersten Video!";
    if (percentage < 25) return "Guter Anfang! Bleib dran.";
    if (percentage < 50) return "Du machst Fortschritte!";
    if (percentage < 75) return "Super! Mehr als die Hälfte geschafft.";
    if (percentage < 100) return "Fast fertig! Du schaffst das!";
    return "Alle Videos angesehen! 🎉";
  };

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          Lernfortschritt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* Progress Circle */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    className="text-muted"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="text-accent transition-all duration-500"
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                    strokeDasharray={`${percentage * 2.136} 213.6`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{percentage}%</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {watchedCount} / {totalVideos} Videos
                  </span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  {getMessage()}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchProgressWidget;

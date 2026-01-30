import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface RecentVideo {
  id: string;
  videoId: string;
  title: string;
  duration: string | null;
  watchedAt: string;
  watchCount: number;
}

interface RecentVideosWidgetProps {
  userId: string;
}

const RecentVideosWidget = ({ userId }: RecentVideosWidgetProps) => {
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentVideos = async () => {
      try {
        const { data: progressData, error: progressError } = await supabase
          .from("video_progress")
          .select("id, video_id, watched_at, watch_count")
          .eq("user_id", userId)
          .order("watched_at", { ascending: false })
          .limit(5);

        if (progressError) throw progressError;

        if (progressData && progressData.length > 0) {
          const videoIds = progressData.map(p => p.video_id);
          
          const { data: videosData, error: videosError } = await supabase
            .from("videos")
            .select("id, title, duration")
            .in("id", videoIds);

          if (videosError) throw videosError;

          const combined = progressData.map(progress => {
            const video = videosData?.find(v => v.id === progress.video_id);
            return {
              id: progress.id,
              videoId: progress.video_id,
              title: video?.title || "Unbekanntes Video",
              duration: video?.duration,
              watchedAt: progress.watched_at,
              watchCount: progress.watch_count,
            };
          });

          setRecentVideos(combined);
        }
      } catch (err) {
        console.error("Error fetching recent videos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecentVideos();
    }
  }, [userId]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays === 1) return "gestern";
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
  };

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-accent" />
          Zuletzt angesehen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : recentVideos.length === 0 ? (
          <div className="text-center py-6">
            <Play className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              Du hast noch keine Videos angesehen
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/lernvideos">
                <Play className="w-4 h-4 mr-2" />
                Jetzt starten
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentVideos.map((video) => (
              <Link
                key={video.id}
                to={`/video/${video.videoId}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Play className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate text-sm">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </span>
                    )}
                    <span>•</span>
                    <span>{formatTimeAgo(video.watchedAt)}</span>
                    {video.watchCount > 1 && (
                      <>
                        <span>•</span>
                        <span>{video.watchCount}x</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentVideosWidget;

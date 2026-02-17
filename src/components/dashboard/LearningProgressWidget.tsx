import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, History, LogIn, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface RecentVideo {
  id: string;
  videoId: string;
  title: string;
  duration: string | null;
  watchedAt: string;
  watchCount: number;
}

interface LearningProgressWidgetProps {
  userId: string;
  totalVideos: number;
}

const LearningProgressWidget = ({ userId, totalVideos }: LearningProgressWidgetProps) => {
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysSinceLogin, setDaysSinceLogin] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent videos
        const { data: progressData, error: progressError } = await supabase
          .from("video_progress")
          .select("id, video_id, watched_at, watch_count")
          .eq("user_id", userId)
          .order("watched_at", { ascending: false })
          .limit(4);

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

        // Calculate days since last login
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.last_sign_in_at) {
          const lastLogin = new Date(session.user.last_sign_in_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / 86400000);
          setDaysSinceLogin(diffDays);
        } else {
          setDaysSinceLogin(0);
        }
      } catch (err) {
        console.error("Error fetching learning progress:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
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

  if (loading) {
    return (
      <Card className="bg-card shadow-soft">
        <CardContent className="p-6">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-soft">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader className="pb-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Letzter Login</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Zuletzt</span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* Login Counter Tab */}
          <TabsContent value="login" className="mt-0">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-3xl font-bold text-foreground">
                  {daysSinceLogin === 0
                    ? "Heute"
                    : daysSinceLogin === 1
                    ? "Gestern"
                    : daysSinceLogin !== null
                    ? `vor ${daysSinceLogin} Tagen`
                    : "–"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {daysSinceLogin === 0
                    ? "Heute eingeloggt"
                    : "Letzter Login"}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Recent Videos Tab */}
          <TabsContent value="recent" className="mt-0">
            {recentVideos.length === 0 ? (
              <div className="text-center py-4">
                <Play className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm mb-3">
                  Noch keine Videos angesehen
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/lernvideos">
                    <Play className="w-4 h-4 mr-2" />
                    Jetzt starten
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentVideos.map((video) => (
                  <Link
                    key={video.id}
                    to={`/video/${video.videoId}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Play className="w-3.5 h-3.5 text-accent" />
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
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default LearningProgressWidget;

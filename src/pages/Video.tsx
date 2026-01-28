import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import VdoCipherPlayer from "@/components/VdoCipherPlayer";
import logo from "@/assets/logo.png";

interface VideoItem {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  vdocipher_video_id: string;
  duration: string | null;
  sort_order: number;
}

interface Category {
  id: string;
  title: string;
}

const VideoPage = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      const isAdmin = !!roleData;

      if (!isAdmin) {
        // Check access for regular users
        try {
          const { data, error: fnError } = await supabase.functions.invoke("check-access");
          if (fnError || !data?.hasAccess) {
            setError("Kein Zugang");
            setLoading(false);
            return;
          }
        } catch {
          setError("Zugriffsfehler");
          setLoading(false);
          return;
        }
      }

      setHasAccess(true);

      // Load video
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (videoError || !videoData) {
        setError("Video nicht gefunden");
        setLoading(false);
        return;
      }

      setVideo(videoData);

      // Load category
      const { data: categoryData } = await supabase
        .from("video_categories")
        .select("id, title")
        .eq("id", videoData.category_id)
        .single();

      if (categoryData) {
        setCategory(categoryData);
      }

      // Load all videos in category for navigation
      const { data: allVideosData } = await supabase
        .from("videos")
        .select("*")
        .eq("category_id", videoData.category_id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      setAllVideos(allVideosData || []);
      setLoading(false);
    };

    loadVideo();
  }, [videoId, navigate]);

  const currentIndex = allVideos.findIndex(v => v.id === videoId);
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !hasAccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{error || "Kein Zugang"}</h1>
        <p className="text-muted-foreground mb-6">Du hast keinen Zugang zu diesem Video.</p>
        <Button variant="hero" onClick={() => navigate("/dashboard")}>
          Zurück zum Dashboard
        </Button>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Video nicht gefunden</h1>
        <Button variant="hero" onClick={() => navigate("/dashboard")}>
          Zurück zum Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Online DriveCoach" className="h-10" />
              </Link>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
                Lernvideos
              </Link>
              {category && (
                <>
                  <span className="text-muted-foreground hidden sm:inline">/</span>
                  <span className="text-foreground font-medium hidden sm:inline">{category.title}</span>
                </>
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Zurück</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Video Player */}
          <VdoCipherPlayer
            videoId={video.vdocipher_video_id}
            className="mb-6"
            onEnded={() => {
              if (nextVideo) {
                navigate(`/video/${nextVideo.id}`);
              }
            }}
          />

          {/* Video Info */}
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {video.title}
            </h1>
            {video.description && (
              <p className="text-muted-foreground">{video.description}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            {prevVideo ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/video/${prevVideo.id}`)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{prevVideo.title}</span>
                <span className="sm:hidden">Vorheriges</span>
              </Button>
            ) : (
              <div />
            )}
            
            {nextVideo ? (
              <Button 
                variant="hero" 
                onClick={() => navigate(`/video/${nextVideo.id}`)}
                className="gap-2"
              >
                <span className="hidden sm:inline">{nextVideo.title}</span>
                <span className="sm:hidden">Nächstes</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="hero" 
                onClick={() => navigate("/dashboard")}
              >
                Alle Videos ansehen
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default VideoPage;

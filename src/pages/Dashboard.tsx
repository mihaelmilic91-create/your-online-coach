import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, LogOut, User, Clock, Video, AlertTriangle, Calendar, FolderOpen, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import VdoCipherPlayer from "@/components/VdoCipherPlayer";
import logo from "@/assets/logo.png";

interface Category {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
}

interface VideoItem {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  vdocipher_video_id: string;
  duration: string | null;
  is_published: boolean;
  sort_order: number;
}

interface AccessInfo {
  hasAccess: boolean;
  accessUntil: string | null;
  displayName: string | null;
  daysRemaining: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Video player state
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      const userIsAdmin = !!roleData;
      setIsAdmin(userIsAdmin);

      // Admins always have access
      if (userIsAdmin) {
        setAccessInfo({ 
          hasAccess: true, 
          accessUntil: null, 
          displayName: session.user.user_metadata?.display_name || "Admin", 
          daysRemaining: 999 
        });
        setCheckingAccess(false);
      } else {
        // Check access for regular users
        try {
          const { data, error } = await supabase.functions.invoke("check-access");
          
          if (error) {
            console.error("Error checking access:", error);
            setAccessInfo({ hasAccess: false, accessUntil: null, displayName: null, daysRemaining: 0 });
          } else {
            setAccessInfo(data);
          }
        } catch (err) {
          console.error("Error checking access:", err);
          setAccessInfo({ hasAccess: false, accessUntil: null, displayName: null, daysRemaining: 0 });
        } finally {
          setCheckingAccess(false);
        }
      }

      // Load categories
      const { data: categoriesData } = await supabase
        .from("video_categories")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      const loadedCategories = categoriesData || [];
      setCategories(loadedCategories);
      
      // Auto-select first category if available
      if (loadedCategories.length > 0) {
        setSelectedCategory(loadedCategories[0]);
        // Load videos for first category
        const { data: videosData } = await supabase
          .from("videos")
          .select("*")
          .eq("category_id", loadedCategories[0].id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true });
        setVideos(videosData || []);
      }
      
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadVideosForCategory = async (category: Category) => {
    setSelectedCategory(category);
    const { data: videosData } = await supabase
      .from("videos")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    setVideos(videosData || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video);
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  const handleVideoEnded = () => {
    // Find next video in list
    if (playingVideo) {
      const currentIndex = videos.findIndex(v => v.id === playingVideo.id);
      if (currentIndex < videos.length - 1) {
        setPlayingVideo(videos[currentIndex + 1]);
      } else {
        setPlayingVideo(null);
      }
    }
  };

  const handlePrevVideo = () => {
    if (playingVideo) {
      const currentIndex = videos.findIndex(v => v.id === playingVideo.id);
      if (currentIndex > 0) {
        setPlayingVideo(videos[currentIndex - 1]);
      }
    }
  };

  const handleNextVideo = () => {
    if (playingVideo) {
      const currentIndex = videos.findIndex(v => v.id === playingVideo.id);
      if (currentIndex < videos.length - 1) {
        setPlayingVideo(videos[currentIndex + 1]);
      }
    }
  };

  const currentVideoIndex = playingVideo ? videos.findIndex(v => v.id === playingVideo.id) : -1;
  const hasPrevVideo = currentVideoIndex > 0;
  const hasNextVideo = currentVideoIndex < videos.length - 1;

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  // No access - show upgrade prompt
  if (!accessInfo?.hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-soft border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <img src={logo} alt="Online DriveCoach" className="h-10" />
              </a>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Kein aktiver Zugang
            </h1>
            <p className="text-muted-foreground mb-8">
              {accessInfo?.accessUntil 
                ? "Dein Jahreszugang ist abgelaufen. Erneuere deinen Zugang, um weiter zu lernen."
                : "Du hast noch keinen Zugang zu den Kursen. Kaufe jetzt den Jahreszugang."}
            </p>
            <Button asChild size="lg" variant="hero">
              <Link to="/checkout">
                Zugang kaufen
              </Link>
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const displayName = accessInfo?.displayName || user?.user_metadata?.display_name || "Benutzer";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="Online DriveCoach" className="h-10" />
            </a>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  Admin
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <User className="w-5 h-5" />
                <span>{displayName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          >
            {/* Player Header */}
            <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="Online DriveCoach" className="h-8" />
                <div className="hidden sm:block">
                  <p className="text-white/60 text-sm">{selectedCategory?.title}</p>
                  <h2 className="text-white font-semibold truncate max-w-md">{playingVideo.title}</h2>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClosePlayer}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Video Player */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-6xl">
                <VdoCipherPlayer
                  videoId={playingVideo.vdocipher_video_id}
                  className="w-full"
                  onEnded={handleVideoEnded}
                />
              </div>
            </div>

            {/* Player Footer with Navigation */}
            <div className="bg-black/50 backdrop-blur-sm border-t border-white/10 px-4 py-4">
              <div className="max-w-6xl mx-auto">
                {/* Mobile title */}
                <div className="sm:hidden mb-3">
                  <p className="text-white/60 text-sm">{selectedCategory?.title}</p>
                  <h2 className="text-white font-semibold">{playingVideo.title}</h2>
                </div>
                
                {playingVideo.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{playingVideo.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevVideo}
                    disabled={!hasPrevVideo}
                    className="gap-2 border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Vorheriges Video</span>
                    <span className="sm:hidden">Zurück</span>
                  </Button>
                  
                  <span className="text-white/60 text-sm">
                    {currentVideoIndex + 1} / {videos.length}
                  </span>

                  <Button
                    variant="outline"
                    onClick={handleNextVideo}
                    disabled={!hasNextVideo}
                    className="gap-2 border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <span className="hidden sm:inline">Nächstes Video</span>
                    <span className="sm:hidden">Weiter</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Willkommen, {displayName}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Wähle ein Video und drücke Play, um mit dem Lernen zu beginnen.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <Card className="bg-card shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Kategorien</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">30+</p>
                <p className="text-sm text-muted-foreground">Lernvideos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {accessInfo?.daysRemaining === 999 ? "∞" : accessInfo?.daysRemaining || 0}
                </p>
                <p className="text-sm text-muted-foreground">Tage verbleibend</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories and Videos */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-accent" />
              Kategorien
            </h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all ${
                    selectedCategory?.id === category.id 
                      ? 'ring-2 ring-accent shadow-elevated bg-accent/5' 
                      : 'hover:shadow-soft hover:bg-muted/50'
                  }`}
                  onClick={() => loadVideosForCategory(category)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{category.title}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {categories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Kategorien verfügbar.
                </p>
              )}
            </div>
          </motion.div>

          {/* Videos Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {selectedCategory ? (
              <>
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-accent" />
                  {selectedCategory.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <Card 
                        className="bg-card shadow-soft hover:shadow-elevated transition-all group cursor-pointer"
                        onClick={() => handlePlayVideo(video)}
                      >
                        <CardContent className="p-0">
                          {/* Video Thumbnail Placeholder */}
                          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
                              <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Play className="w-8 h-8 text-white ml-1" />
                              </div>
                            </div>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-accent px-4 py-2 rounded-full text-sm">
                                Jetzt ansehen
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                              {video.title}
                            </h3>
                            {video.duration && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {video.duration}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {videos.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Noch keine Videos in dieser Kategorie.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  Wähle eine Kategorie aus, um Videos anzuzeigen.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

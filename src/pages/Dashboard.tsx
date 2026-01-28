import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Lock, LogOut, User, Clock, Video, AlertTriangle, Calendar, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
      <header className="bg-card shadow-soft border-b border-border">
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
            Starte deine Lernreise und bereite dich auf die Autoprüfung vor.
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
                      <Card className="bg-card shadow-soft hover:shadow-elevated transition-all group">
                        <CardContent className="p-0">
                          {/* Video Thumbnail Placeholder */}
                          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
                              <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-white ml-1" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                              {video.title}
                            </h3>
                            {video.duration && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {video.duration}
                              </div>
                            )}
                            
                            <Button 
                              variant="hero" 
                              size="sm"
                              className="w-full mt-3"
                              asChild
                            >
                              <Link to={`/video/${video.id}`}>
                                Video ansehen
                              </Link>
                            </Button>
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

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, LogOut, User, Video, AlertTriangle, Calendar, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

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
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
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

      // Load counts
      const { count: catCount } = await supabase
        .from("video_categories")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      const { count: vidCount } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      setCategoriesCount(catCount || 0);
      setVideosCount(vidCount || 0);
      
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
                <p className="text-2xl font-bold text-foreground">{categoriesCount}</p>
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
                <p className="text-2xl font-bold text-foreground">{videosCount > 0 ? `${videosCount}+` : "30+"}</p>
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

        {/* Main Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 shadow-elevated overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Play className="w-12 h-12 md:w-16 md:h-16 text-accent ml-2" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Lernvideos ansehen
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6 max-w-xl">
                    Entdecke alle Lernvideos, die dir helfen, dich optimal auf die Fahrprüfung vorzubereiten. 
                    Klicke einfach auf Play und starte mit dem Lernen!
                  </p>
                  <Button asChild size="lg" variant="hero" className="gap-2">
                    <Link to="/lernvideos">
                      <Play className="w-5 h-5" />
                      Zu den Lernvideos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

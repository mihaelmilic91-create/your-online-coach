import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, LogOut, Video, AlertTriangle, Calendar, FolderOpen, LogIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ProfileWidget from "@/components/dashboard/ProfileWidget";
import OrdersWidget from "@/components/dashboard/OrdersWidget";
import UserAvatar from "@/components/dashboard/UserAvatar";
import AccessProgressBar from "@/components/dashboard/AccessProgressBar";
import LearningProgressWidget from "@/components/dashboard/LearningProgressWidget";
import WatchCompletionChart from "@/components/dashboard/WatchCompletionChart";
import SelfAssessmentChart from "@/components/dashboard/SelfAssessmentChart";
import logo from "@/assets/logo.png";
import { useSessionEnforcement } from "@/hooks/useSessionEnforcement";
import { useReviewPopup } from "@/hooks/useReviewPopup";
import ReviewPopup from "@/components/dashboard/ReviewPopup";

interface AccessInfo {
  hasAccess: boolean;
  accessUntil: string | null;
  displayName: string | null;
  daysRemaining: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 10) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // Enforce single active session
  useSessionEnforcement(user?.id, !isAdmin && !loading);

  // Review popup logic
  const { shouldShow: shouldShowReview } = useReviewPopup(user?.id);
  
  useEffect(() => {
    if (shouldShowReview && !loading && !checkingAccess && accessInfo?.hasAccess) {
      setShowReviewPopup(true);
    }
  }, [shouldShowReview, loading, checkingAccess, accessInfo?.hasAccess]);

  // Refresh session when tab becomes visible again (prevents infinite loading after tab switch)
 useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Token könnte gerade erneuert werden - kurz warten und nochmal prüfen
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            navigate("/login");
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Update last_active_at silently
      supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("user_id", session.user.id).then(() => {});

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
        const adminName = session.user.user_metadata?.display_name || "Admin";
        setAccessInfo({ 
          hasAccess: true, 
          accessUntil: null, 
          displayName: adminName, 
          daysRemaining: 999 
        });
        setDisplayName(adminName);
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
            setDisplayName(data.displayName || session.user.user_metadata?.display_name || "Benutzer");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact with Avatar */}
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="Online DriveCoach" className="h-9" />
            </a>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  Admin
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2">
                <UserAvatar name={displayName} size="sm" />
                <span className="text-sm font-medium text-foreground">{displayName}</span>
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
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Hero: Welcome + Circular Progress + Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl shadow-soft border border-border/60 overflow-hidden"
        >
          <div className="grid md:grid-cols-[1fr_auto] items-center gap-6 p-6 md:p-8">
            {/* Greeting + Ring on mobile stacked */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-footer mb-2">
                {getGreeting()}
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Hallo, {displayName}! 👋
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mb-5">
                Bereit für die nächste Lektion? Deine Lernreise wartet auf dich.
              </p>
              <Button asChild size="lg" variant="hero" className="gap-2 rounded-full">
                <Link to="/lernvideos">
                  <Play className="w-5 h-5" />
                  Weiter lernen
                </Link>
              </Button>
            </div>

            {/* Circular Access Ring */}
            <div className="flex justify-center order-1 md:order-2">
              {(() => {
                const isUnlimited = (accessInfo?.daysRemaining || 0) >= 999;
                const pct = isUnlimited ? 100 : Math.min(((accessInfo?.daysRemaining || 0) / 365) * 100, 100);
                const r = 56;
                const circ = 2 * Math.PI * r;
                const offset = circ - (pct / 100) * circ;
                return (
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-footer/10 via-accent/5 to-transparent">
                    <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                      <circle cx="70" cy="70" r={r} stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                      <circle
                        cx="70" cy="70" r={r}
                        stroke="hsl(var(--accent))"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground leading-none">
                          {isUnlimited ? "∞" : accessInfo?.daysRemaining || 0}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                          {isUnlimited ? "Zugang" : "Tage übrig"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Inline stat strip */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/30">
            <Link to="/lernvideos" className="group p-4 text-center hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center gap-2 text-accent mb-1">
                <FolderOpen className="w-4 h-4" />
                <span className="text-2xl font-bold text-foreground tabular-nums">{categoriesCount}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Kategorien</p>
            </Link>
            <Link to="/lernvideos" className="group p-4 text-center hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center gap-2 text-accent mb-1">
                <Video className="w-4 h-4" />
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {videosCount > 0 ? `${videosCount}+` : "30+"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Lernvideos</p>
            </Link>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {accessInfo?.daysRemaining === 999 ? "∞" : accessInfo?.daysRemaining || 0}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Tage</p>
            </div>
          </div>
        </motion.section>

        {/* Learning Progress Widget (full width on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <LearningProgressWidget userId={user?.id} totalVideos={videosCount || 30} />
        </motion.div>

        {/* Charts Row - Watch Completion & Self-Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <WatchCompletionChart userId={user?.id} totalVideos={videosCount || 30} />
          <SelfAssessmentChart userId={user?.id} />
        </motion.div>

        {/* Bottom Widgets Row - Profile, Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <ProfileWidget 
            user={user} 
            displayName={displayName} 
            onDisplayNameChange={setDisplayName}
          />
          <OrdersWidget />
        </motion.div>
      </main>

      {/* Review Popup */}
      {showReviewPopup && user && (
        <ReviewPopup
          userId={user.id}
          onClose={() => setShowReviewPopup(false)}
          onComplete={() => setShowReviewPopup(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

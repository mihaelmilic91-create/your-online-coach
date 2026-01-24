import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Lock, CheckCircle, LogOut, User, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  locked: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Placeholder courses - will be replaced with real data
  const courses: Course[] = [
    {
      id: "1",
      title: "Grundlagen",
      description: "Lerne die Grundlagen des Autofahrens: Sitzposition, Spiegel, Lenkrad und mehr.",
      duration: "45 Min",
      lessons: 8,
      progress: 0,
      locked: false,
    },
    {
      id: "2",
      title: "Parkieren",
      description: "Alle Parkmanöver erklärt: Längs, quer, vorwärts und rückwärts.",
      duration: "60 Min",
      lessons: 6,
      progress: 0,
      locked: false,
    },
    {
      id: "3",
      title: "Autobahn",
      description: "Sicher auf der Autobahn: Auffahren, Spurwechsel und Ausfahren.",
      duration: "30 Min",
      lessons: 5,
      progress: 0,
      locked: false,
    },
    {
      id: "4",
      title: "Kreuzungen",
      description: "Vorfahrtsregeln und richtiges Verhalten an Kreuzungen.",
      duration: "50 Min",
      lessons: 7,
      progress: 0,
      locked: true,
    },
    {
      id: "5",
      title: "Kreisverkehr",
      description: "Einfahren, Fahren und Ausfahren im Kreisverkehr.",
      duration: "25 Min",
      lessons: 4,
      progress: 0,
      locked: true,
    },
    {
      id: "6",
      title: "Prüfungsvorbereitung",
      description: "Alle wichtigen Themen für die praktische Prüfung.",
      duration: "90 Min",
      lessons: 12,
      progress: 0,
      locked: true,
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.user_metadata?.display_name || "Benutzer";

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
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5+ Std</p>
                <p className="text-sm text-muted-foreground">Lerninhalt</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-soft">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0%</p>
                <p className="text-sm text-muted-foreground">Abgeschlossen</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Deine Kurse
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Card className={`bg-card shadow-soft hover:shadow-elevated transition-all duration-300 ${course.locked ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {course.title}
                      </CardTitle>
                      {course.locked ? (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                          <Play className="w-4 h-4 text-accent-foreground ml-0.5" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {course.lessons} Videos
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fortschritt</span>
                        <span className="font-medium text-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <Button 
                      variant={course.locked ? "outline" : "hero"} 
                      className="w-full"
                      disabled={course.locked}
                    >
                      {course.locked ? "Bald verfügbar" : "Kurs starten"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;

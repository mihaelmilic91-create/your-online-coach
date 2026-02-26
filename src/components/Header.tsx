import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Video, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) fetchProfile(session.user.id);
    };

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("display_name, avatar_url").eq("user_id", userId).single();
      if (data) setProfile(data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    // Clear local state immediately so UI updates
    setIsLoggedIn(false);
    setProfile(null);
    
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore errors
    }
    
    // Force-clear all Supabase auth tokens from localStorage
    const keysToRemove = Object.keys(localStorage).filter(
      (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    
    window.location.href = "/";
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img 
            src={logo} 
            alt="Online DriveCoach" 
            className="h-10 md:h-12 w-auto"
          />
        </a>

        {/* Desktop Navigation - only for guests */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-8">
            <a href="#kurse" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Lernvideos
            </a>
            <a href="#vorteile" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Vorteile
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Erfahrungen
            </a>
          </nav>
        )}

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Button variant="hero" size="sm" asChild>
                <a href="/lernvideos">Zu den Lernvideos</a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border hover:ring-accent transition-all">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.display_name || "User"} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white text-xs font-semibold">
                        {getInitials(profile?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <a href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/lernvideos" className="flex items-center gap-2 cursor-pointer">
                      <Video className="w-4 h-4" /> Lernvideos
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" /> Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <a href="/login">Anmelden</a>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <a href="/zugang">Registrieren</a>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background border-t border-border"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <a href="/dashboard" className="text-foreground font-medium py-2 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </a>
                <a href="/lernvideos" className="text-foreground font-medium py-2 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Lernvideos
                </a>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button variant="hero" className="w-full" asChild>
                    <a href="/lernvideos">Zu den Lernvideos</a>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <a href="#kurse" className="text-foreground font-medium py-2">
                  Lernvideos
                </a>
                <a href="#vorteile" className="text-foreground font-medium py-2">
                  Vorteile
                </a>
                {/* <a href="#testimonials" className="text-foreground font-medium py-2">
                  Erfahrungen
                </a> – temporarily hidden, re-add with Testimonials */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button variant="ghost" className="w-full" asChild>
                    <a href="/login">Anmelden</a>
                  </Button>
                  <Button variant="hero" className="w-full" asChild>
                    <a href="/zugang">Registrieren</a>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;

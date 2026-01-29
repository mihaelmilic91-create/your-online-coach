import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Video, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>
              <a href="/lernvideos" className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2">
                <Video className="w-4 h-4" />
                Lernvideos
              </a>
            </>
          ) : (
            <>
              <a href="#kurse" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Lernvideos
              </a>
              <a href="#vorteile" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Vorteile
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Erfahrungen
              </a>
            </>
          )}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Button variant="hero" size="sm" asChild>
              <a href="/lernvideos">Zu den Lernvideos</a>
            </Button>
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
                <a href="#testimonials" className="text-foreground font-medium py-2">
                  Erfahrungen
                </a>
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

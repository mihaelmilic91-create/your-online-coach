import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Mail, ArrowRight, Loader2, PartyPopper, Calendar, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [userInfo, setUserInfo] = useState<{ 
    email: string; 
    firstName: string; 
    lastName: string;
    accessUntil: string;
    isExistingUser: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerConfetti = useCallback(() => {
    // Fire confetti from the left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
    });

    // Fire confetti from the right
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
    });

    // Fire confetti from the center after a delay
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#16a34a', '#22c55e', '#4ade80', '#fbbf24', '#f59e0b'],
      });
    }, 300);
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      // Check for free checkout (100% coupon)
      const isFreeCheckout = searchParams.get("free") === "true";
      
      if (isFreeCheckout) {
        // Free checkout - user is already created/updated, just show success
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData.session?.user;
        
        const accessUntil = new Date();
        accessUntil.setFullYear(accessUntil.getFullYear() + 1);
        
        setUserInfo({
          email: currentUser?.email || "",
          firstName: currentUser?.user_metadata?.display_name?.split(" ")[0] || "",
          lastName: currentUser?.user_metadata?.display_name?.split(" ")[1] || "",
          accessUntil: accessUntil.toISOString(),
          isExistingUser: false,
        });
        setStatus("success");
        setTimeout(triggerConfetti, 500);
        return;
      }

      // Check for PaymentIntent (embedded checkout)
      const paymentIntentId = searchParams.get("payment_intent");
      // Check for Checkout Session (legacy redirect)
      const sessionId = searchParams.get("session_id");
      const registrationId = searchParams.get("registration_id");

      if (!paymentIntentId && (!sessionId || !registrationId)) {
        setStatus("error");
        setErrorMessage("Fehlende Zahlungsinformationen");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: paymentIntentId 
            ? { payment_intent_id: paymentIntentId }
            : { session_id: sessionId, registration_id: registrationId },
        });

        if (error) {
          throw error;
        }

        if (data?.success) {
          setUserInfo({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            accessUntil: data.accessUntil,
            isExistingUser: data.isExistingUser || false,
          });
          setStatus("success");
          
          // Trigger confetti animation
          setTimeout(triggerConfetti, 500);

          // Auto-login for new users using the temp password from pending registration
          if (!data.isExistingUser && data.tempPassword) {
            console.log("Auto-login: Attempting to sign in new user...");
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.tempPassword,
            });
            
            if (signInError) {
              console.error("Auto-login failed:", signInError);
            } else {
              console.log("Auto-login successful!");
            }
          }
        } else {
          throw new Error(data?.error || "Verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      }
    };

    verifyPayment();
  }, [searchParams, triggerConfetti]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Zahlung wird verifiziert...</p>
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Fehler bei der Verifizierung
            </h1>
            <p className="text-muted-foreground mb-8">{errorMessage}</p>
            <Button asChild>
              <Link to="/checkout">Zurück zum Checkout</Link>
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/5 via-background to-background overflow-hidden">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {/* Success Card */}
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-accent/20 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/30"
              >
                <CheckCircle className="w-12 h-12 text-accent-foreground" />
              </motion.div>

              {/* Celebration Icon */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <PartyPopper className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Herzlichen Glückwunsch!</span>
                <PartyPopper className="w-5 h-5 text-accent transform scale-x-[-1]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2"
              >
                Zahlung erfolgreich!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8"
              >
                Willkommen bei Online DriveCoach, {userInfo?.firstName}!
              </motion.p>

              {/* Access Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-accent/10 rounded-2xl p-5 mb-6 border border-accent/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Dein Zugang</p>
                    <p className="text-xs text-muted-foreground">365 Tage Vollzugriff</p>
                  </div>
                </div>
                <div className="text-left pl-13">
                  <p className="text-sm text-muted-foreground">
                    Gültig bis: <span className="font-semibold text-foreground">{userInfo?.accessUntil ? formatDate(userInfo.accessUntil) : ''}</span>
                  </p>
                </div>
              </motion.div>

              {/* Login Info - Only for new users */}
              {!userInfo?.isExistingUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-muted rounded-2xl p-5 mb-8 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Deine Zugangsdaten
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Melde dich jetzt mit deinen Daten an:
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">E-Mail:</span>{" "}
                        <span className="font-medium text-foreground">{userInfo?.email}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Passwort: Das beim Checkout gewählte
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg shadow-accent/20"
                  onClick={() => navigate("/dashboard")}
                >
                  Zum Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground"
              >
                <Shield className="w-4 h-4" />
                <span>30 Tage Geld-zurück-Garantie</span>
              </motion.div>
            </div>
          </div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Du erhältst eine Bestätigungs-E-Mail mit allen Details zu deinem Zugang.
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentSuccess;

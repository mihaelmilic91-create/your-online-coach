import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [userInfo, setUserInfo] = useState<{ email: string; firstName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const registrationId = searchParams.get("registration_id");

      if (!sessionId || !registrationId) {
        setStatus("error");
        setErrorMessage("Fehlende Zahlungsinformationen");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: {
            session_id: sessionId,
            registration_id: registrationId,
          },
        });

        if (error) {
          throw error;
        }

        if (data?.success) {
          setUserInfo({
            email: data.email,
            firstName: data.firstName,
          });
          setStatus("success");
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
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
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
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-card rounded-2xl p-8 shadow-soft text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-accent" />
            </motion.div>

            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Zahlung erfolgreich!
            </h1>
            <p className="text-muted-foreground mb-8">
              Willkommen bei Online DriveCoach, {userInfo?.firstName}!
            </p>

            <div className="bg-muted rounded-xl p-6 mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Deine Zugangsdaten
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Du kannst dich jetzt mit folgenden Daten anmelden:
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">E-Mail:</span>{" "}
                    <span className="font-medium text-foreground">{userInfo?.email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Passwort: Das Passwort, das du beim Checkout eingegeben hast
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              onClick={() => navigate("/login")}
            >
              Jetzt anmelden
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground mt-6">
              Du erhältst eine Bestätigungs-E-Mail mit allen Details zu deinem Zugang.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentSuccess;

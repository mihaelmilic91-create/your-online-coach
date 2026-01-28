import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StripePaymentForm from "./StripePaymentForm";

// Stripe publishable key (safe to expose in frontend code)
// Provided via environment/secret: VITE_STRIPE_PUBLISHABLE_KEY
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

interface CheckoutPaymentSectionProps {
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    canton: string;
  };
  onPaymentSuccess: () => void;
}

const CheckoutPaymentSection = ({ formData, onPaymentSuccess }: CheckoutPaymentSectionProps) => {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugNote, setDebugNote] = useState<string | null>(null);
  const DEBUG_VERSION = "checkout-debug-v3";

  const stripePromise = useMemo(() => {
    if (!STRIPE_PUBLISHABLE_KEY) return null;
    return loadStripe(STRIPE_PUBLISHABLE_KEY);
  }, []);

  useEffect(() => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      setError(
        "Stripe Konfiguration fehlt (Publishable Key). Bitte kontaktiere den Support."
      );
      setIsLoading(false);
    }
  }, []);

  // If we end up with neither clientSecret nor error after an attempt,
  // force a visible error so users are never stuck on an infinite placeholder.
  useEffect(() => {
    if (isLoading) return;
    if (clientSecret) return;
    if (error) return;

    const t = window.setTimeout(() => {
      if (!clientSecret && !error) {
        setError(
          "Zahlungsoptionen konnten nicht geladen werden. Bitte versuche es erneut oder verwende eine andere E-Mail-Adresse (falls sie bereits registriert ist)."
        );
      }
    }, 1500);

    return () => window.clearTimeout(t);
  }, [isLoading, clientSecret, error]);

  const directFetchClientSecret = async (): Promise<string> => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!baseUrl || !anonKey) throw new Error("Backend-Konfiguration fehlt (URL/Key)");

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const res = await fetch(`${baseUrl}/functions/v1/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        billingAddress: {
          street: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          canton: formData.canton,
        },
        password: formData.password,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
    if (json?.error) throw new Error(json.error);
    if (!json?.clientSecret) throw new Error("Keine Zahlungsinformationen erhalten");
    return json.clientSecret as string;
  };

  const initializePayment = async () => {
    console.log("[CheckoutPaymentSection] initializePayment started", {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      hasAddress: Boolean(formData.address),
    });

    setIsLoading(true);
    setError(null);
    setDebugNote("Pozivam backend funkciju...");

    try {
      // Use direct fetch for more reliable response handling
      const cs = await directFetchClientSecret();
      console.log("[CheckoutPaymentSection] clientSecret received successfully via direct fetch");
      setClientSecret(cs);
      setDebugNote("clientSecret received");
    } catch (err: any) {
      const message = err?.message || "Ein Fehler ist aufgetreten";
      console.error("[CheckoutPaymentSection] Error:", message, err);
      setError(message);
      setDebugNote(null);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: message.includes("bereits registriert")
          ? "Diese E-Mail ist bereits registriert. Bitte melde dich an."
          : message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize payment on mount - formData is already populated when this component renders
  useEffect(() => {
    console.log("[CheckoutPaymentSection] Component mounted, starting payment initialization");
    if (!STRIPE_PUBLISHABLE_KEY) return;
    initializePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast({
      variant: "destructive",
      title: "Zahlungsfehler",
      description: errorMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Zahlung wird vorbereitet...</p>
        <div className="text-sm text-foreground/80">
          <div className="font-mono">{DEBUG_VERSION}</div>
          <div>{debugNote ?? "(no debugNote)"}</div>
        </div>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="text-primary hover:underline"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Lade Zahlungsoptionen...</p>
        <div className="text-sm text-foreground/80">
          <div className="font-mono">{DEBUG_VERSION}</div>
          <div>{debugNote ?? "(no debugNote)"}</div>
        </div>
        <button
          onClick={handleRetry}
          className="text-primary hover:underline text-sm"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-2">Stripe konnte nicht initialisiert werden.</p>
        <p className="text-sm text-muted-foreground">Bitte Seite neu laden und erneut versuchen.</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#16a34a",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e5e7eb",
              boxShadow: "none",
              padding: "12px",
            },
            ".Input:focus": {
              border: "1px solid #16a34a",
              boxShadow: "0 0 0 1px #16a34a",
            },
            ".Tab": {
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            },
            ".Tab--selected": {
              borderColor: "#16a34a",
              backgroundColor: "#f0fdf4",
            },
          },
        },
        locale: "de",
      }}
    >
      <StripePaymentForm
        onSuccess={onPaymentSuccess}
        onError={handlePaymentError}
      />
    </Elements>
  );
};

export default CheckoutPaymentSection;

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StripePaymentForm from "./StripePaymentForm";

// Stripe publishable key (safe to expose in frontend code)
const STRIPE_PUBLISHABLE_KEY = "pk_live_51RYMouRnGnmNxMzPMZlUewemMbapVrSQnFv6F86hv2VBtWMJN0RKFJeE8RqxPnc3L35BtKv6rG4b4PjSbqANsJGH00PvJaQRWB";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

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
    setDebugNote(null);
    setDebugNote("Pozivam backend funkciju...");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment-intent", {
        body: {
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
        },
      });

      let normalized: any = data;
      // Some environments may return data as a JSON string
      if (typeof normalized === "string") {
        try {
          normalized = JSON.parse(normalized);
        } catch {
          // leave as-is
        }
      }

      console.log("[CheckoutPaymentSection] Response received", {
        dataType: typeof data,
        normalizedType: typeof normalized,
        hasData: Boolean(data),
        hasClientSecret: Boolean(normalized?.clientSecret),
        fnError: fnError ? { message: fnError.message } : null,
        dataError: normalized?.error || null,
      });

      if (fnError) {
        // Often the SDK only gives a generic message here; try fallback fetch to retrieve real error payload.
        try {
          setDebugNote("invoke non-2xx — pokušavam fallback fetch za detalje...");
          const cs = await directFetchClientSecret();
          setClientSecret(cs);
          setDebugNote("clientSecret via direct fetch fallback");
          return;
        } catch (fallbackErr: any) {
          throw new Error(fallbackErr?.message || fnError.message || "Netzwerkfehler");
        }
      }

      if (normalized?.error) {
        throw new Error(normalized.error);
      }

      if (normalized?.clientSecret) {
        console.log("[CheckoutPaymentSection] clientSecret received successfully");
        setClientSecret(normalized.clientSecret);
        setDebugNote("clientSecret via invoke");
      } else {
        // Fallback: direct fetch (some environments have flaky invoke response parsing)
        setDebugNote("invoke nije vratio clientSecret — fallback fetch...");
        const cs = await directFetchClientSecret();
        setClientSecret(cs);
        setDebugNote("clientSecret via direct fetch fallback");
      }
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

import { useEffect, useState, useCallback } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import StripePaymentForm from "./StripePaymentForm";

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
  couponCode?: string;
}

type LoadingState = "idle" | "fetching" | "initializing-stripe" | "ready" | "error";

const CheckoutPaymentSection = ({ formData, onPaymentSuccess, couponCode }: CheckoutPaymentSectionProps) => {
  const { toast } = useToast();
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = useCallback(async () => {
    console.log("[Checkout] Starting payment initialization...");
    setLoadingState("fetching");
    setError(null);
    setStripe(null);
    setClientSecret(null);

    try {
      // Step 1: Fetch PaymentIntent from backend
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!baseUrl || !anonKey) {
        throw new Error("Backend-Konfiguration fehlt");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      console.log("[Checkout] Calling create-payment-intent...");
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
          couponCode: couponCode || undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(json?.error || `Server-Fehler: ${res.status}`);
      }
      
      if (json?.error) {
        throw new Error(json.error);
      }
      
      if (!json?.clientSecret || !json?.publishableKey) {
        console.error("[Checkout] Invalid response:", json);
        throw new Error("Ungültige Zahlungsdaten vom Server");
      }

      console.log("[Checkout] PaymentIntent received:", {
        livemode: json.livemode,
        hasClientSecret: true,
        pkPrefix: json.publishableKey.substring(0, 10),
      });

      // Step 2: Initialize Stripe
      setLoadingState("initializing-stripe");
      console.log("[Checkout] Loading Stripe with key:", json.publishableKey.substring(0, 15) + "...");
      
      const stripeInstance = await loadStripe(json.publishableKey);
      
      if (!stripeInstance) {
        throw new Error("Stripe konnte nicht geladen werden. Bitte prüfe deine Internetverbindung.");
      }

      console.log("[Checkout] Stripe loaded successfully!");
      setStripe(stripeInstance);
      setClientSecret(json.clientSecret);
      setLoadingState("ready");

    } catch (err: any) {
      const message = err?.message || "Ein unbekannter Fehler ist aufgetreten";
      console.error("[Checkout] Error:", message, err);
      setError(message);
      setLoadingState("error");
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: message.includes("bereits registriert")
          ? "Diese E-Mail ist bereits registriert. Bitte melde dich an."
          : message,
      });
    }
  }, [formData, couponCode, toast]);

  useEffect(() => {
    initializePayment();
  }, [initializePayment]);

  const handleRetry = () => {
    initializePayment();
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast({
      variant: "destructive",
      title: "Zahlungsfehler",
      description: errorMessage,
    });
  };

  // Loading states
  if (loadingState === "idle" || loadingState === "fetching") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Zahlungsdaten werden geladen...</p>
      </div>
    );
  }

  if (loadingState === "initializing-stripe") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Zahlungsformular wird vorbereitet...</p>
      </div>
    );
  }

  // Error state
  if (loadingState === "error" || !clientSecret || !stripe) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium text-sm">
            {error || "Zahlungsoptionen konnten nicht geladen werden."}
          </p>
        </div>
        <Button
          onClick={handleRetry}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  // Ready - render Stripe Elements
  return (
    <Elements
      stripe={stripe}
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

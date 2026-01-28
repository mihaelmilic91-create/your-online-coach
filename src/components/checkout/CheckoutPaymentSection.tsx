import { useEffect, useMemo, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import StripePaymentForm from "./StripePaymentForm";

// Stripe publishable keys - use env or fallback to hardcoded (safe for frontend)
const STRIPE_PK_LIVE =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE as string | undefined) ??
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ??
  "pk_live_51RYMouRnGnmNxMzPMZlUewemMbapVrSQnFv6F86hv2VBtWMJN0RKFJeE8RqxPnc3L35BtKv6rG4b4PjSbqANsJGH00PvJaQRWB";

const STRIPE_PK_TEST =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST as string | undefined) ??
  "pk_test_51RYMouRnGnmNxMzPnHvwbxV0aO0X7Qg0sRaW4uXKsHbAj9oC2LkV4F0jX9a3N7gL8RzM1N2P3Q4R5S6T7U8V9W0X1Y2";

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

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  livemode: boolean;
}

const CheckoutPaymentSection = ({ formData, onPaymentSuccess }: CheckoutPaymentSectionProps) => {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPaymentIntent = async (): Promise<PaymentIntentResponse> => {
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
    
    return {
      clientSecret: json.clientSecret,
      paymentIntentId: json.paymentIntentId,
      livemode: json.livemode ?? true, // default to live if not specified
    };
  };

  const initializePayment = async () => {
    console.log("[CheckoutPaymentSection] initializePayment started");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPaymentIntent();
      console.log("[CheckoutPaymentSection] PaymentIntent received", {
        livemode: response.livemode,
        hasClientSecret: Boolean(response.clientSecret),
      });

      // Choose the correct publishable key based on livemode
      const publishableKey = response.livemode ? STRIPE_PK_LIVE : STRIPE_PK_TEST;
      console.log("[CheckoutPaymentSection] Using Stripe key mode:", response.livemode ? "LIVE" : "TEST");

      // Initialize Stripe with the correct key
      const stripeInstance = loadStripe(publishableKey);
      setStripePromise(stripeInstance);
      setClientSecret(response.clientSecret);
    } catch (err: any) {
      const message = err?.message || "Ein Fehler ist aufgetreten";
      console.error("[CheckoutPaymentSection] Error:", message, err);
      setError(message);
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

  useEffect(() => {
    console.log("[CheckoutPaymentSection] Component mounted, starting payment initialization");
    initializePayment();
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Zahlung wird vorbereitet...</p>
      </div>
    );
  }

  // Error state
  if (error || !clientSecret || !stripePromise) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">
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

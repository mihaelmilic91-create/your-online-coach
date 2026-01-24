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

  const initializePayment = async () => {
    console.log("[CheckoutPaymentSection] initializePayment started", {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      hasAddress: Boolean(formData.address),
    });

    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

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

      clearTimeout(timeoutId);

      console.log("[CheckoutPaymentSection] Response received", {
        hasData: Boolean(data),
        hasClientSecret: Boolean(data?.clientSecret),
        fnError: fnError ? { message: fnError.message } : null,
        dataError: data?.error || null,
      });

      if (fnError) {
        throw new Error(fnError.message || "Netzwerkfehler");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.clientSecret) {
        console.log("[CheckoutPaymentSection] clientSecret received successfully");
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("Keine Zahlungsinformationen erhalten");
      }
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

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error("Zeitüberschreitung beim Laden der Zahlungsoptionen. Bitte erneut versuchen."));
      }, ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);

    console.debug("[CheckoutPaymentSection] initializePayment()", {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    try {
      const invokePromise = supabase.functions.invoke("create-payment-intent", {
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

      const { data, error: fnError } = await withTimeout(invokePromise, 20000);

      console.debug("[CheckoutPaymentSection] create-payment-intent response", {
        hasData: Boolean(data),
        hasClientSecret: Boolean((data as any)?.clientSecret),
        fnError: fnError ? { message: fnError.message, name: fnError.name } : null,
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("Keine Zahlungsinformationen erhalten");
      }
    } catch (err: any) {
      const message = err?.message || "Ein Fehler ist aufgetreten";
      console.error("[CheckoutPaymentSection] initializePayment error", err);
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
    // Only initialize when we have required data
    if (!clientSecret && !isLoading && formData.email && formData.password && formData.firstName && formData.lastName) {
      initializePayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, formData.password, formData.firstName, formData.lastName]);

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
          onClick={initializePayment}
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

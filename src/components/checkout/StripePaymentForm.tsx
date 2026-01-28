import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const LOAD_TIMEOUT_MS = 15000; // 15 seconds timeout

const StripePaymentForm = ({ onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Timeout: if PaymentElement doesn't become ready within 15s, show error
  useEffect(() => {
    if (isReady) return;

    const timeout = window.setTimeout(() => {
      if (!isReady) {
        setTimedOut(true);
        setLoadError(
          "Das Zahlungsformular konnte nicht geladen werden. Bitte lade die Seite neu."
        );
      }
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      onError("Zahlungsformular wird noch geladen. Bitte warte einen Moment.");
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || "Bitte überprüfe deine Zahlungsdaten.");
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          onError(error.message || "Zahlungsfehler aufgetreten");
        } else {
          onError("Ein unerwarteter Fehler ist aufgetreten.");
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Zahlung erfolgreich!",
          description: "Dein Zugang wird jetzt aktiviert...",
        });
        window.location.href = `${window.location.origin}/payment-success?payment_intent=${paymentIntent.id}`;
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // 3D Secure - Stripe handles redirect automatically
      } else {
        window.location.href = `${window.location.origin}/payment-success?payment_intent=${paymentIntent?.id}`;
      }
    } catch (err: any) {
      onError(err.message || "Zahlungsfehler aufgetreten");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Show error if timed out or load error
  if (loadError || timedOut) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{loadError}</p>
        </div>
        <Button onClick={handleReload} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Seite neu laden
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        onReady={() => {
          console.log("[StripePaymentForm] PaymentElement ready");
          setIsReady(true);
        }}
        onLoadError={(event) => {
          console.error("[StripePaymentForm] PaymentElement load error:", event);
          setLoadError(
            "Fehler beim Laden der Zahlungsoptionen. Bitte prüfe deine Internetverbindung."
          );
        }}
        options={{
          layout: "tabs",
          business: {
            name: "Online DriveCoach",
          },
        }}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg shadow-accent/20"
        disabled={!stripe || !elements || !isReady || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Wird verarbeitet...
          </span>
        ) : !isReady ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Lade Zahlungsoptionen...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Jetzt bezahlen - CHF 79.00
          </span>
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;

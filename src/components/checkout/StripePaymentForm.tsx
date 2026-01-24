import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePaymentForm = ({ onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      onError("Zahlungsformular wird noch geladen. Bitte warte einen Moment.");
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the form first to validate
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
        // Navigate to success with payment intent ID
        window.location.href = `${window.location.origin}/payment-success?payment_intent=${paymentIntent.id}`;
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // Payment requires additional action (3D Secure, etc.)
        // Stripe will handle the redirect automatically
      } else {
        // Payment is processing or requires redirect
        window.location.href = `${window.location.origin}/payment-success?payment_intent=${paymentIntent?.id}`;
      }
    } catch (err: any) {
      onError(err.message || "Zahlungsfehler aufgetreten");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        onReady={() => setIsReady(true)}
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

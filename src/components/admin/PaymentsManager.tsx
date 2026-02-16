import { useState, useEffect } from "react";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer_email: string | null;
  description: string | null;
}

const PaymentsManager = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-billing-info", {
        body: { action: "list_all_payments" },
      });
      if (error) throw error;
      setPayments(data?.payments || []);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      // Fallback: no payments to show
      setPayments([]);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-accent" /> Zahlungen
      </h2>

      {payments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Zahlungen werden direkt über Stripe verwaltet. Gehe zu deinem Stripe Dashboard für detaillierte Informationen.
        </p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      CHF {(p.amount / 100).toFixed(2)}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      {p.customer_email && <span>{p.customer_email}</span>}
                      <span>{new Date(p.created * 1000).toLocaleDateString("de-CH")}</span>
                      <span className={p.status === "succeeded" ? "text-accent" : "text-destructive"}>
                        {p.status === "succeeded" ? "Erfolgreich" : p.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Für detaillierte Zahlungsinformationen verwende bitte dein Stripe Dashboard.
      </p>
    </div>
  );
};

export default PaymentsManager;

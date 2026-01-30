import { useState, useEffect } from "react";
import { Receipt, Download, ExternalLink, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: string;
  receiptUrl: string | null;
  invoiceUrl: string | null;
  invoiceNumber: string | null;
}

interface BillingInfo {
  payments: Payment[];
  hasPaymentMethod: boolean;
  portalUrl: string | null;
}

const OrdersWidget = () => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-billing-info");
        
        if (error) throw error;
        setBillingInfo(data);
      } catch (err) {
        console.error("Error fetching billing info:", err);
        setError("Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleManagePayments = () => {
    if (billingInfo?.portalUrl) {
      window.open(billingInfo.portalUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-soft">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestPayment = billingInfo?.payments?.[0];

  return (
    <Card className="bg-card shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-6 h-6 text-accent" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">Zahlungen</p>
            {latestPayment ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatAmount(latestPayment.amount, latestPayment.currency)}</span>
                <span>•</span>
                <span>{formatDate(latestPayment.date)}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                  latestPayment.status === "succeeded" 
                    ? "bg-accent/10 text-accent" 
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {latestPayment.status === "succeeded" ? "Bezahlt" : "Ausstehend"}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Zahlungen</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {latestPayment && (latestPayment.invoiceUrl || latestPayment.receiptUrl) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const url = latestPayment.invoiceUrl || latestPayment.receiptUrl;
                  if (url) window.open(url, "_blank");
                }}
                title="Rechnung"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {billingInfo?.portalUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManagePayments}
                className="gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Verwalten</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersWidget;

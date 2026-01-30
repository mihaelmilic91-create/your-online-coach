import { useState, useEffect } from "react";
import { Receipt, Download, ExternalLink, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        setError("Zahlungsinformationen konnten nicht geladen werden");
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
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            Zahlungen & Rechnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            Zahlungen & Rechnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            Zahlungen & Rechnungen
          </CardTitle>
          {billingInfo?.portalUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManagePayments}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Zahlungsmethoden</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!billingInfo?.payments || billingInfo.payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Keine Zahlungen gefunden
          </p>
        ) : (
          <div className="space-y-3">
            {billingInfo.payments.map((payment) => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {payment.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(payment.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="font-semibold text-foreground whitespace-nowrap">
                    {formatAmount(payment.amount, payment.currency)}
                  </span>
                  {(payment.invoiceUrl || payment.receiptUrl) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const url = payment.invoiceUrl || payment.receiptUrl;
                        if (url) window.open(url, "_blank");
                      }}
                      title="Rechnung herunterladen"
                    >
                      {payment.invoiceUrl ? (
                        <Download className="w-4 h-4" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersWidget;

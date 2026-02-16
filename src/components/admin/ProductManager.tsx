import { useState, useEffect } from "react";
import { Package, Save, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const productKeys = [
  { key: "product_price", label: "Preis (CHF)", placeholder: "79", type: "number" },
  { key: "product_price_old", label: "Alter Preis / Streichpreis (CHF)", placeholder: "129", type: "number" },
  { key: "product_name", label: "Produktname", placeholder: "Jahreslizenz", type: "text" },
  { key: "product_duration", label: "Laufzeit", placeholder: "1 Jahr", type: "text" },
  { key: "product_sale_active", label: "Aktion aktiv", placeholder: "", type: "toggle" },
  { key: "product_sale_text", label: "Aktionstext", placeholder: "z.B. Sommeraktion!", type: "text" },
];

const ProductManager = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProductSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").like("key", "product_%");
    
    // Ensure all product keys exist
    const existingKeys = new Set(data?.map(d => d.key) || []);
    const missing = productKeys.filter(pk => !existingKeys.has(pk.key));
    
    if (missing.length > 0) {
      await supabase.from("site_settings").insert(
        missing.map(m => ({ key: m.key, value: "", description: m.label }))
      );
      // Re-fetch
      const { data: refreshed } = await supabase.from("site_settings").select("*").like("key", "product_%");
      setSettings(refreshed || []);
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  };

  const getValue = (key: string) => settings.find(s => s.key === key)?.value || "";

  const setValue = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveAll = async () => {
    setSaving(true);
    for (const s of settings) {
      await supabase.from("site_settings").update({ value: s.value }).eq("id", s.id);
    }
    toast({ title: "Gespeichert", description: "Produkteinstellungen wurden aktualisiert." });
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" /> Produkt & Preise
        </h2>
        <Button variant="hero" size="sm" onClick={saveAll} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Alle speichern
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {productKeys.map((pk) => {
            if (pk.type === "toggle") {
              return (
                <div key={pk.key} className="flex items-center justify-between">
                  <Label>{pk.label}</Label>
                  <Switch checked={getValue(pk.key) === "true"} onCheckedChange={(v) => setValue(pk.key, String(v))} />
                </div>
              );
            }
            return (
              <div key={pk.key} className="space-y-2">
                <Label>{pk.label}</Label>
                <Input type={pk.type} value={getValue(pk.key)} onChange={(e) => setValue(pk.key, e.target.value)} placeholder={pk.placeholder} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Hinweis: Diese Einstellungen steuern die Anzeige auf der Website. Die tatsächlichen Stripe-Preise werden separat in Stripe verwaltet.
      </p>
    </div>
  );
};

export default ProductManager;

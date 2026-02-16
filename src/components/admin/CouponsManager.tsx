import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Save, X, Loader2, Ticket, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

const CouponsManager = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast({ variant: "destructive", title: "Fehler", description: error.message });
    else setCoupons(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setCode(""); setDescription(""); setDiscountType("percentage"); setDiscountValue(""); setMaxUses(""); setIsActive(true); setValidUntil("");
    setEditing(null); setShowForm(false);
  };

  const openForm = (c?: Coupon) => {
    if (c) {
      setEditing(c); setCode(c.code); setDescription(c.description || ""); setDiscountType(c.discount_type);
      setDiscountValue(String(c.discount_value)); setMaxUses(c.max_uses ? String(c.max_uses) : "");
      setIsActive(c.is_active); setValidUntil(c.valid_until ? c.valid_until.split("T")[0] : "");
    }
    setShowForm(true);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCode(result);
  };

  const saveCoupon = async () => {
    if (!code.trim() || !discountValue) {
      toast({ variant: "destructive", title: "Fehler", description: "Code und Rabattwert sind erforderlich" }); return;
    }
    setSaving(true);
    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_uses: maxUses ? parseInt(maxUses) : null,
      is_active: isActive,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
    };

    const { error } = editing
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert([payload]);

    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: editing ? "Gespeichert" : "Erstellt" });
      resetForm(); fetchCoupons();
    }
    setSaving(false);
  };

  const deleteCoupon = async (c: Coupon) => {
    if (!confirm(`"${c.code}" löschen?`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) toast({ variant: "destructive", title: "Fehler", description: error.message });
    else { toast({ title: "Gelöscht" }); fetchCoupons(); }
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    fetchCoupons();
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Ticket className="w-5 h-5 text-accent" /> Gutscheine
        </h2>
        <Button variant="hero" size="sm" onClick={() => openForm()} className="gap-1"><Plus className="w-4 h-4" /> Neu</Button>
      </div>

      <div className="space-y-2">
        {coupons.map((c) => (
          <Card key={c.id} className="hover:shadow-soft transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{c.code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `CHF ${c.discount_value}`}
                    </span>
                    {c.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">Aktiv</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inaktiv</span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    {c.description && <span>{c.description}</span>}
                    <span>Verwendet: {c.current_uses}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                    {c.valid_until && <span>Gültig bis: {new Date(c.valid_until).toLocaleDateString("de-CH")}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(c)}>
                    {c.is_active ? <ToggleRight className="w-4 h-4 text-accent" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(c)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCoupon(c)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {coupons.length === 0 && <p className="text-center text-muted-foreground py-8">Noch keine Gutscheine vorhanden</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">{editing ? "Gutschein bearbeiten" : "Neuer Gutschein"}</h3>
                <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-5 h-5" /></Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <div className="flex gap-2">
                    <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="RABATT20" className="font-mono" />
                    <Button variant="outline" size="sm" onClick={generateCode} type="button">Generieren</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="z.B. Sommer-Aktion" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rabatttyp</Label>
                    <Select value={discountType} onValueChange={setDiscountType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Prozent (%)</SelectItem>
                        <SelectItem value="fixed">Festbetrag (CHF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wert *</Label>
                    <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max. Verwendungen</Label>
                    <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unbegrenzt" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gültig bis</Label>
                    <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Aktiv</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={resetForm} className="flex-1">Abbrechen</Button>
                <Button variant="hero" onClick={saveCoupon} disabled={saving} className="flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Speichern
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CouponsManager;

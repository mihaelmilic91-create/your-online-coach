import { useState, useEffect } from "react";
import { Save, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PixelSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const pixelLabels: Record<string, { label: string; placeholder: string }> = {
  pixel_tiktok: { label: "TikTok Pixel", placeholder: "<!-- TikTok Pixel Code hier einfügen -->" },
  pixel_google: { label: "Google Analytics / Tag Manager", placeholder: "<!-- Google Analytics Code hier einfügen -->" },
  pixel_meta: { label: "Meta (Facebook) Pixel", placeholder: "<!-- Meta Pixel Code hier einfügen -->" },
  pixel_custom: { label: "Benutzerdefiniert", placeholder: "<!-- Benutzerdefinierter Tracking Code -->" },
};

const PixelsManager = () => {
  const { toast } = useToast();
  const [pixels, setPixels] = useState<PixelSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { fetchPixels(); }, []);

  const fetchPixels = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*").like("key", "pixel_%").order("key");
    if (error) toast({ variant: "destructive", title: "Fehler", description: error.message });
    else setPixels(data || []);
    setLoading(false);
  };

  const savePixel = async (pixel: PixelSetting) => {
    setSaving(pixel.key);
    const { error } = await supabase.from("site_settings").update({ value: pixel.value }).eq("id", pixel.id);
    if (error) toast({ variant: "destructive", title: "Fehler", description: error.message });
    else toast({ title: "Gespeichert", description: `${pixelLabels[pixel.key]?.label || pixel.key} wurde aktualisiert.` });
    setSaving(null);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        <Code className="w-5 h-5 text-accent" /> Tracking Pixels
      </h2>
      <p className="text-sm text-muted-foreground">Füge hier deine Tracking-Codes ein. Sie werden automatisch in den &lt;head&gt; der Seite eingefügt.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {pixels.map((pixel) => {
          const info = pixelLabels[pixel.key] || { label: pixel.key, placeholder: "" };
          return (
            <Card key={pixel.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{info.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={pixel.value}
                  onChange={(e) => setPixels(prev => prev.map(p => p.id === pixel.id ? { ...p, value: e.target.value } : p))}
                  placeholder={info.placeholder}
                  rows={5}
                  className="font-mono text-xs"
                />
                <Button variant="hero" size="sm" onClick={() => savePixel(pixel)} disabled={saving === pixel.key} className="gap-2">
                  {saving === pixel.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Speichern
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PixelsManager;

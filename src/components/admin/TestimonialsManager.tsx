import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Save, X, Loader2, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  image_url: string | null;
  rating: number;
  text: string;
  sort_order: number;
  is_published: boolean;
}

const TestimonialsManager = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setImageUrl("");
    setRating(5);
    setText("");
    setIsPublished(true);
    setEditing(null);
    setShowForm(false);
  };

  const openForm = (t?: Testimonial) => {
    if (t) {
      setEditing(t);
      setName(t.name);
      setLocation(t.location || "");
      setImageUrl(t.image_url || "");
      setRating(t.rating);
      setText(t.text);
      setIsPublished(t.is_published);
    }
    setShowForm(true);
  };

  const saveTestimonial = async () => {
    if (!name.trim() || !text.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Name und Text sind erforderlich" });
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      location: location.trim() || null,
      image_url: imageUrl.trim() || null,
      rating,
      text: text.trim(),
      is_published: isPublished,
    };

    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Rezension wurde aktualisiert." });
        resetForm();
        fetchTestimonials();
      }
    } else {
      const { error } = await supabase.from("testimonials").insert([{ ...payload, sort_order: testimonials.length }]);
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neue Rezension wurde hinzugefügt." });
        resetForm();
        fetchTestimonials();
      }
    }
    setSaving(false);
  };

  const deleteTestimonial = async (t: Testimonial) => {
    if (!confirm(`Bist du sicher, dass du die Rezension von "${t.name}" löschen möchtest?`)) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", t.id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Rezension wurde gelöscht." });
      fetchTestimonials();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          Rezensionen
        </h2>
        <Button variant="hero" size="sm" onClick={() => openForm()} className="gap-1">
          <Plus className="w-4 h-4" />
          Neu
        </Button>
      </div>

      <div className="space-y-2">
        {testimonials.map((t) => (
          <Card key={t.id} className="hover:shadow-soft transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-accent font-semibold text-sm">{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.location && <span className="text-xs text-muted-foreground">{t.location}</span>}
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {t.is_published ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">Veröffentlicht</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Entwurf</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.text}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(t)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTestimonial(t)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Noch keine Rezensionen vorhanden</p>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editing ? "Rezension bearbeiten" : "Neue Rezension"}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Lara K." />
                </div>
                <div className="space-y-2">
                  <Label>Ort</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="z.B. Zürich" />
                </div>
                <div className="space-y-2">
                  <Label>Bild-URL</Label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Bewertung (1-5)</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} onClick={() => setRating(v)} className="p-1">
                        <Star className={`w-6 h-6 ${v <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text *</Label>
                  <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Rezensionstext..." rows={4} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Veröffentlicht</Label>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={resetForm} className="flex-1">Abbrechen</Button>
                <Button variant="hero" onClick={saveTestimonial} disabled={saving} className="flex-1 gap-2">
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

export default TestimonialsManager;

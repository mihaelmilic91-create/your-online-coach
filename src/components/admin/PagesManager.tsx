import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Save, X, Loader2, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
}

const PagesManager = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("title", { ascending: true });
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setIsPublished(false);
    setEditing(null);
    setShowForm(false);
  };

  const openForm = (p?: Page) => {
    if (p) {
      setEditing(p);
      setTitle(p.title);
      setSlug(p.slug);
      setContent(p.content);
      setIsPublished(p.is_published);
    }
    setShowForm(true);
  };

  const savePage = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Titel und Slug sind erforderlich" });
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      content: content,
      is_published: isPublished,
    };

    if (editing) {
      const { error } = await supabase.from("pages").update(payload).eq("id", editing.id);
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Seite wurde aktualisiert." });
        resetForm();
        fetchPages();
      }
    } else {
      const { error } = await supabase.from("pages").insert([payload]);
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neue Seite wurde erstellt." });
        resetForm();
        fetchPages();
      }
    }
    setSaving(false);
  };

  const deletePage = async (p: Page) => {
    if (!confirm(`Bist du sicher, dass du "${p.title}" löschen möchtest?`)) return;
    const { error } = await supabase.from("pages").delete().eq("id", p.id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Seite wurde gelöscht." });
      fetchPages();
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
          <FileText className="w-5 h-5 text-accent" />
          Seiten
        </h2>
        <Button variant="hero" size="sm" onClick={() => openForm()} className="gap-1">
          <Plus className="w-4 h-4" />
          Neu
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pages.map((p) => (
          <Card key={p.id} className="hover:shadow-soft transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">/{p.slug}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {p.is_published ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Veröffentlicht
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Entwurf
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(p)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePage(p)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Noch keine Seiten vorhanden</p>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editing ? "Seite bearbeiten" : "Neue Seite"}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titel *</Label>
                    <Input value={title} onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9äöü]/g, "-").replace(/[äöü]/g, (c) => ({ä:"ae",ö:"oe",ü:"ue"}[c] || c)).replace(/-+/g, "-").replace(/^-|-$/g, ""));
                    }} placeholder="z.B. Impressum" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug *</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="z.B. impressum" className="font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Inhalt (HTML erlaubt)</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Seiteninhalt..." rows={12} className="font-mono text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Veröffentlicht</Label>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={resetForm} className="flex-1">Abbrechen</Button>
                <Button variant="hero" onClick={savePage} disabled={saving} className="flex-1 gap-2">
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

export default PagesManager;

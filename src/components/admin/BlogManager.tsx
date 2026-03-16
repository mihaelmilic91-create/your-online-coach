import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Save, X, Loader2, BookOpen, Eye, EyeOff, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tag: string;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
}

const BlogManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle(""); setSlug(""); setExcerpt(""); setContent("");
    setTag(""); setImageUrl(""); setIsPublished(false);
    setEditing(null); setShowForm(false);
  };

  const openForm = (p?: BlogPost) => {
    if (p) {
      setEditing(p);
      setTitle(p.title);
      setSlug(p.slug);
      setExcerpt(p.excerpt);
      setContent(p.content);
      setTag(p.tag);
      setImageUrl(p.image_url || "");
      setIsPublished(p.is_published);
    }
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Upload fehlgeschlagen", description: error.message });
      setUploadingImage(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(fileName);
    setImageUrl(publicUrl);
    setUploadingImage(false);
    toast({ title: "Hochgeladen", description: "Bild wurde hochgeladen." });
  };

  const insertImageInContent = async (file: File) => {
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Upload fehlgeschlagen", description: error.message });
      setUploadingImage(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(fileName);
    setContent(prev => prev + `\n<img src="${publicUrl}" alt="" style="max-width:100%;border-radius:12px;margin:1rem 0" />\n`);
    setUploadingImage(false);
    toast({ title: "Bild eingefügt", description: "Bild wurde in den Inhalt eingefügt." });
  };

  const savePost = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Titel und Slug sind erforderlich" });
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
      excerpt: excerpt.trim(),
      content,
      tag: tag.trim(),
      image_url: imageUrl || null,
      is_published: isPublished,
    };

    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Blogbeitrag wurde aktualisiert." });
        resetForm(); fetchPosts();
      }
    } else {
      const { error } = await supabase.from("blog_posts").insert([{ ...payload, sort_order: posts.length }]);
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neuer Blogbeitrag wurde erstellt." });
        resetForm(); fetchPosts();
      }
    }
    setSaving(false);
  };

  const deletePost = async (p: BlogPost) => {
    if (!confirm(`Bist du sicher, dass du "${p.title}" löschen möchtest?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Blogbeitrag wurde gelöscht." });
      fetchPosts();
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
          <BookOpen className="w-5 h-5 text-accent" />
          Blogbeiträge
        </h2>
        <Button variant="hero" size="sm" onClick={() => openForm()} className="gap-1">
          <Plus className="w-4 h-4" />
          Neu
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((p) => (
          <Card key={p.id} className="hover:shadow-soft transition-all">
            <CardContent className="p-4">
              {p.image_url && (
                <img src={p.image_url} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">/{p.slug}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {p.tag && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {p.tag}
                      </span>
                    )}
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePost(p)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Noch keine Blogbeiträge vorhanden</p>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-elevated max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editing ? "Blogbeitrag bearbeiten" : "Neuer Blogbeitrag"}
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
                      if (!editing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9äöü ]/g, "").replace(/[äöü]/g, (c) => ({ä:"ae",ö:"oe",ü:"ue"}[c] || c)).replace(/\s+/g, "-").replace(/-+/g, "-"));
                    }} placeholder="z.B. Einparken Fahrprüfung Schweiz" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug *</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="z.B. einparken-fahrpruefung-schweiz" className="font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tag / Kategorie</Label>
                    <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="z.B. Manöver" />
                  </div>
                  <div className="space-y-2">
                    <Label>Titelbild</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        disabled={uploadingImage}
                      />
                      {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-accent shrink-0 mt-2" />}
                    </div>
                    {imageUrl && (
                      <div className="relative mt-2">
                        <img src={imageUrl} alt="Vorschau" className="w-full h-32 object-cover rounded-lg" />
                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => setImageUrl("")}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kurzbeschreibung</Label>
                  <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kurze Beschreibung für die Übersicht..." rows={2} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Inhalt (HTML)</Label>
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && insertImageInContent(e.target.files[0])}
                          disabled={uploadingImage}
                        />
                        <span className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                          <Image className="w-3 h-3" />
                          Bild einfügen
                        </span>
                      </label>
                    </div>
                  </div>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Seiteninhalt (HTML erlaubt)..." rows={16} className="font-mono text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Veröffentlicht</Label>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={resetForm} className="flex-1">Abbrechen</Button>
                <Button variant="hero" onClick={savePost} disabled={saving} className="flex-1 gap-2">
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

export default BlogManager;

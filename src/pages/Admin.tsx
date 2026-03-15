import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  Video, 
  FolderOpen, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Save,
  X,
  Loader2,
  GripVertical,
  MessageSquare,
  FileText,
  Users,
  Ticket,
  CreditCard,
  Code,
  BarChart3,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import PagesManager from "@/components/admin/PagesManager";
import UsersManager from "@/components/admin/UsersManager";
import CouponsManager from "@/components/admin/CouponsManager";
import PixelsManager from "@/components/admin/PixelsManager";
import StatsOverview from "@/components/admin/StatsOverview";
import PaymentsManager from "@/components/admin/PaymentsManager";
import ProductManager from "@/components/admin/ProductManager";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  is_published: boolean;
}

interface VideoItem {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  vdocipher_video_id: string;
  duration: string | null;
  sort_order: number;
  is_published: boolean;
}

// Sortable Category Item
const SortableCategoryItem = ({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`cursor-pointer transition-all ${
          isSelected
            ? "ring-2 ring-accent shadow-elevated"
            : "hover:shadow-soft"
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {category.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {category.is_published ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      Veröffentlicht
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Entwurf
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Sortable Video Item
const SortableVideoItem = ({
  video,
  onEdit,
  onDelete,
}: {
  video: VideoItem;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-soft transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <button
                className="touch-none cursor-grab active:cursor-grabbing p-1 mt-1 text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">{video.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {video.duration && (
                    <span className="text-xs text-muted-foreground">
                      {video.duration}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {video.vdocipher_video_id.substring(0, 12)}...
                  </span>
                  {video.is_published ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      Veröffentlicht
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Entwurf
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit()}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete()}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "testimonials" | "pages" | "users" | "coupons" | "payments" | "pixels" | "stats" | "product" | "reviews">("stats");
  
  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  
  // Category form
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryIsPublished, setCategoryIsPublished] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Video form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [vdocipherVideoId, setVdocipherVideoId] = useState("");
  const [videoIsPublished, setVideoIsPublished] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    
    if (!authLoading && user && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Zugriff verweigert",
        description: "Du hast keine Administratorrechte.",
      });
      navigate("/dashboard");
      return;
    }
    
    if (!authLoading && isAdmin) {
      fetchCategories();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
        setCategories([]);
      } else {
        setCategories(data || []);
      }
    } catch (e) {
      console.error("fetchCategories failed", e);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kategorien konnten nicht geladen werden.",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: true });

      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
        setVideos([]);
      } else {
        setVideos(data || []);
      }
    } catch (e) {
      console.error("fetchVideos failed", e);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Videos konnten nicht geladen werden.",
      });
      setVideos([]);
    }
  };

  const resetCategoryForm = () => {
    setCategoryTitle("");
    setCategoryDescription("");
    setCategoryIsPublished(false);
    setThumbnailFile(null);
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetVideoForm = () => {
    setVideoTitle("");
    setVideoDescription("");
    setVideoDuration("");
    setVdocipherVideoId("");
    setVideoIsPublished(false);
    setEditingVideo(null);
    setShowVideoForm(false);
  };

  const openCategoryForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryTitle(category.title);
      setCategoryDescription(category.description || "");
      setCategoryIsPublished(category.is_published);
    }
    setShowCategoryForm(true);
  };

  const openVideoForm = (video?: VideoItem) => {
    if (video) {
      setEditingVideo(video);
      setVideoTitle(video.title);
      setVideoDescription(video.description || "");
      setVideoDuration(video.duration || "");
      setVdocipherVideoId(video.vdocipher_video_id);
      setVideoIsPublished(video.is_published);
    }
    setShowVideoForm(true);
  };

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("course-thumbnails")
      .upload(fileName, file);
    
    if (error) {
      toast({ variant: "destructive", title: "Upload fehlgeschlagen", description: error.message });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const saveCategory = async () => {
    if (!categoryTitle.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Titel ist erforderlich" });
      return;
    }
    
    setSaving(true);
    
    let thumbnailUrl = editingCategory?.thumbnail_url || null;
    if (thumbnailFile) {
      thumbnailUrl = await uploadThumbnail(thumbnailFile);
    }
    
    const categoryData = {
      title: categoryTitle.trim(),
      description: categoryDescription.trim() || null,
      thumbnail_url: thumbnailUrl,
      is_published: categoryIsPublished,
    };
    
    if (editingCategory) {
      const { error } = await supabase
        .from("video_categories")
        .update(categoryData)
        .eq("id", editingCategory.id);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Kategorie wurde aktualisiert." });
        resetCategoryForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from("video_categories")
        .insert([{ ...categoryData, sort_order: categories.length }]);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neue Kategorie wurde erstellt." });
        resetCategoryForm();
        fetchCategories();
      }
    }
    
    setSaving(false);
  };

  const saveVideo = async () => {
    if (!selectedCategory || !videoTitle.trim() || !vdocipherVideoId.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Titel und VdoCipher Video-ID sind erforderlich" });
      return;
    }
    
    setSaving(true);
    
    const videoData = {
      category_id: selectedCategory.id,
      title: videoTitle.trim(),
      description: videoDescription.trim() || null,
      duration: videoDuration.trim() || null,
      vdocipher_video_id: vdocipherVideoId.trim(),
      is_published: videoIsPublished,
    };
    
    if (editingVideo) {
      const { error } = await supabase
        .from("videos")
        .update(videoData)
        .eq("id", editingVideo.id);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Video wurde aktualisiert." });
        resetVideoForm();
        fetchVideos(selectedCategory.id);
      }
    } else {
      const { error } = await supabase
        .from("videos")
        .insert([{ ...videoData, sort_order: videos.length }]);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neues Video wurde hinzugefügt." });
        resetVideoForm();
        fetchVideos(selectedCategory.id);
      }
    }
    
    setSaving(false);
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Bist du sicher, dass du "${category.title}" löschen möchtest? Alle Videos in dieser Kategorie werden auch gelöscht.`)) return;
    
    const { error } = await supabase
      .from("video_categories")
      .delete()
      .eq("id", category.id);
    
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Kategorie wurde gelöscht." });
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null);
        setVideos([]);
      }
      fetchCategories();
    }
  };

  const deleteVideo = async (video: VideoItem) => {
    if (!confirm(`Bist du sicher, dass du "${video.title}" löschen möchtest?`)) return;
    
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);
    
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Video wurde gelöscht." });
      if (selectedCategory) {
        fetchVideos(selectedCategory.id);
      }
    }
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    fetchVideos(category.id);
  };

  // Drag & Drop handlers
  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    // Persist new sort_order
    const updates = reordered.map((cat, i) => 
      supabase.from("video_categories").update({ sort_order: i }).eq("id", cat.id)
    );
    await Promise.all(updates);
  };

  const handleVideoDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    const reordered = arrayMove(videos, oldIndex, newIndex);
    setVideos(reordered);

    // Persist new sort_order
    const updates = reordered.map((vid, i) =>
      supabase.from("videos").update({ sort_order: i }).eq("id", vid.id)
    );
    await Promise.all(updates);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <img src={logo} alt="Online DriveCoach" className="h-10" />
              </a>
              <span className="text-muted-foreground">/</span>
              <h1 className="font-display text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "stats", icon: BarChart3, label: "Statistiken" },
            { key: "users", icon: Users, label: "Benutzer" },
            { key: "videos", icon: Video, label: "Videos" },
            { key: "payments", icon: CreditCard, label: "Zahlungen" },
            { key: "product", icon: Package, label: "Produkt" },
            { key: "coupons", icon: Ticket, label: "Gutscheine" },
            { key: "testimonials", icon: MessageSquare, label: "Rezensionen" },
            { key: "reviews", icon: Star, label: "Bewertungen" },
            { key: "pages", icon: FileText, label: "Seiten" },
            { key: "pixels", icon: Code, label: "Pixels" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {activeTab === "stats" ? (
          <StatsOverview />
        ) : activeTab === "users" ? (
          <UsersManager />
        ) : activeTab === "payments" ? (
          <PaymentsManager />
        ) : activeTab === "product" ? (
          <ProductManager />
        ) : activeTab === "coupons" ? (
          <CouponsManager />
        ) : activeTab === "testimonials" ? (
          <TestimonialsManager />
        ) : activeTab === "pages" ? (
          <PagesManager />
        ) : activeTab === "pixels" ? (
          <PixelsManager />
        ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Categories List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-accent" />
                Kategorien
              </h2>
              <Button variant="hero" size="sm" onClick={() => openCategoryForm()} className="gap-1">
                <Plus className="w-4 h-4" />
                Neu
              </Button>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCategoryDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categories.map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      isSelected={selectedCategory?.id === category.id}
                      onSelect={() => selectCategory(category)}
                      onEdit={() => openCategoryForm(category)}
                      onDelete={() => deleteCategory(category)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Kategorien vorhanden
              </p>
            )}
          </div>

          {/* Videos List */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCategory ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Video className="w-5 h-5 text-accent" />
                    Videos in "{selectedCategory.title}"
                  </h2>
                  <Button variant="hero" size="sm" onClick={() => openVideoForm()} className="gap-1">
                    <Plus className="w-4 h-4" />
                    Video hinzufügen
                  </Button>
                </div>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleVideoDragEnd}
                >
                  <SortableContext
                    items={videos.map((v) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {videos.map((video) => (
                        <SortableVideoItem
                          key={video.id}
                          video={video}
                          onEdit={() => openVideoForm(video)}
                          onDelete={() => deleteVideo(video)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {videos.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Noch keine Videos in dieser Kategorie
                      </p>
                      <Button variant="hero" size="sm" onClick={() => openVideoForm()} className="mt-4 gap-1">
                        <Plus className="w-4 h-4" />
                        Video hinzufügen
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Wähle eine Kategorie aus, um Videos zu verwalten
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetCategoryForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryTitle">Titel *</Label>
                  <Input
                    id="categoryTitle"
                    value={categoryTitle}
                    onChange={(e) => setCategoryTitle(e.target.value)}
                    placeholder="z.B. Theorieprüfung"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Beschreibung</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Beschreibung der Kategorie..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoryPublished">Veröffentlicht</Label>
                  <Switch
                    id="categoryPublished"
                    checked={categoryIsPublished}
                    onCheckedChange={setCategoryIsPublished}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={resetCategoryForm} className="flex-1">
                  Abbrechen
                </Button>
                <Button variant="hero" onClick={saveCategory} disabled={saving} className="flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Speichern
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Form Modal */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editingVideo ? "Video bearbeiten" : "Neues Video"}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetVideoForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoTitle">Titel *</Label>
                  <Input
                    id="videoTitle"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="z.B. Lektion 1: Einführung"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vdocipherId">VdoCipher Video-ID *</Label>
                  <Input
                    id="vdocipherId"
                    value={vdocipherVideoId}
                    onChange={(e) => setVdocipherVideoId(e.target.value)}
                    placeholder="z.B. abc123xyz..."
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Die Video-ID findest du in deinem VdoCipher Dashboard
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="videoDescription">Beschreibung</Label>
                  <Textarea
                    id="videoDescription"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Beschreibung des Videos..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="videoDuration">Dauer</Label>
                  <Input
                    id="videoDuration"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="z.B. 12:34"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="videoPublished">Veröffentlicht</Label>
                  <Switch
                    id="videoPublished"
                    checked={videoIsPublished}
                    onCheckedChange={setVideoIsPublished}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={resetVideoForm} className="flex-1">
                  Abbrechen
                </Button>
                <Button variant="hero" onClick={saveVideo} disabled={saving} className="flex-1 gap-2">
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

export default Admin;

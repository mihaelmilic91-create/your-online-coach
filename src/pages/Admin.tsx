import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  Video, 
  BookOpen, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Save,
  X,
  Loader2
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

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  lessons_count: number;
  is_published: boolean;
  is_locked: boolean;
  sort_order: number;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  sort_order: number;
  is_published: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseIsPublished, setCourseIsPublished] = useState(false);
  const [courseIsLocked, setCourseIsLocked] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Lesson form
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonIsPublished, setLessonIsPublished] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      fetchCourses();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchLessons = async (courseId: string) => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });
    
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      setLessons(data || []);
    }
  };

  const resetCourseForm = () => {
    setCourseTitle("");
    setCourseDescription("");
    setCourseDuration("");
    setCourseIsPublished(false);
    setCourseIsLocked(false);
    setThumbnailFile(null);
    setEditingCourse(null);
    setShowCourseForm(false);
  };

  const resetLessonForm = () => {
    setLessonTitle("");
    setLessonDescription("");
    setLessonDuration("");
    setLessonIsPublished(false);
    setVideoFile(null);
    setEditingLesson(null);
    setShowLessonForm(false);
    setUploadProgress(0);
  };

  const openCourseForm = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseTitle(course.title);
      setCourseDescription(course.description || "");
      setCourseDuration(course.duration || "");
      setCourseIsPublished(course.is_published);
      setCourseIsLocked(course.is_locked);
    }
    setShowCourseForm(true);
  };

  const openLessonForm = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description || "");
      setLessonDuration(lesson.duration || "");
      setLessonIsPublished(lesson.is_published);
    }
    setShowLessonForm(true);
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

  const uploadVideo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    setUploadProgress(10);
    
    const { error } = await supabase.storage
      .from("course-videos")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    setUploadProgress(90);
    
    if (error) {
      toast({ variant: "destructive", title: "Upload fehlgeschlagen", description: error.message });
      setUploadProgress(0);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("course-videos")
      .getPublicUrl(fileName);
    
    setUploadProgress(100);
    return publicUrl;
  };

  const saveCourse = async () => {
    if (!courseTitle.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Titel ist erforderlich" });
      return;
    }
    
    setSaving(true);
    
    let thumbnailUrl = editingCourse?.thumbnail_url || null;
    if (thumbnailFile) {
      thumbnailUrl = await uploadThumbnail(thumbnailFile);
    }
    
    const courseData = {
      title: courseTitle.trim(),
      description: courseDescription.trim() || null,
      duration: courseDuration.trim() || null,
      thumbnail_url: thumbnailUrl,
      is_published: courseIsPublished,
      is_locked: courseIsLocked,
    };
    
    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", editingCourse.id);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Kurs wurde aktualisiert." });
        resetCourseForm();
        fetchCourses();
      }
    } else {
      const { error } = await supabase
        .from("courses")
        .insert([{ ...courseData, sort_order: courses.length }]);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neuer Kurs wurde erstellt." });
        resetCourseForm();
        fetchCourses();
      }
    }
    
    setSaving(false);
  };

  const saveLesson = async () => {
    if (!selectedCourse || !lessonTitle.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Titel ist erforderlich" });
      return;
    }
    
    setSaving(true);
    
    let videoUrl = editingLesson?.video_url || null;
    if (videoFile) {
      videoUrl = await uploadVideo(videoFile);
      if (!videoUrl) {
        setSaving(false);
        return;
      }
    }
    
    const lessonData = {
      course_id: selectedCourse.id,
      title: lessonTitle.trim(),
      description: lessonDescription.trim() || null,
      duration: lessonDuration.trim() || null,
      video_url: videoUrl,
      is_published: lessonIsPublished,
    };
    
    if (editingLesson) {
      const { error } = await supabase
        .from("lessons")
        .update(lessonData)
        .eq("id", editingLesson.id);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Gespeichert", description: "Lektion wurde aktualisiert." });
        resetLessonForm();
        fetchLessons(selectedCourse.id);
        updateLessonsCount(selectedCourse.id);
      }
    } else {
      const { error } = await supabase
        .from("lessons")
        .insert([{ ...lessonData, sort_order: lessons.length }]);
      
      if (error) {
        toast({ variant: "destructive", title: "Fehler", description: error.message });
      } else {
        toast({ title: "Erstellt", description: "Neue Lektion wurde erstellt." });
        resetLessonForm();
        fetchLessons(selectedCourse.id);
        updateLessonsCount(selectedCourse.id);
      }
    }
    
    setSaving(false);
  };

  const updateLessonsCount = async (courseId: string) => {
    const { count } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId);
    
    await supabase
      .from("courses")
      .update({ lessons_count: count || 0 })
      .eq("id", courseId);
    
    fetchCourses();
  };

  const deleteCourse = async (course: Course) => {
    if (!confirm(`Bist du sicher, dass du "${course.title}" löschen möchtest?`)) return;
    
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);
    
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Kurs wurde gelöscht." });
      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
        setLessons([]);
      }
      fetchCourses();
    }
  };

  const deleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Bist du sicher, dass du "${lesson.title}" löschen möchtest?`)) return;
    
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lesson.id);
    
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht", description: "Lektion wurde gelöscht." });
      if (selectedCourse) {
        fetchLessons(selectedCourse.id);
        updateLessonsCount(selectedCourse.id);
      }
    }
  };

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Courses List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Kurse
              </h2>
              <Button variant="hero" size="sm" onClick={() => openCourseForm()} className="gap-1">
                <Plus className="w-4 h-4" />
                Neu
              </Button>
            </div>
            
            <div className="space-y-2">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedCourse?.id === course.id 
                        ? 'ring-2 ring-accent shadow-elevated' 
                        : 'hover:shadow-soft'
                    }`}
                    onClick={() => selectCourse(course)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {course.lessons_count} Lektionen
                            </span>
                            {course.is_published ? (
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
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openCourseForm(course); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteCourse(course); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {courses.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Kurse vorhanden
                </p>
              )}
            </div>
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCourse ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Video className="w-5 h-5 text-accent" />
                    Lektionen: {selectedCourse.title}
                  </h2>
                  <Button variant="hero" size="sm" onClick={() => openLessonForm()} className="gap-1">
                    <Plus className="w-4 h-4" />
                    Lektion
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {lessons.map((lesson) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="hover:shadow-soft transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{lesson.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {lesson.duration && (
                                  <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                )}
                                {lesson.video_url ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                    Video ✓
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                    Kein Video
                                  </span>
                                )}
                                {lesson.is_published ? (
                                  <Eye className="w-3 h-3 text-accent" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLessonForm(lesson)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLesson(lesson)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {lessons.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground py-12">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Noch keine Lektionen in diesem Kurs</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Wähle einen Kurs aus, um Lektionen zu verwalten</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {editingCourse ? "Kurs bearbeiten" : "Neuer Kurs"}
                </h2>
                <Button variant="ghost" size="icon" onClick={resetCourseForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseTitle">Titel *</Label>
                  <Input
                    id="courseTitle"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="z.B. Grundlagen"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseDescription">Beschreibung</Label>
                  <Textarea
                    id="courseDescription"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Kurzbeschreibung des Kurses..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseDuration">Dauer</Label>
                  <Input
                    id="courseDuration"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="z.B. 45 Min"
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
                  <Label htmlFor="coursePublished">Veröffentlicht</Label>
                  <Switch
                    id="coursePublished"
                    checked={courseIsPublished}
                    onCheckedChange={setCourseIsPublished}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="courseLocked">Gesperrt</Label>
                  <Switch
                    id="courseLocked"
                    checked={courseIsLocked}
                    onCheckedChange={setCourseIsLocked}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={resetCourseForm}>
                  Abbrechen
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={saveCourse} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Speichern
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {editingLesson ? "Lektion bearbeiten" : "Neue Lektion"}
                </h2>
                <Button variant="ghost" size="icon" onClick={resetLessonForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonTitle">Titel *</Label>
                  <Input
                    id="lessonTitle"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="z.B. Einführung"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lessonDescription">Beschreibung</Label>
                  <Textarea
                    id="lessonDescription"
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Was lernt man in dieser Lektion..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lessonDuration">Dauer</Label>
                  <Input
                    id="lessonDuration"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="z.B. 5 Min"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video">Video (max. 500MB)</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="lessonPublished">Veröffentlicht</Label>
                  <Switch
                    id="lessonPublished"
                    checked={lessonIsPublished}
                    onCheckedChange={setLessonIsPublished}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={resetLessonForm}>
                  Abbrechen
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={saveLesson} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {videoFile && !editingLesson?.video_url ? "Upload & Speichern" : "Speichern"}
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

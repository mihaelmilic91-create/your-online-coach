import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import VideoPlayer from "@/components/VideoPlayer";
import logo from "@/assets/logo.png";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  sort_order: number | null;
  course_id: string;
}

interface Course {
  id: string;
  title: string;
}

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Check access
      const { data: accessData } = await supabase.functions.invoke("check-access");
      if (!accessData?.hasAccess) {
        navigate("/dashboard");
        return;
      }
      setHasAccess(true);

      // Load course
      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .maybeSingle();

      if (!courseData) {
        navigate("/dashboard");
        return;
      }
      setCourse(courseData);

      // Load all lessons for this course
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      setLessons(lessonsData || []);

      // Find current lesson
      const currentLesson = lessonsData?.find((l) => l.id === lessonId);
      if (!currentLesson) {
        navigate("/dashboard");
        return;
      }
      setLesson(currentLesson);
      setLoading(false);
    };

    checkAccessAndLoad();
  }, [courseId, lessonId, navigate]);

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const handleVideoProgress = (progress: number) => {
    // TODO: Save progress to database
    console.log("Progress:", progress);
  };

  const handleVideoEnded = () => {
    // Auto-advance to next lesson
    if (nextLesson) {
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!lesson || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src={logo} alt="Online DriveCoach" className="h-8" />
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link
                to={`/course/${courseId}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {course?.title}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            to={`/course/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Kursübersicht
          </Link>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {lesson.video_url ? (
              <VideoPlayer
                src={lesson.video_url}
                title={lesson.title}
                onProgress={handleVideoProgress}
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <p className="text-muted-foreground">Kein Video verfügbar</p>
              </div>
            )}
          </motion.div>

          {/* Lesson Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-muted-foreground">{lesson.description}</p>
            )}
            {lesson.duration && (
              <p className="text-sm text-muted-foreground mt-2">
                Dauer: {lesson.duration}
              </p>
            )}
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between border-t border-border pt-6"
          >
            {prevLesson ? (
              <Button
                variant="outline"
                asChild
                className="gap-2"
              >
                <Link to={`/course/${courseId}/lesson/${prevLesson.id}`}>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{prevLesson.title}</span>
                  <span className="sm:hidden">Zurück</span>
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button
                variant="hero"
                asChild
                className="gap-2"
              >
                <Link to={`/course/${courseId}/lesson/${nextLesson.id}`}>
                  <span className="hidden sm:inline">{nextLesson.title}</span>
                  <span className="sm:hidden">Weiter</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="hero" asChild>
                <Link to={`/course/${courseId}`}>Kurs abschließen</Link>
              </Button>
            )}
          </motion.div>

          {/* Lesson List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Alle Lektionen
            </h2>
            <div className="space-y-2">
              {lessons.map((l, index) => (
                <Link
                  key={l.id}
                  to={`/course/${courseId}/lesson/${l.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    l.id === lessonId
                      ? "bg-accent/10 border border-accent/30"
                      : "hover:bg-muted"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      l.id === lessonId
                        ? "bg-accent text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        l.id === lessonId ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {l.title}
                    </p>
                    {l.duration && (
                      <p className="text-xs text-muted-foreground">{l.duration}</p>
                    )}
                  </div>
                  {l.id === lessonId && (
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;

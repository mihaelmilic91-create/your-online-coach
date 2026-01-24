import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Clock, Video, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  lessons_count: number | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  sort_order: number | null;
  video_url: string | null;
}

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
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
        .select("*")
        .eq("id", courseId)
        .maybeSingle();

      if (!courseData) {
        navigate("/dashboard");
        return;
      }
      setCourse(courseData);

      // Load lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      setLessons(lessonsData || []);
      setLoading(false);
    };

    checkAccessAndLoad();
  }, [courseId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!course || !hasAccess) {
    return null;
  }

  const firstLesson = lessons[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={logo} alt="Online DriveCoach" className="h-8" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </Link>

          {/* Course Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {course.thumbnail_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-6">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-lg text-muted-foreground mb-4">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              {course.duration && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                {lessons.length} {lessons.length === 1 ? "Lektion" : "Lektionen"}
              </span>
            </div>

            {firstLesson && (
              <Button variant="hero" size="lg" asChild>
                <Link to={`/course/${courseId}/lesson/${firstLesson.id}`}>
                  <Play className="w-5 h-5 mr-2" />
                  Kurs starten
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Lessons List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Lektionen ({lessons.length})
            </h2>

            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  to={`/course/${courseId}/lesson/${lesson.id}`}
                >
                  <Card className="hover:shadow-elevated transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        {lesson.duration && (
                          <span className="text-sm text-muted-foreground flex-shrink-0">
                            {lesson.duration}
                          </span>
                        )}
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {lessons.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Noch keine Lektionen verfügbar.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CoursePage;

import { motion } from "framer-motion";
import { Play, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Courses = () => {
  // Note: These are placeholder courses based on "Kat. B" driving content
  // Real course data should be fetched from the backend
  const courses = [
    {
      title: "Grundlagen des Fahrens",
      lessons: 8,
      duration: "45 Min",
      level: "Anfänger",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop",
      free: true,
      description: "Lenkrad, Pedale, Spiegel richtig einstellen",
    },
    {
      title: "Parkieren & Manövrieren",
      lessons: 12,
      duration: "1h 20min",
      level: "Fortgeschritten",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
      free: false,
      description: "Seitwärts, rückwärts und vorwärts parkieren",
    },
    {
      title: "Autobahnfahren",
      lessons: 6,
      duration: "35 Min",
      level: "Fortgeschritten",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
      free: false,
      description: "Auffahren, Spurwechsel, Ausfahren",
    },
    {
      title: "Prüfungsvorbereitung",
      lessons: 10,
      duration: "55 Min",
      level: "Alle Level",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop",
      free: false,
      description: "Alle prüfungsrelevanten Themen der Kat. B",
    },
  ];

  const levelColors: Record<string, string> = {
    "Anfänger": "bg-accent/10 text-accent",
    "Fortgeschritten": "bg-primary/10 text-primary",
    "Alle Level": "bg-accent/10 text-accent",
  };

  return (
    <section id="kurse" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Lernvideos
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Alle prüfungsrelevanten Themen der Kat. B
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professionelle Lernvideos für jeden Schritt deiner Fahrausbildung – von einem erfahrenen Schweizer Fahrlehrer erstellt
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card shadow-card rounded-2xl overflow-hidden group hover:shadow-elevated transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
                    <Play className="w-6 h-6 text-accent-foreground ml-1" />
                  </div>
                </div>

                {/* Free/Premium badge */}
                <div className="absolute top-3 left-3">
                  {course.free ? (
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      GRATIS
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PREMIUM
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${levelColors[course.level]} mb-3`}>
                  {course.level}
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    <span>{course.lessons} Lektionen</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="hero" size="lg" asChild>
            <a href="/register">Alle Kurse ansehen</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Lock, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CategoryWithCount {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  videoCount: number;
}

// Fallback images for categories without thumbnails
const fallbackImages: Record<string, string> = {
  "Wilkommen": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop",
  "Start": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
  "Basics": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop",
  "Advanced": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
  "Expert": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop",
  "Manöver": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
};

const defaultImage = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop";

const Courses = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: cats } = await supabase
          .from("video_categories")
          .select("id, title, description, thumbnail_url")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (!cats || cats.length === 0) {
          setLoading(false);
          return;
        }

        const { data: counts } = await supabase
          .from("videos")
          .select("category_id")
          .eq("is_published", true);

        const countMap: Record<string, number> = {};
        counts?.forEach(v => {
          countMap[v.category_id] = (countMap[v.category_id] || 0) + 1;
        });

        setCategories(cats.map(c => ({
          ...c,
          videoCount: countMap[c.id] || 0,
        })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Show max 4 categories for the landing page
  const displayCategories = categories.slice(0, 4);

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
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))
            : displayCategories.map((category, index) => {
                const isFirst = index === 0;
                const image = category.thumbnail_url || fallbackImages[category.title] || defaultImage;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card shadow-card rounded-2xl overflow-hidden group hover:shadow-elevated transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={image}
                        alt={category.title}
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
                        {isFirst ? (
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
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        {category.title}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{category.videoCount} Videos</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {categories.length > 4 && (
          <p className="text-center text-muted-foreground mt-4 text-sm">
            + {categories.length - 4} weitere Kategorien
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-lg text-muted-foreground line-through">CHF 129.–</span>
            <span className="font-display text-2xl font-bold text-foreground">CHF 79.–</span>
            <span className="text-sm text-muted-foreground">/ Jahr</span>
          </div>
          <Button variant="hero" size="lg" asChild>
            <a href="/zugang">Alle Kurse freischalten</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;

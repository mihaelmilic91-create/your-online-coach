import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Lock, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CategoryWithCount {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  videoCount: number;
  posterUrl: string | null;
}

const WELCOME_VDOCIPHER_ID = "fbe405996ffd475393cd737d4a1bed37";

const Courses = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [welcomeOtp, setWelcomeOtp] = useState<{ otp: string; playbackInfo: string } | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [{ data: cats }, { data: videos }] = await Promise.all([
          supabase
            .from("video_categories")
            .select("id, title, description, thumbnail_url")
            .eq("is_published", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("videos")
            .select("category_id, vdocipher_video_id")
            .eq("is_published", true),
        ]);

        if (!cats || cats.length === 0) {
          setLoading(false);
          return;
        }

        const countMap: Record<string, number> = {};
        const firstVideoMap: Record<string, string> = {};
        videos?.forEach(v => {
          countMap[v.category_id] = (countMap[v.category_id] || 0) + 1;
          if (!firstVideoMap[v.category_id]) {
            firstVideoMap[v.category_id] = v.vdocipher_video_id;
          }
        });

        // Fetch poster thumbnails from VdoCipher
        const vdoIds = Object.values(firstVideoMap);
        let posterMap: Record<string, string | null> = {};

        if (vdoIds.length > 0) {
          try {
            const { data: posterData } = await supabase.functions.invoke("get-video-posters", {
              body: { videoIds: vdoIds },
            });
            posterMap = posterData?.posters || {};
          } catch (err) {
            console.error("Error fetching posters:", err);
          }
        }

        setCategories(cats.map(c => ({
          ...c,
          videoCount: countMap[c.id] || 0,
          posterUrl: firstVideoMap[c.id] ? (posterMap[firstVideoMap[c.id]] || null) : null,
        })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handlePlayWelcome = async () => {
    setLoadingVideo(true);
    setShowWelcomeVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-public-video-otp", {
        body: { videoId: WELCOME_VDOCIPHER_ID },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setWelcomeOtp(data);
    } catch (err) {
      console.error("Error loading welcome video:", err);
      setShowWelcomeVideo(false);
    } finally {
      setLoadingVideo(false);
    }
  };

  const displayCategories = categories.slice(0, 4);

  return (
    <section id="kurse" className="py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm font-bold uppercase tracking-widest mb-3">
            Lernvideos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Alle <span className="text-accent">prüfungsrelevanten</span> Themen der Kat. B
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
                  </div>
                </div>
              ))
            : displayCategories.map((category, index) => {
                const isWelcome = index === 0;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card shadow-card rounded-2xl overflow-hidden group hover:shadow-elevated transition-all duration-300 cursor-pointer"
                    onClick={isWelcome ? handlePlayWelcome : undefined}
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      {category.posterUrl ? (
                        <img
                          src={category.posterUrl}
                          alt={category.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Play className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
                          <Play className="w-6 h-6 text-accent-foreground ml-1" />
                        </div>
                      </div>

                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        {isWelcome ? (
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
                        {isWelcome && (
                          <span className="text-accent font-medium text-xs">▶ Jetzt ansehen</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {categories.length > 4 && (
          <p className="text-center text-muted-foreground mt-4 text-sm">
            + weitere Kategorien
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
            <span className="font-display text-2xl font-bold text-foreground">CHF 79.–</span>
            <span className="text-sm text-muted-foreground">/ Jahr</span>
          </div>
          <Button variant="hero" size="lg" asChild>
            <Link to="/zugang">Alle Kurse freischalten</Link>
          </Button>
        </motion.div>
      </div>

      {/* Welcome Video Modal */}
      <AnimatePresence>
        {showWelcomeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowWelcomeVideo(false); setWelcomeOtp(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowWelcomeVideo(false); setWelcomeOtp(null); }}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {loadingVideo || !welcomeOtp ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent" />
                </div>
              ) : (
                <iframe
                  src={`https://player.vdocipher.com/v2/?otp=${welcomeOtp.otp}&playbackInfo=${welcomeOtp.playbackInfo}&autoplay=true`}
                  style={{ width: "100%", height: "100%", border: 0 }}
                  allow="encrypted-media; fullscreen; picture-in-picture; autoplay"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Courses;

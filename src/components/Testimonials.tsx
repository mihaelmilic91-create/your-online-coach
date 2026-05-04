import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ApprovedReview {
  id: string;
  first_name: string | null;
  city: string | null;
  star_rating: number | null;
  review_text: string | null;
  saved_lessons: string | null;
}

const Testimonials = () => {
  const [reviews, setReviews] = useState<ApprovedReview[]>([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, avgSavedLessons: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
      // Fetch approved reviews with publish permission
      const { data } = await supabase
        .from("public_reviews" as any)
        .select("id, first_name, city, star_rating, review_text, saved_lessons")
        .eq("flow_type", "review")
        .not("star_rating", "is", null)
        .order("review_date", { ascending: false });

      if (data && data.length > 0) {
        setReviews(data);

        // Calculate stats
        const ratings = data.filter(r => r.star_rating).map(r => r.star_rating!);
        const avgRating = ratings.length > 0
          ? ratings.reduce((s, r) => s + r, 0) / ratings.length
          : 0;

        const lessonsMap: Record<string, number> = { "0–1": 0.5, "2–3": 2.5, "4–5": 4.5, "6+": 7 };
        const savedArr = data.filter(r => r.saved_lessons).map(r => lessonsMap[r.saved_lessons!] || 0);
        const avgSaved = savedArr.length > 0
          ? savedArr.reduce((s, v) => s + v, 0) / savedArr.length
          : 0;

        setStats({
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: data.length,
          avgSavedLessons: Math.round(avgSaved * 10) / 10,
        });
      } else {
        // Fallback: load old testimonials table
        const { data: oldData } = await supabase
          .from("testimonials")
          .select("id, name, location, image_url, rating, text")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });
        if (oldData && oldData.length > 0) {
          setReviews(oldData.map(t => ({
            id: t.id,
            first_name: t.name,
            city: t.location,
            star_rating: t.rating,
            review_text: t.text,
            saved_lessons: null,
          })));
          const avg = oldData.reduce((s, t) => s + t.rating, 0) / oldData.length;
          setStats({ avgRating: Math.round(avg * 10) / 10, totalReviews: oldData.length, avgSavedLessons: 0 });
        }
      }
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  const statsDisplay = [
    { value: `⭐ ${stats.avgRating} / 5`, label: `aus ${stats.totalReviews} Bewertungen` },
    ...(stats.avgSavedLessons > 0
      ? [{ value: `${stats.avgSavedLessons}`, label: "Ø gesparte Fahrstunden" }]
      : [{ value: "85%", label: "fühlen sich sicherer auf der Strasse" }]),
    { value: "4+", label: "Fahrstunden gespart im Durchschnitt" },
  ];

  return (
    <section id="testimonials" className="py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Erfahrungen
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Das sagen unsere Lernfahrer
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Höre, was unsere erfolgreichen Fahrschüler über ihre Erfahrung sagen
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Reviews */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.slice(0, 6).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-card shadow-card rounded-3xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Rating */}
              {review.star_rating && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.star_rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}

              {/* Text */}
              {review.review_text && (
                <p className="text-foreground text-sm leading-relaxed mb-2">
                  „{review.review_text.length > 150 ? review.review_text.slice(0, 150).trimEnd() + '…' : review.review_text}"
                </p>
              )}

              {/* Saved lessons */}
              {review.saved_lessons && (
                <p className="text-xs text-accent font-medium mb-4">
                  ~{review.saved_lessons} Fahrstunden gespart
                </p>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-semibold text-sm">
                    {(review.first_name || "?").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{review.first_name || "Anonym"}</p>
                  {review.city && (
                    <p className="text-xs text-muted-foreground">{review.city}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import SEOMeta from "@/components/SEOMeta";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tag: string;
  image_url: string | null;
}

const Blog = () => {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, tag, image_url")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      setArticles(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEOMeta
        title="Ratgeber Fahrprüfung Schweiz – Tipps vom Fahrlehrer | Online Drivecoach"
        description="Tipps und Erklärungen zur praktischen Fahrprüfung Kat. B in der Schweiz — von einem ausgebildeten Schweizer Fahrlehrer. Manöver, Lernfrist, Kontrollfahrt."
        canonical="https://www.onlinedrivecoach.ch/blog"
      />
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Ratgeber & Blog
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            Tipps und Erklärungen zur praktischen Fahrprüfung Kat. B in der Schweiz —
            von einem ausgebildeten Schweizer Fahrlehrer.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map(({ id, slug, title, excerpt, tag, image_url }) => (
                <Link
                  key={id}
                  to={`/blog/${slug}`}
                  className="block p-6 bg-card rounded-2xl border border-border hover:border-accent/40 transition-colors group"
                >
                  {image_url && (
                    <img src={image_url} alt={title} className="w-full h-48 object-cover rounded-xl mb-4" />
                  )}
                  <span className="text-xs font-semibold text-accent uppercase tracking-wide mb-2 block">
                    {tag}
                  </span>
                  <h2 className="font-display text-lg font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                    {title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {excerpt}
                  </p>
                </Link>
              ))}
              {articles.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Noch keine Blogbeiträge vorhanden.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

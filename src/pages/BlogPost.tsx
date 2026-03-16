import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";

const CTABox = () => (
  <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 my-10">
    <h3 className="font-display text-xl font-bold text-foreground mb-2">
      Jetzt vorbereiten — günstiger als eine Fahrstunde
    </h3>
    <p className="text-muted-foreground mb-4">
      Über 30 Lernvideos für die praktische Fahrprüfung Kat. B in der Schweiz.
      Von einem ausgebildeten Schweizer Fahrlehrer. POV-Aufnahmen aus der Fahrerperspektive.
      CHF 79.– einmalig — günstiger als eine einzige Fahrstunde (ca. CHF 90.–).
    </p>
    <Link
      to="/zugang"
      className="inline-block bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
    >
      Jetzt Zugang sichern →
    </Link>
  </div>
);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<{ title: string; content: string; tag: string; image_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("title, content, tag, image_url")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (notFound) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {post.tag && (
            <span className="text-xs font-semibold text-accent uppercase tracking-wide mb-3 block">
              {post.tag}
            </span>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            {post.title}
          </h1>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />
          )}
          <div
            className="prose prose-lg max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <CTABox />
          <div className="pt-8 border-t border-border">
            <Link to="/blog" className="text-accent hover:underline text-sm">
              ← Zurück zum Blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;

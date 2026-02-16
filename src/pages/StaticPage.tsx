import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pages")
        .select("title, content")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        navigate("/404");
        return;
      }
      setPage(data);
      setLoading(false);
    };
    fetchPage();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {page.title}
          </h1>
          <div
            className="prose prose-lg max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default StaticPage;

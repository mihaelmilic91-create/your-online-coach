import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-28 bg-foreground">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-footer-foreground leading-tight">
            Werde Teil der grössten Online-Fahrschule der Schweiz.
          </h2>
          <p className="text-footer-foreground/70 text-lg md:text-xl">
            Starte heute und bereite dich richtig vor — für weniger als eine Fahrstunde kostet.
          </p>
          <div className="pt-4">
            <Button variant="hero" size="xl" className="gap-2 text-lg px-10 py-6" asChild>
              <Link to="/zugang">
                Jetzt Zugang sichern — CHF 79.–
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          <p className="text-footer-foreground/40 text-sm">
            🇨🇭 Swiss made · Sofortiger Zugang nach Kauf · 1 Jahr Zugang
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;

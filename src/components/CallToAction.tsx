import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  const features = [
    "Über 30 professionelle Lernvideos",
    "Alle prüfungsrelevanten Themen der Kat. B",
    "Echte Aufnahmen von Schweizer Strassen",
    "Auch für Begleitpersonen geeignet",
    "Jederzeit und überall verfügbar",
  ];

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-50" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8 text-center"
          >
            <p className="text-accent text-sm font-bold uppercase tracking-widest">
              Dein Zugang
            </p>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Alles für die Prüfung — <span className="text-accent">in einem Zugang.</span>
            </h2>

            <ul className="space-y-3 inline-block text-left">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* Price */}
            <div className="bg-card shadow-elevated rounded-2xl p-8 space-y-5 border-2 border-accent/20">
              <div className="space-y-2">
                <div className="flex items-baseline gap-3 justify-center">
                  <span className="font-display text-5xl font-bold text-foreground">CHF 79.–</span>
                  <span className="text-sm text-muted-foreground">einmalig · 1 Jahr Zugang</span>
                </div>
                <p className="text-xl md:text-2xl font-display font-bold text-accent">= weniger als eine einzige Fahrstunde</p>
              </div>

              <Button variant="hero" size="xl" className="gap-2 w-full text-lg" asChild>
                <Link to="/zugang">
                  Jetzt Zugang sichern — CHF 79.–
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                🇨🇭 Swiss made · Sofortiger Zugang nach Kauf
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

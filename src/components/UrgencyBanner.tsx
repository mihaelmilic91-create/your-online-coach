import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UrgencyBanner = () => {
  return (
    <section className="py-14 bg-accent">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <p className="font-display text-2xl md:text-3xl font-bold text-accent-foreground">
            Jede Fahrstunde ohne Vorbereitung kostet dich CHF 90.–.
          </p>
          <p className="text-accent-foreground/80 text-lg">
            Starte heute — für weniger als eine Fahrstunde.
          </p>
          <div className="pt-2">
            <Button
              size="xl"
              className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 font-bold"
              asChild
            >
              <Link to="/zugang">Jetzt Zugang sichern</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UrgencyBanner;

import { motion } from "framer-motion";
import { BookOpen, Car, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Lerne was der Experte sieht",
    description:
      "Alle prüfungsrelevanten Themen strukturiert erklärt — was bewertet wird, was sofort zur Abnahme führt.",
  },
  {
    number: "02",
    icon: Car,
    title: "Nutze jede Fahrstunde effizienter",
    description:
      "Du kommst vorbereitet zum Fahrlehrer. Du weisst was heute geübt wird. Weniger Stunden, mehr Fortschritt.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Geh sicher in die Prüfung",
    description:
      "Vor der Prüfung gehst du alles nochmals durch. Du weisst was dich erwartet. Du gehst nicht hoffend rein.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm font-bold uppercase tracking-widest mb-3">
            In 3 Schritten
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Vom Lernen zur <span className="text-accent">bestandenen</span> Prüfung
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Drei Schritte. Vorbereitet ins Auto. Sicher durch die Prüfung.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-accent/20" />
              )}

              {/* Number + Icon */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 mb-5">
                <step.icon className="w-8 h-8 text-accent" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

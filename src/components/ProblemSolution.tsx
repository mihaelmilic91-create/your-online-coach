import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    "Du nimmst Fahrstunden ohne zu wissen was geübt werden soll",
    "Deine Eltern bringen dir bei wie sie fahren — nicht wie es der Experte erwartet",
    "Du verlierst den Faden in der 1-jährigen Lernphase",
    "Du gehst hoffend in die Prüfung — nicht vorbereitet",
    "Bis zu CHF 5'400 für Fahrstunden",
  ];

  const solutions = [
    "Du weisst vor jeder Fahrstunde genau was heute geübt wird",
    "Deine Begleitperson weiss was sie dir zeigen soll — und was nicht",
    "Roter Faden durch die gesamte Lernphase — jederzeit abrufbar",
    "Du weisst was der Experte sehen will — und zeigst es ihm",
    "Weniger Fahrstunden, mehr Erfolg",
  ];

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
            Das Problem
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Warum so viele <span className="text-accent">unnötig</span> durchfallen
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Jede dritte praktische Fahrprüfung in der Schweiz wird nicht bestanden. Nicht weil die Leute schlecht fahren — sondern weil sie nicht wussten was der Experte bewertet.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden"
          >
            {/* Red accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />

            <div className="flex items-center gap-2 mb-8">
              <X className="w-5 h-5 text-destructive" strokeWidth={3} />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-destructive">
                Ohne Online Drivecoach
              </h3>
            </div>

            <ul className="space-y-6">
              {problems.map((text, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-foreground leading-relaxed">{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden"
          >
            {/* Green accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />

            <div className="flex items-center gap-2 mb-8">
              <Check className="w-5 h-5 text-accent" strokeWidth={3} />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent">
                Mit Online Drivecoach
              </h3>
            </div>

            <ul className="space-y-6">
              {solutions.map((text, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-foreground leading-relaxed">{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;

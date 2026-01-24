import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, DollarSign, HelpCircle, Zap, Lightbulb, Target } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    { icon: DollarSign, text: "Fahrstunden sind teuer – jede Lektion kostet zwischen CHF 90 und CHF 120." },
    { icon: HelpCircle, text: "Privatfahrten mit den Eltern oder Begleitpersonen sind oft unsicher – man weiss nicht genau, wie man richtig üben soll." },
    { icon: AlertTriangle, text: "Viele Lernfahrer fühlen sich schlecht vorbereitet und unsicher vor der Prüfung." },
  ];

  const solutions = [
    { icon: Lightbulb, text: "Unsere App erklärt dir alle Fahrlektionen, wie es dir ein Fahrlehrer erklären würde." },
    { icon: Target, text: "So kannst du gezielt mit deinen Begleitpersonen üben und bist optimal vorbereitet." },
    { icon: Zap, text: "Spare durchschnittlich 4+ Fahrstunden – das entspricht über CHF 400!" },
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Das Problem & Die Lösung
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Wir verstehen die Herausforderungen beim Fahren lernen und bieten die perfekte Lösung
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-red-700 dark:text-red-400">
                Das Problem
              </h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <problem.icon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{problem.text}</span>
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
            className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900/50 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-green-700 dark:text-green-400">
                Die Lösung
              </h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <solution.icon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{solution.text}</span>
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

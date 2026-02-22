import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, DollarSign, HelpCircle, Zap, Lightbulb, Target } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    { icon: DollarSign, text: "Jedes neue Thema wird zuerst im Auto erklärt." },
    { icon: HelpCircle, text: "Diese Erklärzeit geht von deiner Fahrlektion ab." },
    { icon: AlertTriangle, text: "Über 30 Themen summieren sich schnell." },
    { icon: AlertTriangle, text: "Wertvolle Praxiszeit geht verloren." },
  ];

  const solutions = [
    { icon: Lightbulb, text: "Lerne alle prüfungsrelevanten Themen digital vorab." },
    { icon: Target, text: "Steige vorbereitet ins Auto." },
    { icon: Zap, text: "Nutze Fahrstunden gezielt für Praxis." },
    { icon: CheckCircle, text: "Reduziere Erklärzeit – und spare mehrere Fahrstunden." },
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
            Warum viele unnötige Fahrstunden bezahlen
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            In der Schweiz gibt es keine Pflichtfahrstunden –
            trotzdem wird wertvolle Fahrzeit oft fürs Erklären genutzt.
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

        {/* Zusatztext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto"
        >
          💡 Allein die reine Erklärzeit entspricht rund 4 Fahrstunden.
          Wenn du zusätzlich Manöver privat vorbereitest, kannst du noch mehr einsparen.
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSolution;

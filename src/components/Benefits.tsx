import { motion } from "framer-motion";
import { Layers, Eye, Car, Clock } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: Layers,
      title: "Strukturiert statt zufällig",
      description: "Alle prüfungsrelevanten Themen klar aufgebaut – so lernst du Schritt für Schritt, nicht durcheinander.",
    },
    {
      icon: Eye,
      title: "Praxisnah erklärt",
      description: "Jedes Thema wird so vermittelt, wie es in der Fahrausbildung wirklich vorkommt – verständlich und direkt umsetzbar.",
    },
    {
      icon: Car,
      title: "Vorbereitet ins Auto",
      description: "Du kennst Abläufe, Blickführung und Manöver, bevor du die nächste Fahrstunde startest.",
    },
    {
      icon: Clock,
      title: "Private Lernfahrten sinnvoll nutzen",
      description: "Dank digitaler Vorbereitung wird jede Fahrminute effektiv genutzt – für Übung statt Erklärung.",
    },
  ];

  return (
    <section id="vorteile" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Warum Online Drivecoach anders ist
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card shadow-card rounded-2xl p-6 hover:shadow-elevated transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          💡 Über 30 strukturierte Themen – jederzeit abrufbar.
        </motion.p>
      </div>
    </section>
  );
};

export default Benefits;

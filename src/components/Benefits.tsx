import { motion } from "framer-motion";
import { MapPin, Wallet, GraduationCap, BookOpen } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: MapPin,
      title: "Lerne überall & jederzeit",
      description: "Mit unserer App hast du deine Fahrstunden immer dabei. Lerne im Bus, in der Pause oder zu Hause.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Wallet,
      title: "Spare bei Fahrstunden",
      description: "Gut vorbereitet brauchst du weniger praktische Stunden. Das spart dir hunderte Franken.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: GraduationCap,
      title: "Lerne von Experten",
      description: "Unsere Videos wurden von erfahrenen Fahrlehrern mit über 20 Jahren Erfahrung erstellt.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: BookOpen,
      title: "Alle Prüfungsthemen",
      description: "Von der Autobahnfahrt bis zum Parkieren – wir decken alle relevanten Manöver ab.",
      color: "bg-amber-100 text-amber-600",
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
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Vorteile
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Weshalb Online DriveCoach?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Entdecke, warum tausende Fahrschüler in der Schweiz auf uns vertrauen
          </p>
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
              <div className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
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
      </div>
    </section>
  );
};

export default Benefits;

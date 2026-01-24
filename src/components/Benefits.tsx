import { motion } from "framer-motion";
import { MapPin, Wallet, GraduationCap, Video } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: MapPin,
      title: "Lerne überall & jederzeit",
      description: "Ob im Zug, im Bett oder auf dem Sofa – du hast deine Fahrstunden immer dabei, wann und wo du willst.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Wallet,
      title: "Spare durchschnittlich 4+ Fahrstunden",
      description: "Das entspricht einer Ersparnis von über CHF 400 – weil du mit gezieltem Wissen in die Praxis gehst.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: GraduationCap,
      title: "Lerne von einem Experten",
      description: "Alle Inhalte wurden von einem erfahrenen Schweizer Fahrlehrer erstellt – praxisnah, verständlich und auf den Punkt.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Video,
      title: "Echte Aufnahmen von Schweizer Strassen",
      description: "Unsere Videos zeigen dir echte Situationen auf Schweizer Strassen – so lernst du, was dich in der Prüfung wirklich erwartet.",
      color: "bg-accent/10 text-accent",
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
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Vorteile
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Weshalb Online Drivecoach?
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

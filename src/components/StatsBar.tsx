import { motion } from "framer-motion";

const stats = [
  { value: "33%*", label: "aller praktischen Fahrprüfungen werden nicht bestanden" },
  { value: "CHF 360.–", label: "durchschnittliche Ersparnis bei Fahrstunden" },
  { value: "CHF 90.–", label: "kostet eine einzige Fahrstunde in der Schweiz" },
];

const StatsBar = () => {
  return (
    <section className="bg-accent py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-4xl mx-auto text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="px-4"
            >
              <p className="font-display text-4xl md:text-5xl font-bold text-accent-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-accent-foreground/80 text-sm leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-accent-foreground/60 text-xs mt-8">
          *Quelle: ASA — Statistik Führerprüfungen 2025
        </p>
      </div>
    </section>
  );
};

export default StatsBar;

import { motion } from "framer-motion";
import instructorImg from "@/assets/instructor.jpg";

const FounderSection = () => {
  return (
    <section className="py-20 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={instructorImg}
                alt="Michi — Diplomierter Fahrlehrer & Gründer Online Drivecoach"
                className="w-full aspect-square object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-white text-sm font-semibold">Michi</p>
                <p className="text-accent text-xs">Diplomierter Fahrlehrer · Gründer Online Drivecoach</p>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-background leading-tight">
              Ich bin Fahrlehrer. Und ich habe das System verändert.
            </h2>

            <blockquote className="text-background/80 text-lg md:text-xl italic leading-relaxed border-l-4 border-accent pl-6">
              "Als Fahrlehrer habe ich tausende von Fahrstunden erteilt. Und ich habe immer wieder dasselbe gesehen: Fahrschüler die gut fahren können — aber nicht wussten was der Experte wirklich bewertet. Das hat mich gestört. Also habe ich Online Drivecoach gebaut."
            </blockquote>

            <p className="text-background/60 text-sm">
              Michi · Diplomierter Fahrlehrer · Gründer Online Drivecoach
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;

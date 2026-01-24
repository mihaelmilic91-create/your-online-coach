import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Lara K.",
      location: "Olten",
      image: testimonial1,
      rating: 5,
      text: "Die Videos sind genau das, was ich gebraucht habe, um mich zwischen den Fahrstunden sicher zu fühlen. Ich konnte gezielt mit meinen Eltern üben und wusste immer, worauf ich achten muss. Mein Fahrlehrer war beeindruckt, wie schnell ich Fortschritte gemacht habe!",
    },
    {
      name: "Giulia T.",
      location: "Baar",
      image: testimonial2,
      rating: 5,
      text: "Endlich versteht man, was wirklich wichtig ist! Die Erklärungen sind super klar und praxisnah. So konnten meine Eltern mir viel besser helfen, weil sie auch gesehen haben, wie es richtig geht.",
    },
    {
      name: "Adam D.",
      location: "Wädenswil",
      image: testimonial1,
      rating: 5,
      text: "Ich konnte mir mehrere Fahrlektionen sparen, weil ich mit den Videos schon so viel gelernt habe. Die echten Aufnahmen von Schweizer Strassen haben mir enorm geholfen, mich auf die Prüfung vorzubereiten.",
    },
  ];

  const stats = [
    { value: "9/10", label: "verstehen den praktischen Teil schneller" },
    { value: "85%", label: "fühlen sich sicherer auf der Strasse" },
    { value: "4+", label: "Fahrstunden gespart im Durchschnitt" },
  ];

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Erfahrungen
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Das sagen unsere Lernfahrer
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Höre, was unsere erfolgreichen Fahrschüler über ihre Erfahrung sagen
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-card shadow-card rounded-3xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

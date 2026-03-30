import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Ersetzt Online Drivecoach die Fahrstunden beim Fahrlehrer?",
    answer:
      "Nein — Online Drivecoach ist die Vorbereitung auf deine Fahrstunden. Du lernst zuerst was der Experte bewertet, und gehst dann vorbereitet zum Fahrlehrer. So wird jede Stunde effizienter.",
  },
  {
    question: "Wann soll ich starten?",
    answer:
      "So früh wie möglich — am besten bevor du mit Fahrstunden anfängst. Aber auch kurz vor der Prüfung ist Online Drivecoach wertvoll um alles nochmals zu repetieren.",
  },
  {
    question: "Funktioniert das auch für die Begleitperson?",
    answer:
      "Ja — auch deine Begleitperson kann Online Drivecoach nutzen. So lernt sie was sie dir zeigen soll — und was nicht.",
  },
  {
    question: "Wie lange habe ich Zugang?",
    answer:
      "Du erhältst einen Jahres-Zugang — perfekt für die gesamte 1-jährige Lernphase. Jederzeit abrufbar, auch nach Pausen.",
  },
  {
    question: "Gilt das für alle Kantone der Schweiz?",
    answer:
      "Ja — Online Drivecoach ist auf die Schweizer Fahrprüfung Kat. B ausgerichtet und gilt für alle Kantone. Verfügbar auf Deutsch, Französisch und Italienisch.",
  },
];

const FAQ = () => {
  return (
    <section className="py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-accent text-sm font-bold uppercase tracking-widest mb-3">
            Fragen & Antworten
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Häufige <span className="text-accent">Fragen</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card shadow-card rounded-2xl px-6 border-none"
              >
                <AccordionTrigger className="font-semibold text-foreground text-left hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;

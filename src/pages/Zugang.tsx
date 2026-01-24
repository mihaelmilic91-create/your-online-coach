import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/logo.png";

const Zugang = () => {
  const benefits = [
    "Zugriff auf alle Video-Lektionen (Grundlagen, Manöver, Autobahn, Tipps & mehr)",
    "Schweizer Inhalte, Schweizer Fahrausbildung Kategorie B",
    "Jahreslizenz: einmalige Zahlung, keine automatische Verlängerung",
  ];

  const faqs = [
    {
      question: "Wie lange ist die Lizenz gültig?",
      answer: "Die Lizenz ist ab dem Kaufdatum ein Jahr lang gültig. Du hast während dieser Zeit unbegrenzten Zugriff auf alle Lernvideos.",
    },
    {
      question: "Wie erfolgt die Zahlung?",
      answer: "Du kannst sicher mit Kreditkarte (Visa, Mastercard, American Express) oder TWINT bezahlen. Die Zahlung wird über Stripe abgewickelt.",
    },
    {
      question: "Kann ich die App teilen?",
      answer: "Nein, die Lizenz ist persönlich und an dein Konto gebunden. Du kannst sie nicht mit anderen teilen.",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src={logo} alt="Online DriveCoach" className="h-10" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Pricing Card */}
          <div className="bg-card shadow-elevated rounded-3xl p-8 md:p-10">
            {/* Promo Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-accent font-medium text-sm">
                  Einführungspreis: CHF 79.– statt 129.–
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-accent text-center mb-4">
              Jetzt registrieren & Zugang sichern
            </h1>

            <p className="text-center text-muted-foreground mb-8">
              Erhalte sofort Zugriff auf über 30 Lernvideos mit einer einjährigen Lizenz – einmalige Zahlung, kein Abo.
            </p>

            {/* Benefits Section */}
            <div className="mb-8">
              <h2 className="font-display text-lg font-bold text-foreground text-center mb-6">
                Was ist enthalten?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <span className="text-xl text-muted-foreground line-through mr-3">
                CHF 129.–
              </span>
              <span className="text-3xl font-bold text-foreground">
                CHF 79.–
              </span>
            </div>

            {/* CTA Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full mb-6"
              asChild
            >
              <Link to="/checkout">
                Jetzt registrieren & freischalten
              </Link>
            </Button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1">
                <span className="text-lg">🇨🇭</span> Schweizer Plattform
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>Sichere Zahlung (Stripe / TWINT)</span>
              <span className="text-muted-foreground/50">·</span>
              <span>Kein Abo</span>
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-accent hover:text-accent/80 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Zugang;

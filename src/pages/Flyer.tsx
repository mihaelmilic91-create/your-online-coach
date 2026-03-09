import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const COUPON_CODE = "LERNFAHRT20";

const features = [
  "Parkieren Schritt für Schritt",
  "Rechtsvortritt verstehen",
  "Kreisverkehr richtig fahren",
  "Blicksystematik anwenden",
  "Autobahn sicher fahren",
];

const Flyer = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = COUPON_CODE;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal top bar with logo only */}
      <div className="py-5 px-4 flex justify-center">
        <img src={logo} alt="Online Drivecoach" className="h-14 w-auto" />
      </div>

      {/* SECTION 1 – HERO */}
      <section className="px-4 pt-8 pb-16">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl font-bold leading-tight"
          >
            CHF 20.– Rabatt{" "}
            <span className="text-gradient">freigeschaltet</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3 text-muted-foreground text-base sm:text-lg leading-relaxed"
          >
            <p>Du hast gerade einen Flyer gesehen.</p>
            <p>
              Mit Online Drivecoach lernst du die wichtigsten Fahrmanöver bereits
              vor deiner Fahrstunde.
            </p>
            <p>
              So verstehst du viele Dinge früher und nutzt deine Fahrstunden
              effizienter.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-display text-xl font-semibold text-foreground"
          >
            Dein Fahrlehrer in der Hosentasche.
          </motion.p>

          {/* Coupon code inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground">Dein Rabattcode:</p>
            <div className="inline-flex items-center gap-3 border-2 border-dashed border-accent/40 rounded-xl px-5 py-3 bg-background">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-widest text-accent">
                {COUPON_CODE}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-accent">Kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/checkout">Jetzt CHF 20.– sparen</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 – PROBLEM */}
      <section className="px-4 py-16 bg-secondary/50">
        <div className="max-w-lg mx-auto space-y-5 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl font-bold leading-tight"
          >
            Warum viele Fahrschüler/innen unnötig Fahrstunden bezahlen
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 text-muted-foreground text-base leading-relaxed"
          >
            <p>
              Viele Fahrschüler/innen lernen wichtige Manöver erst während der
              Fahrstunde. Das kostet Zeit und Geld.
            </p>
            <p>
              Mit Online Drivecoach kannst du wichtige Manöver bereits vorher
              verstehen und auf privaten Lernfahrten üben.
            </p>
            <p className="font-semibold text-foreground">
              So nutzt du deine Fahrstunden deutlich effizienter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 – WAS DU LERNST */}
      <section className="px-4 py-16">
        <div className="max-w-lg mx-auto space-y-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl font-bold"
          >
            Das lernst du mit Online Drivecoach
          </motion.h2>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 inline-block text-left"
          >
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-base sm:text-lg"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </motion.ul>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-base text-center"
          >
            Alle Inhalte werden in kurzen und verständlichen Videos erklärt.
          </motion.p>
        </div>
      </section>

      {/* SECTION 4 – RABATTCODE */}
      <section className="px-4 py-16 bg-secondary/50">
        <div className="max-w-lg mx-auto text-center space-y-5">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl font-bold"
          >
            Dein CHF 20.– Rabatt
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-base"
          >
            Nutze diesen Rabattcode aus deinem Flyer und spare CHF 20.– auf deinen Zugang.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative inline-block"
          >
            <div className="border-2 border-dashed border-accent/40 rounded-2xl px-8 py-5 bg-background">
              <span className="font-display text-3xl sm:text-4xl font-bold tracking-widest text-accent">
                {COUPON_CODE}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Rabattcode kopiert
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Code kopieren
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 – CALL TO ACTION */}
      <section className="px-4 py-20">
        <div className="max-w-lg mx-auto text-center space-y-5">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl font-bold"
          >
            Starte jetzt mit Online Drivecoach
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-base leading-relaxed"
          >
            Nutze deinen CHF 20.– Rabattcode und erhalte sofort Zugriff
            auf alle Lernvideos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/checkout">Jetzt CHF 20.– sparen</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal footer */}
      <div className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Online Drivecoach
      </div>
    </div>
  );
};

export default Flyer;

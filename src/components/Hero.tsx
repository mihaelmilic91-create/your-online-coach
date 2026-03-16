import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import appMockup from "@/assets/app-mockup.png";
import swissMadeSoftware from "@/assets/swiss-made-software.png";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] pt-24 pb-12 gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 pt-8 lg:pt-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Dein Fahrlehrer.{" "}
              <span className="text-gradient">Immer dabei.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Über 30 strukturierte Praxis-Videos für die Schweizer Autoprüfung –
              bereit, bevor du ins Auto steigst.
            </p>

            <p className="text-base text-muted-foreground/80 max-w-lg leading-relaxed">
              In der Schweiz gibt es keine Pflichtfahrstunden.
              Nutze private Lernfahrten gezielt – statt Erklärzeit im Auto zu bezahlen.
            </p>

            <p className="text-xl font-bold text-foreground">
              nur CHF 79.– <span className="text-base font-normal text-muted-foreground">– 1 Jahr Zugriff. Kein Abo.</span>
            </p>

            <div className="pt-1">
              <Button variant="hero" size="xl" asChild>
                <Link to="/zugang">Jetzt clever vorbereiten</Link>
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <a href="https://www.swissmadesoftware.org" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity inline-block">
                <img 
                  src={swissMadeSoftware} 
                  alt="Swiss Made Software" 
                  className="h-10 w-auto"
                />
              </a>
            </motion.div>
          </motion.div>

          {/* Right Content - App Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.img
              src={appMockup}
              alt="Online DriveCoach App"
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md drop-shadow-2xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              fetchPriority="high"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

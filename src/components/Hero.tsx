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
              Fahrprüfung Kat. B —{" "}
              <span className="text-gradient">spare dir mind. 4 Fahrstunden.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Lerne was der Experte wirklich bewertet — bevor du ins Auto steigst. So wird jede Fahrstunde effizienter und du sparst hunderte von Franken.
            </p>

            <div className="pt-1 space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/zugang">Jetzt starten — CHF 79.–</Link>
                </Button>
                <p className="text-sm text-muted-foreground">=&nbsp;weniger als eine Fahrstunde</p>
              </div>
              <p className="text-sm font-medium text-foreground pl-1">
                <span className="text-amber-400">★★★★★</span>{" "}
                <span className="text-muted-foreground">Bereits über 100 Fahrstunden eingespart</span>
              </p>
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
            
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -bottom-2 right-0 sm:right-4 lg:-right-4 bg-card shadow-elevated rounded-2xl px-5 py-3"
            >
              <p className="font-display text-lg sm:text-xl font-bold text-accent">+CHF 400.–</p>
              <p className="text-xs sm:text-sm text-muted-foreground">durchschnittlich gespart</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">~5 Fahrlektionen à CHF 90.–</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

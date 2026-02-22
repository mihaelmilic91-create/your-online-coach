import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import appMockup from "@/assets/app-mockup.png";
import swissMadeSoftware from "@/assets/swiss-made-software.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-24 pb-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6 order-1"
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1]">
              Spare 4 Fahrstunden.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Digitale Praxis-Videos für die Schweizer Autoprüfung Kat. B.
            </p>

            <p className="text-base text-foreground">
              CHF 79 – 1 Jahr Zugriff. Kein Abo.
            </p>

            <div className="pt-2">
              <Button variant="hero" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/zugang">Jahreslizenz sichern – CHF 79</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Content - App Mockup + Swiss Made Logo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col items-center order-2"
          >
            <img
              src={appMockup}
              alt="Online DriveCoach App"
              className="w-full max-w-xs lg:max-w-sm"
            />
            <a
              href="https://www.swissmadesoftware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 hover:opacity-80 transition-opacity"
            >
              <img
                src={swissMadeSoftware}
                alt="Swiss Made Software"
                className="h-9 w-auto"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

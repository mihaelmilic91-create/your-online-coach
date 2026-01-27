import { motion } from "framer-motion";
import { Play, Clock, Video, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import appMockup from "@/assets/app-mockup.png";
import swissMadeSoftware from "@/assets/swiss-made-software.png";

const Hero = () => {
  const features = [
    { icon: Clock, text: "Spare Zeit & Geld" },
    { icon: Video, text: "Über 30 Lernvideos" },
    { icon: Award, text: "Bestehe sicher" },
  ];

  return (
    <section className="relative min-h-screen pt-24 pb-16 gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium"
              >
                Willkommen bei Online Drivecoach
              </motion.span>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Mach dich bereit für die{" "}
                <span className="text-gradient">Autoprüfung</span> – mit der App, die dir Fahrstunden spart!
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Wir erklären dir in unseren Videos alle Fahrlektionen, wie es dir ein Fahrlehrer erklären würde – so kannst du gezielt mit deinen Begleitpersonen üben.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/zugang">Jetzt Registrieren</Link>
              </Button>
              <Button variant="hero-outline" size="xl" className="gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <Play className="w-4 h-4 text-accent-foreground ml-0.5" />
                </div>
                Video ansehen
              </Button>
            </div>

            {/* Swiss Made Software Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-2"
            >
              <img 
                src={swissMadeSoftware} 
                alt="Swiss Made Software" 
                className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </motion.div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 bg-card shadow-soft rounded-full px-4 py-2"
                >
                  <feature.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - App Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <motion.img
                src={appMockup}
                alt="Online DriveCoach App"
                className="w-full max-w-sm lg:max-w-md drop-shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -left-8 top-1/4 bg-card shadow-elevated rounded-2xl p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">9/10</p>
                    <p className="text-sm text-muted-foreground">verstehen schneller</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute -right-4 bottom-1/4 bg-card shadow-elevated rounded-2xl p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">30+</p>
                    <p className="text-sm text-muted-foreground">Lernvideos</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

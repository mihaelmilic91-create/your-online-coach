import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  const links = {
    produkt: [
      { label: "Video-Kurse", href: "#kurse" },
      { label: "Preise", href: "#preise" },
      { label: "FAQ", href: "#faq" },
    ],
    unternehmen: [
      { label: "Über uns", href: "#about" },
      { label: "Kontakt", href: "#kontakt" },
      { label: "Blog", href: "#blog" },
    ],
    rechtliches: [
      { label: "Impressum", href: "#impressum" },
      { label: "Datenschutz", href: "#datenschutz" },
      { label: "AGB", href: "#agb" },
    ],
  };

  const social = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">OD</span>
              </div>
              <span className="font-display font-bold text-lg text-background">
                Online DriveCoach
              </span>
            </a>
            <p className="text-background/70 mb-6 max-w-sm">
              Die #1 Online-Plattform für Fahrschüler in der Schweiz. Lerne Autofahren mit professionellen Video-Kursen.
            </p>
            
            {/* Contact */}
            <div className="space-y-3">
              <a href="tel:+41791234567" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                <Phone className="w-5 h-5" />
                <span>+41 79 123 45 67</span>
              </a>
              <a href="mailto:info@onlinedrivecoach.ch" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@onlinedrivecoach.ch</span>
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5" />
                <span>Zürich, Schweiz</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Produkt</h4>
            <ul className="space-y-3">
              {links.produkt.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {links.unternehmen.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              {links.rechtliches.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2024 Online DriveCoach. Alle Rechte vorbehalten.
          </p>
          
          {/* Social */}
          <div className="flex items-center gap-4">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <item.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

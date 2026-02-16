import { Mail, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";
import swissMadeSoftware from "@/assets/swiss-made-software.png";

const Footer = () => {
  const links = {
    produkt: [
      { label: "Lernvideos", href: "#kurse" },
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
    <footer className="bg-navy text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center mb-4">
              <img 
                src={logo} 
                alt="Online DriveCoach" 
                className="h-10 w-auto brightness-0 invert"
              />
            </a>
            <p className="text-white/70 mb-6 max-w-sm">
              Wir erklären dir in unseren Videos alle Fahrlektionen, wie es dir ein Fahrlehrer erklären würde – so kannst du gezielt mit deinen Begleitpersonen üben.
            </p>
            
            {/* Swiss Made Software Badge */}
            <div className="mb-6">
              <div className="inline-block rounded px-2 py-1 bg-white/90">
                <img 
                  src={swissMadeSoftware} 
                  alt="Swiss Made Software" 
                  className="h-5 w-auto"
                />
              </div>
            </div>
            
            {/* Contact - Placeholder */}
            <div className="space-y-3">
              <a href="mailto:info@onlinedrivecoach.ch" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@onlinedrivecoach.ch</span>
              </a>
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="w-5 h-5" />
                <span>Schweiz</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Produkt</h4>
            <ul className="space-y-3">
              {links.produkt.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {links.unternehmen.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              {links.rechtliches.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © 2024 Online Drivecoach. Alle Rechte vorbehalten.
          </p>
          
          {/* Social */}
          <div className="flex items-center gap-4">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-accent hover:text-accent-foreground transition-all duration-300"
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

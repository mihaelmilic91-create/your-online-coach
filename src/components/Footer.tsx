import { Mail, MapPin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import swissMadeSoftware from "@/assets/swiss-made-software.png";

const Footer = () => {
  const links = {
    produkt: [
      { label: "Lernvideos", href: "#kurse" },
      { label: "Preise", href: "/preise" },
      { label: "FAQ", href: "/faq" },
    ],
    unternehmen: [
      { label: "Über uns", href: "/ueber-uns" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Blog", href: "/blog" },
    ],
    rechtliches: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" },
    ],
  };

  const social = [
    { icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
      </svg>
    ), href: "https://www.tiktok.com/@onlinedrivecoach.ch", label: "TikTok" },
    { icon: Instagram, href: "https://www.instagram.com/onlinedrivecoach.ch/", label: "Instagram" },
  ];

  const renderLink = (link: { label: string; href: string }) => {
    if (link.href.startsWith("#")) {
      return (
        <a href={link.href} className="text-footer-foreground/70 hover:text-footer-foreground transition-colors">
          {link.label}
        </a>
      );
    }
    return (
      <Link to={link.href} className="text-footer-foreground/70 hover:text-footer-foreground transition-colors">
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="bg-footer text-footer-foreground py-16">
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
            <p className="text-footer-foreground/70 mb-6 max-w-sm">
              Wir erklären dir in unseren Videos alle Fahrlektionen, wie es dir ein Fahrlehrer erklären würde – so kannst du gezielt mit deinen Begleitpersonen üben.
            </p>
            
            {/* Swiss Made Software Badge */}
            <div className="mb-6">
              <div className="inline-block rounded px-2 py-1 bg-white/90">
                <img 
                  src={swissMadeSoftware} 
                  alt="Swiss Made Software" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
            
            {/* Contact */}
            <div className="space-y-3">
              <a href="mailto:info@onlinedrivecoach.ch" className="flex items-center gap-3 text-footer-foreground/70 hover:text-footer-foreground transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@onlinedrivecoach.ch</span>
              </a>
              <div className="flex items-center gap-3 text-footer-foreground/70">
                <MapPin className="w-5 h-5" />
                <span>Schweiz</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-footer-foreground mb-4">Produkt</h4>
            <ul className="space-y-3">
              {links.produkt.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-footer-foreground mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {links.unternehmen.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-footer-foreground mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              {links.rechtliches.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-footer-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-footer-foreground/50 text-sm">
            © 2026 Online Drivecoach. Alle Rechte vorbehalten.
          </p>
          
          {/* Social */}
          <div className="flex items-center gap-4">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="w-10 h-10 rounded-full bg-footer-foreground/10 flex items-center justify-center text-footer-foreground/70 hover:bg-footer-foreground/20 transition-all duration-300"
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

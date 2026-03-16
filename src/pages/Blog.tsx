import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const articles = [
  {
    to: "/einparken-fahrpruefung-schweiz",
    title: "Einparken Fahrprüfung Schweiz – So klappt es beim ersten Versuch",
    excerpt:
      "Das Einparken gehört zu den häufigsten Fehlerquellen in der praktischen Fahrprüfung Kat. B. Mit der richtigen Technik und gezielter Vorbereitung gelingt es sicher — auch unter Prüfungsdruck.",
    tag: "Manöver",
  },
  {
    to: "/dreipunkt-wenden-schweiz",
    title: "Dreipunkt-Wenden Fahrprüfung Schweiz – Schritt für Schritt erklärt",
    excerpt:
      "Der Dreipunkt-Wender gehört zu den Pflichtmanövern in der praktischen Fahrprüfung Kat. B. Viele Lernfahrer machen ihn zum ersten Mal unter Prüfungsbedingungen — ein vermeidbarer Nachteil.",
    tag: "Manöver",
  },
  {
    to: "/manoever-fahrpruefung-kat-b",
    title: "Manöver Fahrprüfung Kat. B Schweiz – Vollständige Übersicht",
    excerpt:
      "In der praktischen Fahrprüfung Kat. B Schweiz werden verschiedene Manöver geprüft. Wer weiss was ihn erwartet und wie es richtig aussieht, besteht sicherer beim ersten Versuch.",
    tag: "Fahrprüfung",
  },
  {
    to: "/lernfrist-schweiz",
    title: "Lernfrist Schweiz – Was bedeutet das und wie nutzt du sie richtig?",
    excerpt:
      "In der Schweiz müssen alle Lernfahrer unter 20 Jahren eine 1-jährige Lernfrist absolvieren. Wer diese Zeit richtig nutzt, spart Fahrstunden und besteht die Prüfung sicherer.",
    tag: "Vorbereitung",
  },
  {
    to: "/kontrollfahrt-schweiz",
    title: "Kontrollfahrt Schweiz – Vorbereitung, Ablauf & Tipps",
    excerpt:
      "Die Kontrollfahrt ist eine behördlich angeordnete Fahrprüfung, die nach schweren Verkehrsdelikten absolviert werden muss. Mit der richtigen Vorbereitung bestehst du sie sicher.",
    tag: "Kontrollfahrt",
  },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Header />
    <main className="flex-1 pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          Ratgeber & Blog
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          Tipps und Erklärungen zur praktischen Fahrprüfung Kat. B in der Schweiz —
          von einem ausgebildeten Schweizer Fahrlehrer.
        </p>

        <div className="space-y-4">
          {articles.map(({ to, title, excerpt, tag }) => (
            <Link
              key={to}
              to={to}
              className="block p-6 bg-card rounded-2xl border border-border hover:border-accent/40 transition-colors group"
            >
              <span className="text-xs font-semibold text-accent uppercase tracking-wide mb-2 block">
                {tag}
              </span>
              <h2 className="font-display text-lg font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;

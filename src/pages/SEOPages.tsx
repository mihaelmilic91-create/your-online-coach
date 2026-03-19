import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOMeta from "@/components/SEOMeta";

const SEOLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Header />
    <main className="flex-1 pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

const CTABox = () => (
  <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 my-10">
    <h3 className="font-display text-xl font-bold text-foreground mb-2">
      Jetzt vorbereiten — günstiger als eine Fahrstunde
    </h3>
    <p className="text-muted-foreground mb-4">
      Über 30 Lernvideos für die praktische Fahrprüfung Kat. B in der Schweiz.
      Von einem ausgebildeten Schweizer Fahrlehrer. POV-Aufnahmen aus der Fahrerperspektive.
      CHF 79.– einmalig — günstiger als eine einzige Fahrstunde (ca. CHF 90.–).
    </p>
    <Link
      to="/zugang"
      className="inline-block bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
    >
      Jetzt Zugang sichern →
    </Link>
  </div>
);

const RelatedLinks = ({ links }: { links: { to: string; label: string }[] }) => (
  <div className="flex flex-wrap gap-3 mt-12 pt-8 border-t border-border text-sm">
    {links.map(({ to, label }) => (
      <Link key={to} to={to} className="text-accent hover:underline">→ {label}</Link>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// 1. Einparken Fahrprüfung Schweiz
// ─────────────────────────────────────────────────────────────
export const EinparkenFahrpruefung = () => (
  <SEOLayout>
    <SEOMeta
      title="Einparken Fahrprüfung Schweiz – Tipps & Technik | Online Drivecoach"
      description="Einparken in der Fahrprüfung Kat. B Schweiz: Längs, quer, rückwärts. Häufige Fehler vermeiden und mit POV-Lernvideos vom Fahrlehrer sicher bestehen."
      canonical="https://www.onlinedrivecoach.ch/einparken-fahrpruefung-schweiz"
      schema={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Einparken Fahrprüfung Schweiz – So klappt es beim ersten Versuch",
        "description": "Einparken in der Fahrprüfung Kat. B Schweiz: Längs, quer, rückwärts. Häufige Fehler vermeiden und sicher bestehen.",
        "author": { "@type": "Person", "name": "Mihael Milic", "jobTitle": "Eidg. dipl. Fahrlehrer" },
        "publisher": { "@type": "Organization", "name": "Online Drivecoach", "url": "https://www.onlinedrivecoach.ch" },
        "url": "https://www.onlinedrivecoach.ch/einparken-fahrpruefung-schweiz",
        "inLanguage": "de-CH"
      }}
    />
    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
      Einparken Fahrprüfung Schweiz – So klappt es beim ersten Versuch
    </h1>
    <p className="text-muted-foreground text-lg mb-8">
      Das Einparken gehört zu den häufigsten Fehlerquellen in der praktischen Fahrprüfung Kat. B.
      Mit der richtigen Technik und gezielter Vorbereitung gelingt es sicher — auch unter Prüfungsdruck.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Die drei Einpark-Manöver in der Prüfung</h2>
    <div className="space-y-4 mb-6">
      {[
        { name: "Paralleles Einparken (längs)", desc: "Einparken in eine Lücke parallel zur Fahrbahn. Häufig verlangt, besonders in der Stadt. Kritische Punkte: richtiger Ausgangspunkt, Einlenkzeitpunkt, Gegensteuern." },
        { name: "Einparken in Parktasche (quer)", desc: "Einparken in eine senkrechte oder schräge Parklücke. Einfacher als Längsparken, aber der Prüfer beobachtet Übersicht und Präzision." },
        { name: "Rückwärts einparken", desc: "Rückwärts in eine längs-Lücke. Erfordert präzise Referenzpunkte und ruhige Lenkbewegungen." },
      ].map(({ name, desc }) => (
        <div key={name} className="p-4 bg-card rounded-xl border border-border">
          <p className="font-semibold text-foreground mb-1">{name}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Häufige Fehler beim Einparken</h2>
    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
      <li>Zu spät einlenken — die Lücke wird verpasst</li>
      <li>Zu früh gegensteuern — das Fahrzeug steht schräg</li>
      <li>Fehlende Beobachtung nach hinten (Schulterblick, Spiegel)</li>
      <li>Zu schnelles Fahren — keine Zeit für Korrekturen</li>
      <li>Falscher Ausgangspunkt — zu weit weg oder zu nah am vorderen Fahrzeug</li>
    </ul>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">So bereitest du dich optimal vor</h2>
    <p className="text-muted-foreground mb-4">
      Der grösste Vorteil beim Einparken: Du kannst es unbegrenzt oft üben — auch ohne Fahrlehrer.
      Nutze private Lernfahrten mit den Eltern gezielt dafür. Schau dir vorher das Manöver aus der
      Fahrerperspektive an, damit du weisst was dich erwartet und welche Referenzpunkte du brauchst.
    </p>

    <CTABox />

    <RelatedLinks links={[
      { to: "/dreipunkt-wenden-schweiz", label: "Dreipunkt-Wenden erklärt" },
      { to: "/manoever-fahrpruefung-kat-b", label: "Alle Manöver Fahrprüfung Kat. B" },
      { to: "/lernfrist-schweiz", label: "Lernfrist Schweiz" },
    ]} />
  </SEOLayout>
);

// ─────────────────────────────────────────────────────────────
// 2. Dreipunkt-Wenden Schweiz
// ─────────────────────────────────────────────────────────────
export const DreipunktWenden = () => (
  <SEOLayout>
    <SEOMeta
      title="Dreipunkt-Wenden Fahrprüfung Schweiz – Schritt für Schritt | Online Drivecoach"
      description="Dreipunkt-Wenden in der Fahrprüfung Kat. B Schweiz: Schritt-für-Schritt-Anleitung, häufige Fehler und Tipps vom ausgebildeten Fahrlehrer."
      canonical="https://www.onlinedrivecoach.ch/dreipunkt-wenden-schweiz"
      schema={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Dreipunkt-Wenden Fahrprüfung Schweiz – Schritt für Schritt",
        "description": "Anleitung für das Dreipunkt-Wenden in der Fahrprüfung Kat. B Schweiz.",
        "author": { "@type": "Person", "name": "Mihael Milic", "jobTitle": "Eidg. dipl. Fahrlehrer" },
        "step": [
          { "@type": "HowToStep", "name": "Beobachten", "text": "Blick in alle Spiegel, Schulterblick — sicherstellen dass kein Verkehr kommt." },
          { "@type": "HowToStep", "name": "Rechts ran", "text": "Langsam an den rechten Strassenrand heranfahren, kurz vor dem Randstein stoppen." },
          { "@type": "HowToStep", "name": "Volleinschlag links, vorwärts", "text": "Lenkrad voll nach links einschlagen, langsam vorwärts fahren. Kurz vor dem linken Randstein stoppen." },
          { "@type": "HowToStep", "name": "Volleinschlag rechts, rückwärts", "text": "Lenkrad voll nach rechts, langsam rückwärts fahren. Kurz vor dem rechten Randstein stoppen." },
          { "@type": "HowToStep", "name": "Weiterfahren", "text": "Lenkrad geradeaus stellen, Verkehr beobachten, weiterfahren." }
        ]
      }}
    />
    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
      Dreipunkt-Wenden Fahrprüfung Schweiz – Schritt für Schritt erklärt
    </h1>
    <p className="text-muted-foreground text-lg mb-8">
      Der Dreipunkt-Wender gehört zu den Pflichtmanövern in der praktischen Fahrprüfung Kat. B Schweiz.
      Viele Lernfahrer machen ihn zum ersten Mal unter Prüfungsbedingungen — ein vermeidbarer Nachteil.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Schritt-für-Schritt Anleitung</h2>
    <div className="space-y-3 mb-6">
      {[
        { n: "1", step: "Beobachten", desc: "Blick in alle Spiegel, Schulterblick — sicherstellen dass kein Verkehr kommt." },
        { n: "2", step: "Rechts ran", desc: "Langsam an den rechten Strassenrand heranfahren, kurz vor dem Randstein stoppen." },
        { n: "3", step: "Volleinschlag links, vorwärts", desc: "Lenkrad voll nach links einschlagen, langsam vorwärts fahren. Kurz vor dem linken Randstein stoppen." },
        { n: "4", step: "Volleinschlag rechts, rückwärts", desc: "Lenkrad voll nach rechts, langsam rückwärts fahren. Kurz vor dem rechten Randstein stoppen." },
        { n: "5", step: "Geradeaus weiterfahren", desc: "Lenkrad geradeaus stellen, Verkehr beobachten, weiterfahren." },
      ].map(({ n, step, desc }) => (
        <div key={n} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
          <span className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center flex-shrink-0 text-sm">{n}</span>
          <div>
            <p className="font-semibold text-foreground text-sm">{step}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Häufige Fehler beim Dreipunkt-Wenden</h2>
    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
      <li>Zu früh lenken — zu wenig Platz nach vorne</li>
      <li>Zu schnell fahren — keine Kontrolle mehr</li>
      <li>Randstein berühren — sofortiger Prüfungsabbruch möglich</li>
      <li>Fehlende Beobachtung — Verkehr nicht überprüft</li>
      <li>Unsicheres Zögern — wirkt auf den Prüfer unvorbereitet</li>
    </ul>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Warum aus der Fahrerperspektive lernen?</h2>
    <p className="text-muted-foreground mb-4">
      Die meisten Lernvideos zeigen das Wenden von aussen. Das Problem: In der Prüfung sitzt du hinter
      dem Steuer und siehst es von innen. POV-Aufnahmen aus der Fahrerperspektive zeigen dir genau,
      wann du einlenken musst, wie nah du an den Randstein fahren kannst — und was der Prüfer sieht.
    </p>

    <CTABox />

    <RelatedLinks links={[
      { to: "/einparken-fahrpruefung-schweiz", label: "Einparken Fahrprüfung Schweiz" },
      { to: "/manoever-fahrpruefung-kat-b", label: "Alle Manöver Fahrprüfung Kat. B" },
      { to: "/kontrollfahrt-schweiz", label: "Kontrollfahrt Schweiz vorbereiten" },
    ]} />
  </SEOLayout>
);

// ─────────────────────────────────────────────────────────────
// 3. Manöver Fahrprüfung Kat. B
// ─────────────────────────────────────────────────────────────
export const ManoeverFahrpruefung = () => (
  <SEOLayout>
    <SEOMeta
      title="Manöver Fahrprüfung Kat. B Schweiz – Vollständige Übersicht | Online Drivecoach"
      description="Alle Manöver der praktischen Fahrprüfung Kat. B Schweiz: Einparken, Dreipunkt-Wenden, Rückwärtsfahren, Bergfahrt und mehr – mit Tipps vom Fahrlehrer."
      canonical="https://www.onlinedrivecoach.ch/manoever-fahrpruefung-kat-b"
      schema={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Manöver Fahrprüfung Kat. B Schweiz – Vollständige Übersicht",
        "description": "Alle Manöver der praktischen Fahrprüfung Kat. B Schweiz mit Schwierigkeitsgrad und Tipps vom Fahrlehrer.",
        "author": { "@type": "Person", "name": "Mihael Milic", "jobTitle": "Eidg. dipl. Fahrlehrer" },
        "publisher": { "@type": "Organization", "name": "Online Drivecoach", "url": "https://www.onlinedrivecoach.ch" },
        "url": "https://www.onlinedrivecoach.ch/manoever-fahrpruefung-kat-b",
        "inLanguage": "de-CH"
      }}
    />
    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
      Manöver Fahrprüfung Kat. B Schweiz – Vollständige Übersicht
    </h1>
    <p className="text-muted-foreground text-lg mb-8">
      In der praktischen Fahrprüfung Kat. B Schweiz werden verschiedene Manöver geprüft.
      Wer weiss was ihn erwartet und wie es richtig aussieht, besteht sicherer beim ersten Versuch.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Alle Manöver im Überblick</h2>
    <div className="space-y-3 mb-8">
      {[
        { manöver: "Einparken längs (parallel)", schwierigkeit: "Mittel", tipp: "Richtiger Ausgangspunkt ist entscheidend" },
        { manöver: "Einparken quer (Parktasche)", schwierigkeit: "Einfach", tipp: "Übersicht behalten, auf Fussgänger achten" },
        { manöver: "Dreipunkt-Wenden", schwierigkeit: "Mittel", tipp: "Langsam fahren, Volleinschlag nutzen" },
        { manöver: "Rückwärtsfahren", schwierigkeit: "Mittel", tipp: "Schulterblick, beide Seiten beobachten" },
        { manöver: "Bergfahrt / Anfahren am Berg", schwierigkeit: "Mittel", tipp: "Kupplung und Bremse koordinieren" },
        { manöver: "Vortritt / Einordnen", schwierigkeit: "Hoch", tipp: "Häufigste Fehlerquelle — frühzeitig beobachten" },
        { manöver: "Überholen", schwierigkeit: "Hoch", tipp: "Abstand, Spiegel, Blinker, Schulterblick" },
      ].map(({ manöver, schwierigkeit, tipp }) => (
        <div key={manöver} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">{manöver}</p>
            <p className="text-xs text-muted-foreground mt-1">💡 {tipp}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
            schwierigkeit === "Hoch" ? "bg-red-100 text-red-700" :
            schwierigkeit === "Mittel" ? "bg-yellow-100 text-yellow-700" :
            "bg-green-100 text-green-700"
          }`}>{schwierigkeit}</span>
        </div>
      ))}
    </div>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Wie werden Manöver bewertet?</h2>
    <p className="text-muted-foreground mb-4">
      Der Prüfer bewertet nicht nur ob das Manöver gelingt, sondern auch wie sicher und überlegt
      es ausgeführt wird. Zögern, falsche Beobachtung und unsichere Lenkbewegungen fallen auf —
      auch wenn das Manöver technisch korrekt endet.
    </p>
    <p className="text-muted-foreground mb-4">
      Wer die Manöver vorher aus der Fahrerperspektive gesehen hat, weiss was ihn erwartet und
      kann sicher und ruhig handeln — statt zu überlegen wie es nochmal geht.
    </p>

    <CTABox />

    <RelatedLinks links={[
      { to: "/einparken-fahrpruefung-schweiz", label: "Einparken erklärt" },
      { to: "/dreipunkt-wenden-schweiz", label: "Dreipunkt-Wenden erklärt" },
      { to: "/lernfrist-schweiz", label: "Lernfrist Schweiz nutzen" },
    ]} />
  </SEOLayout>
);

// ─────────────────────────────────────────────────────────────
// 4. Lernfrist Schweiz
// ─────────────────────────────────────────────────────────────
export const LernfristSchweiz = () => (
  <SEOLayout>
    <SEOMeta
      title="Lernfrist Schweiz – Was bedeutet das & wie nutzt du sie richtig? | Online Drivecoach"
      description="Lernfrist Schweiz erklärt: Wer sie absolvieren muss, wie lange sie dauert und wie du die 12 Monate optimal für die Fahrprüfung Kat. B nutzt."
      canonical="https://www.onlinedrivecoach.ch/lernfrist-schweiz"
      schema={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Lernfrist Schweiz – Was bedeutet das und wie nutzt du sie richtig?",
        "description": "Lernfrist Schweiz erklärt: Wer sie absolvieren muss, wie lange sie dauert und wie du die 12 Monate optimal nutzt.",
        "author": { "@type": "Person", "name": "Mihael Milic", "jobTitle": "Eidg. dipl. Fahrlehrer" },
        "publisher": { "@type": "Organization", "name": "Online Drivecoach", "url": "https://www.onlinedrivecoach.ch" },
        "url": "https://www.onlinedrivecoach.ch/lernfrist-schweiz",
        "inLanguage": "de-CH"
      }}
    />
    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
      Lernfrist Schweiz – Was bedeutet das und wie nutzt du sie richtig?
    </h1>
    <p className="text-muted-foreground text-lg mb-8">
      In der Schweiz müssen alle Lernfahrer unter 20 Jahren nach der Theorieprüfung eine 1-jährige
      Lernfrist absolvieren, bevor sie zur praktischen Fahrprüfung dürfen. Wer diese Zeit richtig
      nutzt, spart Fahrstunden und besteht die Prüfung sicherer.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Was ist die Lernfrist genau?</h2>
    <p className="text-muted-foreground mb-4">
      Die Lernfrist ist eine gesetzlich vorgeschriebene Mindestwartezeit zwischen dem Bestehen der
      Theorieprüfung und dem frühestmöglichen Antritt zur praktischen Fahrprüfung. Sie beträgt
      <strong className="text-foreground"> 12 Monate</strong> und gilt für alle Lernfahrer unter 20 Jahren.
    </p>
    <p className="text-muted-foreground mb-4">
      Wer die Theorieprüfung nach seinem 20. Geburtstag besteht, unterliegt keiner Lernfrist und
      kann die praktische Prüfung sofort nach ausreichender Vorbereitung absolvieren.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Was die meisten Lernfahrer falsch machen</h2>
    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
      <li>Selten zur Fahrschule gehen — "ich fahre ja noch ein Jahr"</li>
      <li>Mit den Eltern fahren ohne konkretes Übungsziel</li>
      <li>Lange Pausen einlegen — danach ist vieles wieder vergessen</li>
      <li>Erst kurz vor Ablauf der Lernfrist intensiv zu üben</li>
    </ul>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">So nutzt du die Lernfrist optimal</h2>
    <div className="space-y-3 mb-6">
      {[
        { title: "Regelmässig privat fahren", desc: "Mindestens 1–2 Mal pro Woche mit den Eltern. Kurze, gezielte Übungseinheiten sind besser als seltene lange Fahrten." },
        { title: "Vor jeder Fahrt vorbereiten", desc: "Schau dir das Thema das du üben möchtest als Video an. So weisst du was du tun sollst — und deine Eltern können dich besser unterstützen." },
        { title: "Alle Manöver üben", desc: "Nicht nur fahren, sondern gezielt alle Prüfungsmanöver wiederholen: Einparken, Dreipunkt-Wenden, Rückwärtsfahren, Bergfahrt." },
        { title: "Regelmässig zur Fahrschule", desc: "Einmal pro Monat beim Fahrlehrer — für professionelles Feedback und korrekte Grundlagen." },
      ].map(({ title, desc }) => (
        <div key={title} className="p-4 bg-card rounded-xl border border-border">
          <p className="font-semibold text-foreground mb-1">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>

    <CTABox />

    <RelatedLinks links={[
      { to: "/manoever-fahrpruefung-kat-b", label: "Manöver Fahrprüfung Kat. B" },
      { to: "/einparken-fahrpruefung-schweiz", label: "Einparken üben" },
      { to: "/kontrollfahrt-schweiz", label: "Kontrollfahrt Schweiz" },
    ]} />
  </SEOLayout>
);

// ─────────────────────────────────────────────────────────────
// 5. Kontrollfahrt Schweiz
// ─────────────────────────────────────────────────────────────
export const KontrollfahrtSchweiz = () => (
  <SEOLayout>
    <SEOMeta
      title="Kontrollfahrt Schweiz – Vorbereitung, Ablauf & Tipps | Online Drivecoach"
      description="Kontrollfahrt Schweiz: Was sie ist, wer sie absolvieren muss und wie du dich mit Lernvideos vom ausgebildeten Fahrlehrer optimal vorbereitest."
      canonical="https://www.onlinedrivecoach.ch/kontrollfahrt-schweiz"
      schema={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Kontrollfahrt Schweiz – Vorbereitung, Ablauf & Tipps",
        "description": "Kontrollfahrt Schweiz: Was sie ist, wer sie absolvieren muss und wie du dich optimal vorbereitest.",
        "author": { "@type": "Person", "name": "Mihael Milic", "jobTitle": "Eidg. dipl. Fahrlehrer" },
        "publisher": { "@type": "Organization", "name": "Online Drivecoach", "url": "https://www.onlinedrivecoach.ch" },
        "url": "https://www.onlinedrivecoach.ch/kontrollfahrt-schweiz",
        "inLanguage": "de-CH"
      }}
    />
    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
      Kontrollfahrt Schweiz – Vorbereitung, Ablauf & Tipps
    </h1>
    <p className="text-muted-foreground text-lg mb-8">
      Die Kontrollfahrt in der Schweiz ist eine behördlich angeordnete Fahrprüfung, die nach
      schweren Verkehrsdelikten oder auf Anordnung des Strassenverkehrsamtes absolviert werden muss.
      Mit der richtigen Vorbereitung bestehst du sie sicher.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Was ist eine Kontrollfahrt?</h2>
    <p className="text-muted-foreground mb-4">
      Die Kontrollfahrt ist keine normale Fahrprüfung, sondern eine Überprüfung der fahrerischen
      Fähigkeiten durch das Strassenverkehrsamt (StVA). Sie wird angeordnet wenn:
    </p>
    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
      <li>Schwere Verkehrsverstösse begangen wurden</li>
      <li>Der Führerausweis entzogen wurde und wieder ausgehändigt werden soll</li>
      <li>Zweifel an der Fahreignung bestehen (z.B. nach Unfällen)</li>
      <li>Eine medizinische Untersuchung die Fahrtauglichkeit in Frage stellt</li>
    </ul>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Ablauf der Kontrollfahrt</h2>
    <p className="text-muted-foreground mb-4">
      Die Kontrollfahrt ähnelt der regulären praktischen Fahrprüfung Kat. B: Fahren im Strassenverkehr,
      Manöver, Beobachtungsverhalten. Der Unterschied: Der Experte beurteilt ob du den Anforderungen
      des Strassenverkehrs wieder gewachsen bist — der Massstab ist strenger.
    </p>
    <p className="text-muted-foreground mb-4">
      Besonders für Personen, die seit längerer Zeit nicht mehr gefahren sind oder aus dem Ausland
      stammen und mit dem Schweizer Strassenverkehr weniger vertraut sind, ist eine gezielte
      Vorbereitung entscheidend.
    </p>

    <h2 className="font-display text-2xl font-bold mt-10 mb-4">Tipps für die Vorbereitung</h2>
    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
      <li>Alle Manöver der praktischen Prüfung Kat. B nochmals üben</li>
      <li>Schweizer Verkehrsregeln auffrischen (besonders Vortrittsregeln)</li>
      <li>Mindestens 5–10 Fahrstunden bei einem zugelassenen Fahrlehrer absolvieren</li>
      <li>Mit Lernvideos aus der Fahrerperspektive vorbereiten — besonders hilfreich nach längerer Fahrpause</li>
      <li>Ruhig und kontrolliert fahren — Nervosität durch Vorbereitung reduzieren</li>
    </ul>

    <CTABox />

    <RelatedLinks links={[
      { to: "/manoever-fahrpruefung-kat-b", label: "Manöver Fahrprüfung Kat. B" },
      { to: "/dreipunkt-wenden-schweiz", label: "Dreipunkt-Wenden erklärt" },
      { to: "/einparken-fahrpruefung-schweiz", label: "Einparken üben" },
    ]} />
  </SEOLayout>
);

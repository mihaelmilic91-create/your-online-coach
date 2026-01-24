import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, CheckCircle, Shield, Lock, Clock, Star } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import CheckoutPaymentSection from "@/components/checkout/CheckoutPaymentSection";

const checkoutSchema = z.object({
  email: z.string().trim().email({ message: "Ungültige E-Mail-Adresse" }),
  password: z.string()
    .min(8, { message: "Passwort muss mindestens 8 Zeichen haben" })
    .regex(/[a-z]/, { message: "Passwort muss mindestens einen Kleinbuchstaben enthalten" })
    .regex(/[A-Z]/, { message: "Passwort muss mindestens einen Großbuchstaben enthalten" })
    .regex(/[0-9]/, { message: "Passwort muss mindestens eine Zahl enthalten" }),
  firstName: z.string().trim().min(2, { message: "Vorname erforderlich" }),
  lastName: z.string().trim().min(2, { message: "Nachname erforderlich" }),
  address: z.string().trim().min(5, { message: "Adresse erforderlich" }),
  postalCode: z.string().trim().min(4, { message: "Postleitzahl erforderlich" }),
  city: z.string().trim().min(2, { message: "Stadt erforderlich" }),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "Du musst den AGB zustimmen" }),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    country: "Schweiz",
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    city: "",
    canton: "",
    phone: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  // Show canceled payment message
  const paymentCanceled = searchParams.get("payment") === "canceled";

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const passwordRequirements = [
    { regex: /.{8,}/, text: "8+ Zeichen" },
    { regex: /[a-z]/, text: "Kleinbuchstabe" },
    { regex: /[A-Z]/, text: "Großbuchstabe" },
    { regex: /[0-9]/, text: "Zahl" },
  ];

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CheckoutFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Show payment section
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    navigate("/payment-success");
  };

  const cantons = [
    "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft",
    "Basel-Stadt", "Bern", "Freiburg", "Genf", "Glarus", "Graubünden", "Jura",
    "Luzern", "Neuenburg", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz",
    "Solothurn", "St. Gallen", "Tessin", "Thurgau", "Uri", "Waadt", "Wallis",
    "Zug", "Zürich"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Minimal Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Online DriveCoach" className="h-8" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Sichere Zahlung</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Canceled Payment Alert */}
        {paymentCanceled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
          >
            <p className="text-destructive font-medium">
              Die Zahlung wurde abgebrochen. Du kannst es erneut versuchen.
            </p>
          </motion.div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {showPayment ? "Zahlung abschließen" : "Sichere deinen Zugang"}
            </h1>
            <p className="text-muted-foreground">
              {showPayment 
                ? "Wähle deine bevorzugte Zahlungsmethode" 
                : "Nur noch wenige Schritte bis zu deinem Führerschein-Erfolg"
              }
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form Section - 3 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-3"
            >
              {!showPayment ? (
                <form onSubmit={handleContinueToPayment} className="space-y-6">
                  {/* Account Section */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        1
                      </div>
                      <h2 className="font-display text-lg font-semibold text-foreground">
                        Dein Konto
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">E-Mail-Adresse</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="deine@email.ch"
                          value={formData.email}
                          onChange={handleChange("email")}
                          className={`h-12 mt-1.5 ${errors.email ? "border-destructive" : ""}`}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-sm font-medium">Passwort erstellen</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sicheres Passwort wählen"
                            value={formData.password}
                            onChange={handleChange("password")}
                            className={`h-12 pr-10 ${errors.password ? "border-destructive" : ""}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-destructive mt-1">{errors.password}</p>
                        )}
                        
                        {/* Password requirements - compact */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {passwordRequirements.map((req) => (
                            <div
                              key={req.text}
                              className={`flex items-center gap-1 text-xs ${
                                req.regex.test(formData.password)
                                  ? "text-accent"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>{req.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address Section */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        2
                      </div>
                      <h2 className="font-display text-lg font-semibold text-foreground">
                        Rechnungsadresse
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName" className="text-sm font-medium">Vorname</Label>
                          <Input
                            id="firstName"
                            placeholder="Max"
                            value={formData.firstName}
                            onChange={handleChange("firstName")}
                            className={`h-12 mt-1.5 ${errors.firstName ? "border-destructive" : ""}`}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm font-medium">Nachname</Label>
                          <Input
                            id="lastName"
                            placeholder="Muster"
                            value={formData.lastName}
                            onChange={handleChange("lastName")}
                            className={`h-12 mt-1.5 ${errors.lastName ? "border-destructive" : ""}`}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm font-medium">Strasse & Hausnummer</Label>
                        <Input
                          id="address"
                          placeholder="Musterstrasse 123"
                          value={formData.address}
                          onChange={handleChange("address")}
                          className={`h-12 mt-1.5 ${errors.address ? "border-destructive" : ""}`}
                        />
                        {errors.address && (
                          <p className="text-sm text-destructive mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="postalCode" className="text-sm font-medium">PLZ</Label>
                          <Input
                            id="postalCode"
                            placeholder="8000"
                            value={formData.postalCode}
                            onChange={handleChange("postalCode")}
                            className={`h-12 mt-1.5 ${errors.postalCode ? "border-destructive" : ""}`}
                          />
                          {errors.postalCode && (
                            <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium">Stadt</Label>
                          <Input
                            id="city"
                            placeholder="Zürich"
                            value={formData.city}
                            onChange={handleChange("city")}
                            className={`h-12 mt-1.5 ${errors.city ? "border-destructive" : ""}`}
                          />
                          {errors.city && (
                            <p className="text-sm text-destructive mt-1">{errors.city}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Kanton (optional)</Label>
                        <Select
                          value={formData.canton}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, canton: value }))}
                        >
                          <SelectTrigger className="h-12 mt-1.5">
                            <SelectValue placeholder="Kanton wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {cantons.map((canton) => (
                              <SelectItem key={canton} value={canton}>
                                {canton}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Terms Section */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                        }
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        Ich stimme den{" "}
                        <Link to="/agb" className="text-primary hover:underline font-medium">
                          AGB
                        </Link>{" "}
                        und der{" "}
                        <Link to="/datenschutz" className="text-primary hover:underline font-medium">
                          Datenschutzerklärung
                        </Link>{" "}
                        zu.
                      </Label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-destructive mt-2">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  {/* Continue Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg shadow-accent/20"
                  >
                    Weiter zur Zahlung
                  </Button>

                  {/* Back Link */}
                  <div className="text-center">
                    <Link
                      to="/zugang"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Zurück zur Übersicht
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Summary of entered data */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Deine Daten</h3>
                      <button
                        onClick={() => setShowPayment(false)}
                        className="text-sm text-primary hover:underline"
                      >
                        Bearbeiten
                      </button>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">E-Mail:</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Adresse:</span>
                        <span className="font-medium text-right">
                          {formData.address}, {formData.postalCode} {formData.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                        3
                      </div>
                      <h2 className="font-display text-lg font-semibold text-foreground">
                        Zahlungsmethode wählen
                      </h2>
                    </div>
                    
                    <CheckoutPaymentSection
                      formData={formData}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>

                  {/* Back Button */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowPayment(false)}
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Zurück zur Dateneingabe
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Summary - 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Product Card */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Deine Bestellung
                  </h3>
                  
                  <div className="flex gap-4 pb-5 border-b border-border">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-accent/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">
                        Online Drivecoach
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Jahreszugang (365 Tage)
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs line-through text-muted-foreground">CHF 129.00</span>
                        <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded font-medium">-39%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div className="pt-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zwischensumme</span>
                      <span>CHF 79.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MwSt. (inkl.)</span>
                      <span>CHF 5.76</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="font-semibold text-foreground">Gesamtsumme</span>
                      <span className="font-display text-xl font-bold text-foreground">CHF 79.00</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Sichere Zahlung</p>
                        <p className="text-xs text-muted-foreground">SSL-verschlüsselt via Stripe</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Sofortiger Zugang</p>
                        <p className="text-xs text-muted-foreground">Direkt nach der Zahlung</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">4.9/5 Bewertung</p>
                        <p className="text-xs text-muted-foreground">Von über 1'000 Fahrschülern</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="text-center text-xs text-muted-foreground p-3">
                  <p>30 Tage Geld-zurück-Garantie</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50 py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Online DriveCoach · 
          <Link to="/agb" className="hover:text-foreground ml-2">AGB</Link> · 
          <Link to="/datenschutz" className="hover:text-foreground ml-2">Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;

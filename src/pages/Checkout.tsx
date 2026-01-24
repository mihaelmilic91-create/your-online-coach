import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, ChevronDown, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const checkoutSchema = z.object({
  email: z.string().trim().email({ message: "Ungültige E-Mail-Adresse" }),
  password: z.string()
    .min(8, { message: "Passwort muss mindestens 8 Zeichen haben" })
    .regex(/[a-z]/, { message: "Passwort muss mindestens einen Kleinbuchstaben enthalten" })
    .regex(/[A-Z]/, { message: "Passwort muss mindestens einen Großbuchstaben enthalten" })
    .regex(/[0-9]/, { message: "Passwort muss mindestens eine Zahl enthalten" }),
  country: z.string().min(1, { message: "Bitte Land wählen" }),
  firstName: z.string().trim().min(2, { message: "Vorname erforderlich" }),
  lastName: z.string().trim().min(2, { message: "Nachname erforderlich" }),
  address: z.string().trim().min(5, { message: "Adresse erforderlich" }),
  postalCode: z.string().trim().min(4, { message: "Postleitzahl erforderlich" }),
  city: z.string().trim().min(2, { message: "Stadt erforderlich" }),
  phone: z.string().optional(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "Du musst den AGB zustimmen" }),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "twint">("card");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    country: "Schweiz",
    firstName: "",
    lastName: "",
    address: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    canton: "",
    phone: "",
    agreeToTerms: false,
    orderNote: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const passwordRequirements = [
    { regex: /.{8,}/, text: "Mindestens 8 Zeichen" },
    { regex: /[a-z]/, text: "Ein Kleinbuchstabe" },
    { regex: /[A-Z]/, text: "Ein Großbuchstabe" },
    { regex: /[0-9]/, text: "Eine Zahl" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);

    try {
      // Create user account
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          },
        },
      });

      if (signUpError) {
        toast({
          variant: "destructive",
          title: "Registrierung fehlgeschlagen",
          description: signUpError.message,
        });
        setIsLoading(false);
        return;
      }

      // TODO: Process payment with Stripe here
      // For now, simulate successful payment

      toast({
        title: "Bestellung erfolgreich!",
        description: "Dein Konto wurde erstellt. Willkommen bei Online DriveCoach!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cantons = [
    "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft",
    "Basel-Stadt", "Bern", "Freiburg", "Genf", "Glarus", "Graubünden", "Jura",
    "Luzern", "Neuenburg", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz",
    "Solothurn", "St. Gallen", "Tessin", "Thurgau", "Uri", "Waadt", "Wallis",
    "Zug", "Zürich"
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src={logo} alt="Online DriveCoach" className="h-8 brightness-0 invert" />
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border py-3">
        <div className="container mx-auto px-4 flex justify-end">
          <Link to="/" className="text-accent hover:underline text-sm font-medium">
            Video-Kurse
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Express Checkout */}
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h2 className="text-center text-sm text-muted-foreground mb-4">
                    Express-Zahlung
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 bg-foreground text-background hover:bg-foreground/90"
                    >
                      <span className="font-semibold"> Pay</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 bg-foreground text-background hover:bg-foreground/90"
                    >
                      <span className="font-semibold">G Pay</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">Oder fahre unten fort</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </div>

                {/* Account Creation */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Konto erstellen
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Erstelle dein Konto, um sofort Zugang zu allen Videos zu erhalten.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="E-Mail-Adresse"
                        value={formData.email}
                        onChange={handleChange("email")}
                        className={`h-12 ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Passwort erstellen"
                          value={formData.password}
                          onChange={handleChange("password")}
                          className={`h-12 pr-10 ${errors.password ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                      
                      {/* Password requirements */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {passwordRequirements.map((req) => (
                          <div
                            key={req.text}
                            className={`flex items-center gap-1.5 text-xs ${
                              req.regex.test(formData.password)
                                ? "text-accent"
                                : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Rechnungsadresse
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Land/Region</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Land wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Schweiz">Schweiz</SelectItem>
                          <SelectItem value="Deutschland">Deutschland</SelectItem>
                          <SelectItem value="Österreich">Österreich</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Vorname"
                          value={formData.firstName}
                          onChange={handleChange("firstName")}
                          className={`h-12 ${errors.firstName ? "border-destructive" : ""}`}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Nachname"
                          value={formData.lastName}
                          onChange={handleChange("lastName")}
                          className={`h-12 ${errors.lastName ? "border-destructive" : ""}`}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Input
                        placeholder="Adresse"
                        value={formData.address}
                        onChange={handleChange("address")}
                        className={`h-12 ${errors.address ? "border-destructive" : ""}`}
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive">{errors.address}</p>
                      )}
                      <button
                        type="button"
                        className="text-sm text-accent hover:underline"
                        onClick={() => document.getElementById("addressLine2")?.focus()}
                      >
                        + Wohnung, Suite usw. hinzufügen
                      </button>
                      <Input
                        id="addressLine2"
                        placeholder="Wohnung, Suite, etc. (optional)"
                        value={formData.addressLine2}
                        onChange={handleChange("addressLine2")}
                        className="h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Postleitzahl"
                          value={formData.postalCode}
                          onChange={handleChange("postalCode")}
                          className={`h-12 ${errors.postalCode ? "border-destructive" : ""}`}
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-destructive">{errors.postalCode}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Stadt"
                          value={formData.city}
                          onChange={handleChange("city")}
                          className={`h-12 ${errors.city ? "border-destructive" : ""}`}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">Kanton (optional)</Label>
                        <Select
                          value={formData.canton}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, canton: value }))}
                        >
                          <SelectTrigger className="h-12">
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
                      <div>
                        <Label className="text-muted-foreground text-xs">Telefon (optional)</Label>
                        <Input
                          placeholder="Telefon (optional)"
                          value={formData.phone}
                          onChange={handleChange("phone")}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Zahlungsoptionen
                  </h2>

                  {/* Credit Card */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "card" ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {paymentMethod === "card" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="font-medium">Credit / Debit Card</span>
                      </div>
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {paymentMethod === "card" && (
                      <div className="space-y-4 pl-8">
                        <div>
                          <Label className="text-sm text-muted-foreground">Kartennummer</Label>
                          <div className="relative">
                            <Input
                              placeholder="1234 1234 1234 1234"
                              className="h-12 pr-24"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <div className="w-8 h-5 bg-destructive rounded text-[8px] text-destructive-foreground flex items-center justify-center font-bold">MC</div>
                              <div className="w-8 h-5 bg-primary rounded text-[8px] text-primary-foreground flex items-center justify-center font-bold">VISA</div>
                              <div className="w-8 h-5 bg-accent rounded text-[8px] text-accent-foreground flex items-center justify-center font-bold">AMEX</div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Ablaufdatum</Label>
                            <Input placeholder="MM/JJ" className="h-12" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Sicherheitscode</Label>
                            <Input placeholder="Prüfziffer" className="h-12" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mit der Angabe Ihrer Kartendaten erklären Sie sich damit einverstanden, dass Online Drive Coach Ihre Karte für zukünftige Zahlungen gemäß seinen Bedingungen belastet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* TWINT */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "twint" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPaymentMethod("twint")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "twint" ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {paymentMethod === "twint" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="font-medium">Twint</span>
                      </div>
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-accent-foreground text-xs font-bold">T</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Note */}
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="orderNote"
                      checked={formData.orderNote !== ""}
                      onCheckedChange={() => {}}
                    />
                    <Label htmlFor="orderNote" className="text-sm cursor-pointer">
                      Eine Notiz zu deiner Bestellung hinzufügen
                    </Label>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                      }
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                      Du musst unseren{" "}
                      <Link to="/agb" className="text-accent hover:underline">
                        Allgemeine Geschäftsbedingungen
                      </Link>{" "}
                      und unserer{" "}
                      <Link to="/datenschutz" className="text-accent hover:underline">
                        Datenschutzerklärung
                      </Link>{" "}
                      zustimmen, um mit dem Einkauf fortzufahren.
                    </Label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-destructive mt-2">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to="/zugang"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zum Warenkorb
                  </Link>
                  <Button
                    type="submit"
                    className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8"
                    disabled={isLoading}
                  >
                    {isLoading ? "Wird verarbeitet..." : "Bestellung aufgeben"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-xl p-6 shadow-soft sticky top-8"
            >
              <h2 className="font-display text-lg font-semibold text-accent mb-6">
                Bestellübersicht
              </h2>

              {/* Product */}
              <div className="flex gap-4 pb-6 border-b border-border">
                <div className="relative w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-muted-foreground text-background text-xs rounded-full flex items-center justify-center">
                    1
                  </span>
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Online Drivecoach Jahreszugang
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="line-through">CHF 129.00</span>{" "}
                    <span className="text-foreground">CHF 79.00</span>
                  </p>
                </div>
                <span className="font-medium text-foreground">CHF 79.00</span>
              </div>

              {/* Coupon */}
              <div className="py-4 border-b border-border">
                <button className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground">
                  <span>Gutscheine hinzufügen</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Subtotal */}
              <div className="py-4 border-b border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span className="text-foreground">CHF 79.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-foreground">
                    Gesamtsumme
                  </span>
                  <span className="font-display text-xl font-bold text-foreground">
                    CHF 79.00
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-8">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src={logo} alt="Online DriveCoach" className="h-8 opacity-50" />
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;

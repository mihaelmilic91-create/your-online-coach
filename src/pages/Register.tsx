import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const registerSchema = z.object({
  displayName: z.string()
    .trim()
    .min(2, { message: "Name muss mindestens 2 Zeichen haben" })
    .max(50, { message: "Name darf maximal 50 Zeichen haben" }),
  email: z.string()
    .trim()
    .email({ message: "Ungültige E-Mail-Adresse" })
    .max(255, { message: "E-Mail darf maximal 255 Zeichen haben" }),
  password: z.string()
    .min(8, { message: "Passwort muss mindestens 8 Zeichen haben" })
    .max(72, { message: "Passwort darf maximal 72 Zeichen haben" })
    .regex(/[a-z]/, { message: "Passwort muss mindestens einen Kleinbuchstaben enthalten" })
    .regex(/[A-Z]/, { message: "Passwort muss mindestens einen Großbuchstaben enthalten" })
    .regex(/[0-9]/, { message: "Passwort muss mindestens eine Zahl enthalten" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: formData.displayName.trim(),
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registrierung fehlgeschlagen",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Erfolgreich registriert!",
        description: "Willkommen bei Online DriveCoach!",
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

  const passwordRequirements = [
    { regex: /.{8,}/, text: "Mindestens 8 Zeichen" },
    { regex: /[a-z]/, text: "Ein Kleinbuchstabe" },
    { regex: /[A-Z]/, text: "Ein Großbuchstabe" },
    { regex: /[0-9]/, text: "Eine Zahl" },
  ];

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">OD</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Online <span className="text-gradient">DriveCoach</span>
          </span>
        </Link>

        {/* Form Card */}
        <div className="bg-card shadow-elevated rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Konto erstellen
            </h1>
            <p className="text-muted-foreground">
              Starte deine Reise zum Führerschein
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Dein Name"
                  value={formData.displayName}
                  onChange={handleChange("displayName")}
                  className={`pl-10 h-12 ${errors.displayName ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.ch"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange("password")}
                  className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`}
                  disabled={isLoading}
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
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Wird registriert..."
              ) : (
                <>
                  Registrieren
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-muted-foreground mt-6">
            Bereits ein Konto?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Ungültige E-Mail-Adresse" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});

  const handleChange = (field: keyof ForgotPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ForgotPasswordFormData;
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
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: error.message,
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "E-Mail gesendet",
        description: "Überprüfe dein Postfach für den Reset-Link.",
      });
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

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        {/* Form Card */}
        <div className="bg-card shadow-elevated rounded-3xl p-8">
          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                E-Mail gesendet!
              </h1>
              <p className="text-muted-foreground">
                Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts gesendet. 
                Überprüfe auch deinen Spam-Ordner.
              </p>
              <div className="pt-4 space-y-3">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Erneut senden
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zum Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  Passwort vergessen?
                </h1>
                <p className="text-muted-foreground">
                  Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Wird gesendet..."
                  ) : (
                    <>
                      Link senden
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zum Login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;

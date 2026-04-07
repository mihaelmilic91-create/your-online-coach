import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
...
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        isReadyRef.current = true;
        setIsReady(true);
      } else if (event === "SIGNED_IN" && session) {
        isReadyRef.current = true;
        setIsReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        isReadyRef.current = true;
        setIsReady(true);
      } else {
        setTimeout(() => {
          if (isReadyRef.current) return;
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s && !isReadyRef.current) {
              toast({
                variant: "destructive",
                title: "Ungültiger Link",
                description: "Der Reset-Link ist ungültig oder abgelaufen.",
              });
              navigate("/forgot-password");
            }
          });
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleChange = (field: keyof ResetPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ResetPasswordFormData;
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
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: error.message,
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich geändert.",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Passwort geändert!
              </h1>
              <p className="text-muted-foreground">
                Dein Passwort wurde erfolgreich geändert. Du wirst zum Dashboard weitergeleitet...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  Neues Passwort
                </h1>
                <p className="text-muted-foreground">
                  Gib dein neues Passwort ein.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Neues Passwort</Label>
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
                    "Wird gespeichert..."
                  ) : (
                    <>
                      Passwort ändern
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewPopupProps {
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

type FlowType = "review" | "feedback";
type Step = "helpfulness" | "saved_lessons" | "star_rating" | "review_text" | "permission" | "thank_you"
  | "feedback_missing" | "feedback_improve" | "feedback_thanks";

const ReviewPopup = ({ userId, onClose, onComplete }: ReviewPopupProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("helpfulness");
  const [flowType, setFlowType] = useState<FlowType>("review");
  const [saving, setSaving] = useState(false);

  // Review data
  const [helpfulness, setHelpfulness] = useState("");
  const [savedLessons, setSavedLessons] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [publishPermission, setPublishPermission] = useState(false);

  // Feedback data
  const [feedbackMissing, setFeedbackMissing] = useState("");
  const [feedbackMissingOther, setFeedbackMissingOther] = useState("");
  const [feedbackImprove, setFeedbackImprove] = useState("");

  const handleDismiss = async () => {
    // Track dismissal
    const { data: existing } = await supabase
      .from("review_popup_tracking")
      .select("id, dismiss_count")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("review_popup_tracking").update({
        last_dismissed_at: new Date().toISOString(),
        dismiss_count: (existing.dismiss_count || 0) + 1,
      }).eq("id", existing.id);
    } else {
      await supabase.from("review_popup_tracking").insert({
        user_id: userId,
        last_dismissed_at: new Date().toISOString(),
        dismiss_count: 1,
      });
    }
    onClose();
  };

  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const goForward = (nextStep: Step) => {
    setDirection(1);
    setStep(nextStep);
  };

  const goBack = (prevStep: Step) => {
    setDirection(-1);
    setStep(prevStep);
  };

  const handleHelpfulness = (answer: string) => {
    setHelpfulness(answer);
    setDirection(1);
    if (answer === "Sehr hilfreich") {
      setFlowType("review");
      setStep("saved_lessons");
    } else {
      setFlowType("feedback");
      setStep("feedback_missing");
    }
  };

  const saveReview = async () => {
    setSaving(true);
    try {
      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, created_at")
        .eq("user_id", userId)
        .maybeSingle();

      const nameParts = (profile?.display_name || "").split(" ");
      const firstName = nameParts[0] || "";

      const { error } = await supabase.from("user_reviews").insert({
        user_id: userId,
        first_name: firstName,
        registration_date: profile?.created_at || null,
        helpfulness,
        saved_lessons: savedLessons || null,
        star_rating: starRating || null,
        review_text: reviewText || null,
        publish_permission: publishPermission,
        flow_type: flowType,
        feedback_missing: feedbackMissing || null,
        feedback_missing_other: feedbackMissingOther || null,
        feedback_improve: feedbackImprove || null,
      });

      if (error) throw error;

      // Track completion
      const { data: existing } = await supabase
        .from("review_popup_tracking")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase.from("review_popup_tracking").update({
          last_completed_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("review_popup_tracking").insert({
          user_id: userId,
          last_completed_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Fehler", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReviewComplete = async () => {
    await saveReview();
    setStep("thank_you");
  };

  const handleFeedbackComplete = async () => {
    await saveReview();
    setStep("feedback_thanks");
  };

  const feedbackOptions = [
    "Inhalte helfen mir noch zu wenig",
    "Ich finde mich in der App noch nicht gut zurecht",
    "Ich habe noch zu wenig Videos gesehen",
    "Ich brauche mehr Hilfe bei bestimmten Themen",
    "Sonstiges",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-elevated max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          {step !== "helpfulness" && step !== "thank_you" && step !== "feedback_thanks" ? (
            <button
              onClick={() => {
                if (step === "saved_lessons") goBack("helpfulness");
                else if (step === "star_rating") goBack("saved_lessons");
                else if (step === "review_text") goBack("star_rating");
                else if (step === "permission") goBack("review_text");
                else if (step === "feedback_missing") goBack("helpfulness");
                else if (step === "feedback_improve") goBack("feedback_missing");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          <AnimatePresence mode="wait">
            {/* Step: Helpfulness */}
            {step === "helpfulness" && (
              <StepContainer key="helpfulness" direction={direction}>
                <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
                  Wie hilfreich ist Online Drivecoach bisher für dich?
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Sehr hilfreich 👍", value: "Sehr hilfreich" },
                    { label: "Ganz okay 🙂", value: "Ganz okay" },
                    { label: "Eher nicht hilfreich 😕", value: "Eher nicht hilfreich" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleHelpfulness(opt.value)}
                      className="w-full text-left px-5 py-4 rounded-xl border border-border bg-background hover:border-accent hover:bg-accent/5 transition-all text-foreground font-medium"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Review Flow: Saved Lessons */}
            {step === "saved_lessons" && (
              <StepContainer key="saved_lessons" direction={direction}>
                <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
                  Wie viele Fahrstunden glaubst du, sparst du mit Online Drivecoach ungefähr?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {["0–1", "2–3", "4–5", "6+"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSavedLessons(opt); goForward("star_rating"); }}
                      className={`px-5 py-4 rounded-xl border text-center font-medium transition-all ${
                        savedLessons === opt
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-background hover:border-accent hover:bg-accent/5 text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Review Flow: Star Rating */}
            {step === "star_rating" && (
              <StepContainer key="star_rating" direction={direction}>
                <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
                  Wie würdest du Online Drivecoach insgesamt bewerten?
                </h3>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setStarRating(v)}
                      onMouseEnter={() => setHoverRating(v)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          v <= (hoverRating || starRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <Button
                  variant="hero"
                  className="w-full gap-2"
                  disabled={starRating === 0}
                  onClick={() => goForward("review_text")}
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </Button>
              </StepContainer>
            )}

            {/* Review Flow: Text */}
            {step === "review_text" && (
              <StepContainer key="review_text" direction={direction}>
                <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
                  Was hat dir am meisten geholfen?
                </h3>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Optional – z.B. die Videos zur Autobahnfahrt..."
                  rows={4}
                  className="mb-4"
                />
                <Button
                  variant="hero"
                  className="w-full gap-2"
                  onClick={() => goForward("permission")}
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </Button>
              </StepContainer>
            )}

            {/* Review Flow: Permission */}
            {step === "permission" && (
              <StepContainer key="permission" direction={direction}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 mb-6">
                  <Checkbox
                    id="publish"
                    checked={publishPermission}
                    onCheckedChange={(v) => setPublishPermission(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="publish" className="text-sm text-foreground cursor-pointer leading-relaxed">
                    Meine Bewertung darf mit Vorname und Wohnort veröffentlicht werden.
                  </label>
                </div>
                <Button
                  variant="hero"
                  className="w-full gap-2"
                  onClick={handleReviewComplete}
                  disabled={saving}
                >
                  {saving ? "Wird gespeichert..." : "Absenden"}
                </Button>
              </StepContainer>
            )}

            {/* Review Flow: Thank You */}
            {step === "thank_you" && (
              <StepContainer key="thank_you" direction={direction}>
                <div className="text-center py-4">
                  <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Vielen Dank für dein Feedback! 🙌
                  </h3>
                  <p className="text-muted-foreground mb-6">Deine Bewertung hilft uns und anderen Lernfahrern.</p>
                  <Button variant="hero" className="w-full" onClick={onComplete}>
                    Weiterlernen
                  </Button>
                </div>
              </StepContainer>
            )}

            {/* Feedback Flow: Missing */}
            {step === "feedback_missing" && (
              <StepContainer key="feedback_missing">
                <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
                  Was fehlt dir aktuell am meisten?
                </h3>
                <div className="space-y-3">
                  {feedbackOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setFeedbackMissing(opt);
                        if (opt === "Sonstiges") return; // stay to show text field
                        goForward("feedback_improve");
                      }}
                      className={`w-full text-left px-5 py-3 rounded-xl border transition-all text-sm font-medium ${
                        feedbackMissing === opt
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-background hover:border-accent hover:bg-accent/5 text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                  {feedbackMissing === "Sonstiges" && (
                    <>
                      <Textarea
                        value={feedbackMissingOther}
                        onChange={(e) => setFeedbackMissingOther(e.target.value)}
                        placeholder="Beschreibe, was dir fehlt..."
                        rows={3}
                      />
                      <Button variant="hero" className="w-full gap-2" onClick={() => goForward("feedback_improve")}>
                        Weiter <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </StepContainer>
            )}

            {/* Feedback Flow: Improve */}
            {step === "feedback_improve" && (
              <StepContainer key="feedback_improve">
                <h3 className="font-display text-xl font-bold text-foreground text-center mb-6">
                  Was könnten wir verbessern?
                </h3>
                <Textarea
                  value={feedbackImprove}
                  onChange={(e) => setFeedbackImprove(e.target.value)}
                  placeholder="Optional – dein Verbesserungsvorschlag..."
                  rows={4}
                  className="mb-4"
                />
                <Button
                  variant="hero"
                  className="w-full gap-2"
                  onClick={handleFeedbackComplete}
                  disabled={saving}
                >
                  {saving ? "Wird gespeichert..." : "Absenden"}
                </Button>
              </StepContainer>
            )}

            {/* Feedback Flow: Thank You */}
            {step === "feedback_thanks" && (
              <StepContainer key="feedback_thanks">
                <div className="text-center py-4">
                  <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Danke für dein ehrliches Feedback 🙌
                  </h3>
                  <p className="text-muted-foreground mb-6">Wir arbeiten daran, Online Drivecoach noch besser zu machen.</p>
                  <Button variant="hero" className="w-full" onClick={onComplete}>
                    Weiterlernen
                  </Button>
                </div>
              </StepContainer>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const StepContainer = ({ children, direction = 1 }: { children: React.ReactNode; direction?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: direction * 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction * -20 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export default ReviewPopup;

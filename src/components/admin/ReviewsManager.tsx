import { useState, useEffect } from "react";
import { Loader2, Star, ThumbsUp, MessageSquareText, Check, X, Trash2, Filter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserReview {
  id: string;
  user_id: string;
  first_name: string | null;
  city: string | null;
  registration_date: string | null;
  review_date: string;
  helpfulness: string;
  saved_lessons: string | null;
  star_rating: number | null;
  review_text: string | null;
  publish_permission: boolean;
  is_approved: boolean;
  feedback_missing: string | null;
  feedback_missing_other: string | null;
  feedback_improve: string | null;
  flow_type: string;
}

const ReviewsManager = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterLessons, setFilterLessons] = useState<string>("all");

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .order("review_date", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const toggleApproval = async (review: UserReview) => {
    const { error } = await supabase
      .from("user_reviews")
      .update({ is_approved: !review.is_approved })
      .eq("id", review.id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: review.is_approved ? "Abgelehnt" : "Genehmigt" });
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Bewertung wirklich löschen?")) return;
    const { error } = await supabase.from("user_reviews").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Gelöscht" });
      fetchReviews();
    }
  };

  const importToTestimonials = async (r: UserReview) => {
    const { error } = await supabase
      .from("user_reviews")
      .update({ is_approved: true, publish_permission: true })
      .eq("id", r.id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Auf Website sichtbar ✓", description: "Bewertung wird jetzt auf der Homepage angezeigt."
  });
      fetchReviews();
    }
  };

  const removeFromWebsite = async (r: UserReview) => {
    const { error } = await supabase
      .from("user_reviews")
      .update({ publish_permission: false })
      .eq("id", r.id);
    if (error) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } else {
      toast({ title: "Von Website entfernt" });
      fetchReviews();
    }
  };
  
  const filtered = reviews.filter((r) => {
    if (filterType === "review" && r.flow_type !== "review") return false;
    if (filterType === "feedback" && r.flow_type !== "feedback") return false;
    if (filterRating !== "all" && r.star_rating !== Number(filterRating)) return false;
    if (filterLessons !== "all" && r.saved_lessons !== filterLessons) return false;
    return true;
  });

  // Stats
  const reviewsOnly = reviews.filter((r) => r.flow_type === "review" && r.star_rating);
  const avgRating = reviewsOnly.length > 0
    ? (reviewsOnly.reduce((s, r) => s + (r.star_rating || 0), 0) / reviewsOnly.length).toFixed(1)
    : "–";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{reviewsOnly.length}</p>
          <p className="text-xs text-muted-foreground">Bewertungen</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{reviews.filter(r => r.flow_type === "feedback").length}</p>
          <p className="text-xs text-muted-foreground">Feedback</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">⭐ {avgRating}</p>
          <p className="text-xs text-muted-foreground">Ø Bewertung</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="review">Bewertungen</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sterne" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sterne</SelectItem>
            {[5, 4, 3, 2, 1].map(n => (
              <SelectItem key={n} value={String(n)}>{n} Stern{n > 1 ? "e" : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterLessons} onValueChange={setFilterLessons}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Gesparte Std." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {["0–1", "2–3", "4–5", "6+"].map(v => (
              <SelectItem key={v} value={v}>{v} Stunden</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className="hover:shadow-soft transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={r.flow_type === "review" ? "default" : "secondary"}>
                      {r.flow_type === "review" ? (
                        <><ThumbsUp className="w-3 h-3 mr-1" />Bewertung</>
                      ) : (
                        <><MessageSquareText className="w-3 h-3 mr-1" />Feedback</>
                      )}
                    </Badge>
                    {r.star_rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.star_rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    {r.saved_lessons && (
                      <span className="text-xs text-muted-foreground">~{r.saved_lessons} Std. gespart</span>
                    )}
                    {r.is_approved ? (
                      <Badge variant="outline" className="text-accent border-accent/30">Genehmigt</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Ausstehend</Badge>
                    )}
                    {r.publish_permission && (
                      <Badge variant="outline" className="text-primary border-primary/30 text-xs">📢 Darf veröffentlicht werden</Badge>
                    )}
                  </div>

                  <div className="text-sm text-foreground mb-1">
                    <span className="font-semibold">{r.first_name || "Anonym"}</span>
                    {r.city && <span className="text-muted-foreground">, {r.city}</span>}
                    <span className="text-muted-foreground ml-2 text-xs">
                      {new Date(r.review_date).toLocaleDateString("de-CH")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <strong>Hilfreich:</strong> {r.helpfulness}
                  </p>

                  {r.review_text && (
                    <p className="text-sm text-foreground mt-1">„{r.review_text}"</p>
                  )}
                  {r.feedback_missing && (
                    <p className="text-sm text-foreground mt-1"><strong>Fehlt:</strong> {r.feedback_missing}
                      {r.feedback_missing_other && ` – ${r.feedback_missing_other}`}
                    </p>
                  )}
                  {r.feedback_improve && (
                    <p className="text-sm text-foreground mt-1"><strong>Verbesserung:</strong> {r.feedback_improve}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <Button
    variant="ghost"
    size="icon"
    className={`h-8 w-8 ${r.is_approved ? "text-accent" : "text-muted-foreground"}`}
    onClick={() => toggleApproval(r)}
    title={r.is_approved ? "Ablehnen" : "Genehmigen"}
  >
    <Check className="w-4 h-4" />
  </Button>
  {r.publish_permission ? (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-accent"
      onClick={() => removeFromWebsite(r)}
      title="Von Website entfernen"
    >
      <Globe className="w-4 h-4" />
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground"
      onClick={() => importToTestimonials(r)}
      title="Auf Website zeigen"
    >
      <Globe className="w-4 h-4" />
    </Button>
  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => importToTestimonials(r)}
                    title="Auf Website zeigen"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteReview(r.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Keine Bewertungen gefunden</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;

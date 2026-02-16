import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CategoryRating {
  name: string;
  avgRating: number;
  count: number;
}

interface SelfAssessmentChartProps {
  userId: string;
}

const SelfAssessmentChart = ({ userId }: SelfAssessmentChartProps) => {
  const [data, setData] = useState<CategoryRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallAvg, setOverallAvg] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all user's self assessments with video info
        const { data: assessments, error: aErr } = await supabase
          .from("video_self_assessments")
          .select("rating, video_id")
          .eq("user_id", userId);

        if (aErr || !assessments || assessments.length === 0) {
          setLoading(false);
          return;
        }

        // Get video -> category mapping
        const videoIds = [...new Set(assessments.map(a => a.video_id))];
        const { data: videos, error: vErr } = await supabase
          .from("videos")
          .select("id, category_id")
          .in("id", videoIds);

        if (vErr || !videos) {
          setLoading(false);
          return;
        }

        // Get category names
        const categoryIds = [...new Set(videos.map(v => v.category_id))];
        const { data: categories, error: cErr } = await supabase
          .from("video_categories")
          .select("id, title")
          .in("id", categoryIds);

        if (cErr || !categories) {
          setLoading(false);
          return;
        }

        // Build category map
        const catMap = new Map(categories.map(c => [c.id, c.title]));
        const videoCatMap = new Map(videos.map(v => [v.id, v.category_id]));

        // Group ratings by category
        const grouped: Record<string, { total: number; count: number; name: string }> = {};
        let totalRating = 0;

        assessments.forEach(a => {
          const catId = videoCatMap.get(a.video_id);
          if (!catId) return;
          const catName = catMap.get(catId) || "Unbekannt";
          if (!grouped[catId]) grouped[catId] = { total: 0, count: 0, name: catName };
          grouped[catId].total += a.rating;
          grouped[catId].count += 1;
          totalRating += a.rating;
        });

        const result: CategoryRating[] = Object.values(grouped).map(g => ({
          name: g.name.length > 12 ? g.name.substring(0, 12) + "…" : g.name,
          avgRating: Math.round((g.total / g.count) * 10) / 10,
          count: g.count,
        }));

        setData(result);
        setOverallAvg(Math.round((totalRating / assessments.length) * 10) / 10);
      } catch (err) {
        console.error("Error fetching self-assessments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const getBarColor = (rating: number) => {
    if (rating >= 4) return "hsl(var(--accent))";
    if (rating >= 3) return "hsl(142 71% 45%)";
    if (rating >= 2) return "hsl(38 92% 50%)";
    return "hsl(0 84% 60%)";
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-soft">
        <CardContent className="p-6 flex items-center justify-center h-[280px]">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" />
            Selbsteinschätzung
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Noch keine Bewertungen abgegeben
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bewerte deine Praxis-Fähigkeiten bei den Videos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" />
            Selbsteinschätzung
          </CardTitle>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold text-foreground">⌀ {overallAvg}</span>
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} / 5`, "Bewertung"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="avgRating" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.avgRating)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelfAssessmentChart;

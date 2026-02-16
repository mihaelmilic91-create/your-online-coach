import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WatchCompletionChartProps {
  userId: string;
  totalVideos: number;
}

const WatchCompletionChart = ({ userId, totalVideos }: WatchCompletionChartProps) => {
  const [watchedCount, setWatchedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { count } = await supabase
        .from("video_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gt("watch_count", 0);
      setWatchedCount(count || 0);
      setLoading(false);
    };
    if (userId) fetch();
  }, [userId]);

  const remaining = Math.max(totalVideos - watchedCount, 0);
  const percentage = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

  const data = [
    { name: "Angesehen", value: watchedCount },
    { name: "Offen", value: remaining },
  ];

  const COLORS = ["hsl(var(--accent))", "hsl(var(--muted))"];

  if (loading) {
    return (
      <Card className="bg-card shadow-soft">
        <CardContent className="p-6 flex items-center justify-center h-[280px]">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          Videos angesehen
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">{percentage}%</p>
            <p className="text-sm text-muted-foreground">
              {watchedCount} von {totalVideos} Videos
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                Angesehen
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-muted inline-block" />
                Offen
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchCompletionChart;

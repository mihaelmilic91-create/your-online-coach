import { useState, useEffect } from "react";
import { BarChart3, Users, Video, Eye, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  recentUsers: number;
  totalVideos: number;
  totalVideoViews: number;
}

const StatsOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { action: "get_stats" },
      });
      if (!error && data?.stats) setStats(data.stats);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (!stats) return <p className="text-center text-muted-foreground py-8">Statistiken konnten nicht geladen werden.</p>;

  const cards = [
    { label: "Benutzer gesamt", value: stats.totalUsers, icon: Users, color: "text-accent" },
    { label: "Aktive Zugänge", value: stats.activeUsers, icon: TrendingUp, color: "text-accent" },
    { label: "Neue (30 Tage)", value: stats.recentUsers, icon: Users, color: "text-accent" },
    { label: "Videos veröffentlicht", value: stats.totalVideos, icon: Video, color: "text-accent" },
    { label: "Video-Aufrufe gesamt", value: stats.totalVideoViews, icon: Eye, color: "text-accent" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-accent" /> Statistiken
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;

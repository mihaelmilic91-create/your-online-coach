import { useState, useEffect } from "react";
import { Users, Edit, Save, X, Loader2, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  access_until: string | null;
  role: string;
}

const UsersManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAccess, setEditAccess] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list_users" },
    });
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Fehler", description: data?.error || error?.message });
    } else {
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setEditName(u.display_name || "");
    setEditAccess(u.access_until ? u.access_until.split("T")[0] : "");
  };

  const saveUser = async () => {
    if (!editing) return;
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: {
        action: "update_user",
        user_id: editing.id,
        display_name: editName.trim() || null,
        access_until: editAccess ? new Date(editAccess).toISOString() : null,
      },
    });
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Fehler", description: data?.error || error?.message });
    } else {
      toast({ title: "Gespeichert", description: "Benutzer wurde aktualisiert." });
      setEditing(null);
      fetchUsers();
    }
    setSaving(false);
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          Benutzer ({users.length})
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen nach E-Mail oder Name..." className="pl-10" />
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((u) => {
          const hasAccess = u.access_until && new Date(u.access_until) > new Date();
          return (
            <Card key={u.id} className="hover:shadow-soft transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">{u.email}</p>
                      {u.role === "admin" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">Admin</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {u.display_name && <span>{u.display_name}</span>}
                      <span>Registriert: {new Date(u.created_at).toLocaleDateString("de-CH")}</span>
                      {u.last_sign_in_at && <span>Letzter Login: {new Date(u.last_sign_in_at).toLocaleDateString("de-CH")}</span>}
                      <span className={hasAccess ? "text-accent" : "text-destructive"}>
                        {hasAccess ? `Zugang bis ${new Date(u.access_until!).toLocaleDateString("de-CH")}` : "Kein Zugang"}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl shadow-elevated max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">Benutzer bearbeiten</h3>
                <Button variant="ghost" size="icon" onClick={() => setEditing(null)}><X className="w-5 h-5" /></Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{editing.email}</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Anzeigename</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <Label>Zugang bis</Label>
                  <Input type="date" value={editAccess} onChange={(e) => setEditAccess(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Abbrechen</Button>
                <Button variant="hero" onClick={saveUser} disabled={saving} className="flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Speichern
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;

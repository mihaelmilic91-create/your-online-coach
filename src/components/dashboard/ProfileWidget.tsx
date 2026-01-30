import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Check, X, Mail, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from "./UserAvatar";

interface ProfileWidgetProps {
  user: any;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
}

const ProfileWidget = ({ user, displayName, onDisplayNameChange }: ProfileWidgetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(displayName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error("Name darf nicht leer sein");
      return;
    }

    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: editedName.trim() })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: editedName.trim() }
      });

      if (authError) throw authError;

      onDisplayNameChange(editedName.trim());
      setIsEditing(false);
      toast.success("Profil aktualisiert");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(displayName);
    setIsEditing(false);
  };

  return (
    <Card className="bg-card shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <UserAvatar name={displayName} size="lg" />
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Dein Name"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleSave}
                  disabled={saving}
                  className="h-7 w-7 text-accent hover:text-accent/80"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleCancel}
                  disabled={saving}
                  className="h-7 w-7"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{displayName}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 flex-shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>

          {/* Password change button */}
          <Button asChild variant="outline" size="sm" className="gap-1.5 flex-shrink-0">
            <Link to="/forgot-password">
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Passwort</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileWidget;

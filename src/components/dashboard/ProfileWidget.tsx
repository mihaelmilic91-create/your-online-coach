import { useState } from "react";
import { User, Pencil, Check, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: editedName.trim() })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Also update user metadata
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Name</label>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1"
                placeholder="Dein Name"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleSave}
                disabled={saving}
                className="text-accent hover:text-accent/80"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{displayName}</span>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">E-Mail</label>
          <div className="flex items-center gap-2 text-foreground">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{user?.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileWidget;

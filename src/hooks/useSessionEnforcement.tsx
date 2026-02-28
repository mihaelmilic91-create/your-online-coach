import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Generates a unique session ID for this browser tab/session.
 * Stored in sessionStorage so it persists across page reloads but not new tabs.
 */
const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem("app_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("app_session_id", sessionId);
  }
  return sessionId;
};

/**
 * Registers the current session as the active one for this user.
 */
export const registerSession = async (userId: string): Promise<void> => {
  const sessionId = getOrCreateSessionId();
  await supabase
    .from("profiles")
    .update({ active_session_id: sessionId })
    .eq("user_id", userId);
};

/**
 * Hook that periodically checks if the current session is still the active one.
 * If another device logs in, this session gets invalidated and the user is signed out.
 */
export const useSessionEnforcement = (userId: string | undefined, enabled = true) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId || !enabled) return;

    const checkSession = async () => {
      const currentSessionId = sessionStorage.getItem("app_session_id");
      if (!currentSessionId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("active_session_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) return;

      // If the active session doesn't match ours, we've been kicked out
      if (data.active_session_id && data.active_session_id !== currentSessionId) {
        // Clean up
        if (intervalRef.current) clearInterval(intervalRef.current);
        sessionStorage.removeItem("app_session_id");

        toast({
          variant: "destructive",
          title: "Sitzung beendet",
          description: "Dein Konto wurde auf einem anderen Gerät angemeldet. Pro Konto ist nur eine aktive Sitzung erlaubt.",
          duration: 8000,
        });

        await supabase.auth.signOut();
        navigate("/login");
      }
    };

    // Check every 30 seconds
    checkSession();
    intervalRef.current = setInterval(checkSession, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, enabled, navigate, toast]);
};

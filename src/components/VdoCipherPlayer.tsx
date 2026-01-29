import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface VdoCipherPlayerProps {
  videoId: string;
  className?: string;
  onEnded?: () => void;
  autoplay?: boolean;
}

declare global {
  interface Window {
    VdoPlayer: {
      getInstance: (container: HTMLElement) => any;
    };
  }
}

const VdoCipherPlayer = ({ videoId, className, onEnded, autoplay = true }: VdoCipherPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoId || !containerRef.current) return;
      
      setLoading(true);
      setError(null);

      try {
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Nicht angemeldet");
        }

        // Fetch OTP from edge function
        const { data, error: fnError } = await supabase.functions.invoke("get-video-otp", {
          body: { videoId },
        });

        if (fnError || data?.error) {
          throw new Error(data?.error || fnError?.message || "OTP konnte nicht abgerufen werden");
        }

        const { otp, playbackInfo } = data;

        // Load VdoCipher script if not already loaded
        if (!document.getElementById("vdocipher-script")) {
          const script = document.createElement("script");
          script.id = "vdocipher-script";
          script.src = "https://player.vdocipher.com/playerAssets/1.6.10/vdo.js";
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        // Clear previous player
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Create iframe for video with autoplay
        const iframe = document.createElement("iframe");
        iframe.id = `vdocipher-${videoId}`;
        // Add autoplay parameter to URL
        const autoplayParam = autoplay ? "&autoplay=true" : "";
        iframe.src = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}${autoplayParam}`;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "0";
        iframe.allow = "encrypted-media; fullscreen; picture-in-picture; autoplay";
        iframe.allowFullscreen = true;
        
        containerRef.current?.appendChild(iframe);
        
        // Listen for video end event via postMessage
        const handleMessage = (event: MessageEvent) => {
          if (event.origin === "https://player.vdocipher.com") {
            if (event.data?.type === "ended" || event.data?.event === "ended") {
              onEnded?.();
            }
          }
        };
        
        window.addEventListener("message", handleMessage);
        
        setLoading(false);
        
        return () => {
          window.removeEventListener("message", handleMessage);
        };
      } catch (err) {
        console.error("Error loading video:", err);
        setError(err instanceof Error ? err.message : "Video konnte nicht geladen werden");
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId, onEnded]);

  if (error) {
    return (
      <div className={cn(
        "bg-muted rounded-lg flex flex-col items-center justify-center gap-4 aspect-video",
        className
      )}>
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive text-center px-4">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video rounded-lg overflow-hidden bg-black", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default VdoCipherPlayer;

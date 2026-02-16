import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TrackingPixels = () => {
  const [pixels, setPixels] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .like("key", "pixel_%");
      
      if (data) {
        const codes = data.map(d => d.value).filter(v => v && v.trim().length > 0);
        setPixels(codes);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    pixels.forEach((code) => {
      if (code.trim()) {
        // Create a temporary container to parse the script
        const container = document.createElement("div");
        container.innerHTML = code;
        
        // Find and execute scripts
        const scripts = container.querySelectorAll("script");
        scripts.forEach((script) => {
          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          // Copy attributes
          Array.from(script.attributes).forEach((attr) => {
            if (attr.name !== "src") {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          document.head.appendChild(newScript);
        });

        // Find and add noscript elements
        const noscripts = container.querySelectorAll("noscript");
        noscripts.forEach((ns) => {
          const newNs = document.createElement("noscript");
          newNs.innerHTML = ns.innerHTML;
          document.head.appendChild(newNs);
        });
      }
    });
  }, [pixels]);

  return null;
};

export default TrackingPixels;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Allowlist of trusted tracking script domains
const ALLOWED_SCRIPT_DOMAINS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googleadservices.com",
  "google.com",
  "facebook.net",
  "facebook.com",
  "meta.com",
  "tiktok.com",
  "analytics.tiktok.com",
  "snap.licdn.com",
  "linkedin.com",
  "doubleclick.net",
  "hotjar.com",
  "clarity.ms",
];

function isAllowedScriptSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_SCRIPT_DOMAINS.some(
      (domain) =>
        url.hostname === domain || url.hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

function isAllowedInlineScript(text: string): boolean {
  // Only allow inline scripts that reference allowed domains
  // Block scripts with suspicious patterns
  const suspicious = [
    /document\.cookie/i,
    /localStorage/i,
    /sessionStorage/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
    /fetch\s*\(\s*['"`](?!https:\/\/(www\.)?(google|facebook|tiktok|analytics))/i,
  ];
  return !suspicious.some((pattern) => pattern.test(text));
}

const TrackingPixels = () => {
  const [pixels, setPixels] = useState<string[]>([]);

  useEffect(() => {
    const fetchPixels = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .like("key", "pixel_%");

      if (data) {
        const codes = data
          .map((d) => d.value)
          .filter((v) => v && v.trim().length > 0);
        setPixels(codes);
      }
    };
    fetchPixels();
  }, []);

  useEffect(() => {
    pixels.forEach((code) => {
      if (code.trim()) {
        const container = document.createElement("div");
        container.innerHTML = code;

        // Find and execute scripts - only from allowed domains
        const scripts = container.querySelectorAll("script");
        scripts.forEach((script) => {
          if (script.src) {
            if (!isAllowedScriptSrc(script.src)) {
              console.warn(
                "Blocked tracking script from non-allowlisted domain:",
                script.src
              );
              return;
            }
          } else if (script.textContent) {
            if (!isAllowedInlineScript(script.textContent)) {
              console.warn(
                "Blocked suspicious inline tracking script"
              );
              return;
            }
          }

          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          Array.from(script.attributes).forEach((attr) => {
            if (attr.name !== "src") {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          document.head.appendChild(newScript);
        });

        // Find and add noscript elements - only allow img tags with allowed domains
        const noscripts = container.querySelectorAll("noscript");
        noscripts.forEach((ns) => {
          const sanitized = document.createElement("div");
          sanitized.innerHTML = ns.innerHTML;
          
          // Only allow img elements from trusted domains
          const imgs = sanitized.querySelectorAll("img");
          if (imgs.length === 0) return;
          
          const newNs = document.createElement("noscript");
          imgs.forEach((img) => {
            if (img.src && isAllowedScriptSrc(img.src)) {
              const safeImg = document.createElement("img");
              safeImg.src = img.src;
              if (img.height) safeImg.height = img.height;
              if (img.width) safeImg.width = img.width;
              if (img.alt) safeImg.alt = img.alt;
              safeImg.style.display = "none";
              newNs.appendChild(safeImg);
            }
          });
          
          if (newNs.childNodes.length > 0) {
            document.head.appendChild(newNs);
          }
        });
      }
    });
  }, [pixels]);

  return null;
};

export default TrackingPixels;

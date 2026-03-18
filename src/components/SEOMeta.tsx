import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
}

const SEOMeta = ({ title, description, canonical }: SEOMetaProps) => {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    if (canonical) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement("link");
        canonicalTag.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute("href", canonical);
    }

    return () => {
      document.title = "Fahrprüfung Kat. B Schweiz vorbereiten | Online Drivecoach";
    };
  }, [title, description, canonical]);

  return null;
};

export default SEOMeta;

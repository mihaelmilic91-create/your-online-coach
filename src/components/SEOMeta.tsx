import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
  schema?: object;
}

const SEOMeta = ({ title, description, canonical, schema }: SEOMetaProps) => {
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

    let schemaTag: HTMLScriptElement | null = null;
    if (schema) {
      schemaTag = document.createElement("script");
      schemaTag.setAttribute("type", "application/ld+json");
      schemaTag.setAttribute("data-dynamic-schema", "true");
      schemaTag.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaTag);
    }

    return () => {
      document.title = "Fahrprüfung Kat. B Schweiz vorbereiten | Online Drivecoach";
      if (schemaTag) schemaTag.remove();
    };
  }, [title, description, canonical, schema]);

  return null;
};

export default SEOMeta;

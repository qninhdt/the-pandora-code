import { type JsonLdObject, validateJsonLd } from "@/lib/seo/structured-data";

interface JsonLdProps {
  data: JsonLdObject | readonly JsonLdObject[];
}

/** Safe server-side JSON-LD script. Escaping `<` prevents content from closing the script tag. */
export function JsonLd({ data }: JsonLdProps) {
  validateJsonLd(data);
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-owned and escaped above.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

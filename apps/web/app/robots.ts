import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pandora.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_design", "/_components", "/*/_design", "/*/_components"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}

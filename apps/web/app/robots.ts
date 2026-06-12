import { getSiteUrl } from "@/lib/seo/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_design", "/_components", "/*/_design", "/*/_components"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

// Resolve the canonical site origin for absolute URLs (sitemap, RSS, OG,
// canonical/hreflang). Set NEXT_PUBLIC_SITE_URL on Vercel; locally it falls
// back to the dev origin. Never returns a trailing slash.
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SITE_URL must be set in production for canonical URLs");
    }
    return "http://localhost:3000";
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be an absolute URL: ${raw}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https");
  }
  if (parsed.search || parsed.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must not contain a query string or hash");
  }
  return raw.replace(/\/+$/, "");
}

// Resolve the canonical site origin for absolute URLs (sitemap, RSS, OG,
// canonical/hreflang). Set NEXT_PUBLIC_SITE_URL on Vercel; locally it falls
// back to the dev origin. Never returns a trailing slash.
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = raw && raw.length > 0 ? raw : "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

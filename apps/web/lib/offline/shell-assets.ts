/**
 * Same-origin imagery a precached shell document needs to look like itself
 * offline: the brand mark in the dock and the chapter/author covers the listing
 * grids paint. Without these the shell shows the browser's broken-image glyph in
 * every card, which reads as a broken page rather than an offline one.
 *
 * This is a narrow allowlist, not "every image in the document". The glossary
 * index alone paints 456 term covers (~64MB) and the listing backdrops are
 * multi-megabyte PNGs — far more than an unattended first visit should
 * download. Backdrops are also purely decorative (a dimmed full-bleed image
 * behind a heavy void scrim), so a page without one still looks deliberate, and
 * the runtime `/images/` handler stores the ones a reader actually visits. App
 * icons are omitted because Serwist already precaches public/icons.
 */
const SHELL_IMAGE_PREFIXES = ["/logo.png", "/author.png", "/images/chapters/"];

/**
 * Collect the shell imagery referenced by a serialized document, as cache keys.
 *
 * Only `src`/`href` values are read, never `srcset`: `next/image` emits one
 * optimizer URL per candidate width, and the worker's optimized-image handler
 * already accepts any stored variant of the same source, so one variant per
 * image is enough. `decode` un-escapes HTML entities in attribute values.
 */
export function collectShellImageUrls(html: string, decode: (value: string) => string): string[] {
  const urls = new Set<string>();
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
    const value = decode(match[1]);
    if (!value.startsWith("/") || value.startsWith("//")) continue;
    let parsed: URL;
    try {
      parsed = new URL(value, "https://placeholder.invalid");
    } catch {
      continue;
    }
    if (parsed.hash || parsed.pathname.includes("..")) continue;
    // Optimizer requests are keyed by the optimizer URL, so the query stays on
    // the key, but the allowlist is matched against the source file it points at.
    const optimized = parsed.pathname === "/_next/image";
    const source = optimized ? parsed.searchParams.get("url") : parsed.pathname;
    if (!source?.startsWith("/") || source.startsWith("//") || source.includes("..")) continue;
    if (!optimized && parsed.search) continue;
    if (!SHELL_IMAGE_PREFIXES.some((prefix) => source.startsWith(prefix))) continue;
    urls.add(`${parsed.pathname}${optimized ? parsed.search : ""}`);
  }
  return [...urls];
}

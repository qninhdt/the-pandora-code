/**
 * Resolve a public static asset against the optional R2 media origin.
 *
 * Keeping this helper idempotent matters because server-side manifest builders
 * and client-side image components can both see the same URL during a build.
 * Empty `NEXT_PUBLIC_STATIC_BASE` deliberately preserves the existing
 * same-origin `/public` development setup.
 */
function isR2S3Endpoint(value: string): boolean {
  try {
    return new URL(value).hostname.endsWith(".r2.cloudflarestorage.com");
  } catch {
    return false;
  }
}

export function staticUrl(path: string): string {
  const value = path.trim();
  if (!value) return value;

  // Do not rewrite absolute URLs, protocol-relative URLs, data URLs, or any
  // other already-resolved resource. This also makes repeated calls safe.
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return value;

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  const base = (process.env.NEXT_PUBLIC_STATIC_BASE ?? "").trim().replace(/\/+$/, "");
  if (isR2S3Endpoint(base)) {
    throw new Error(
      "NEXT_PUBLIC_STATIC_BASE must be a public R2 r2.dev or custom-domain origin, not the authenticated S3 API endpoint",
    );
  }
  if (!base || normalizedPath === base || normalizedPath.startsWith(`${base}/`)) {
    return normalizedPath;
  }
  return `${base}${normalizedPath}`;
}

import { createSerwistRoute } from "@serwist/turbopack";

const serwistRoute = createSerwistRoute({
  swSrc: "app/sw.ts",
  globDirectory: "public",
  globPatterns: ["offline.html", "icons/**/*.{png,svg}", "offline/index.json"],
  globIgnores: ["images/**", "search/**", "**/*.map"],
  // `globDirectory` is the public root, so Serwist emits relative paths by
  // default. The worker is served from `/serwist/sw.js`; normalize those
  // entries to site-root URLs or precaching will request `/serwist/<asset>`
  // and remain stuck in the installing state.
  modifyURLPrefix: { "": "/" },
  maximumFileSizeToCacheInBytes: 512 * 1024,
  useNativeEsbuild: true,
});

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;
export const generateStaticParams = serwistRoute.generateStaticParams;

export async function GET(request: Request, context: { params: Promise<{ path: string }> }) {
  const response = await serwistRoute.GET(request, context);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Service-Worker-Allowed", "/");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'",
  );
  return response;
}

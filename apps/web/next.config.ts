import path from "node:path";
import { withSerwist } from "@serwist/turbopack";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withMDX = createMDX();

function staticMediaPattern(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const raw = process.env.NEXT_PUBLIC_STATIC_BASE?.trim();
  if (!raw) return [];

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];
    const pathname = url.pathname.replace(/\/+$/, "");
    return [
      {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: pathname ? `${pathname}/**` : "/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": [
      "./public/**/*",
      "public/**/*",
      "../../public/**/*",
      "../../research/**/*",
      "../../i18n/**/*",
      "../../docs/**/*",
      "../../.agent/**/*",
      "../../scripts/**/*",
      "../../tests/**/*",
    ],
  },
  turbopack: {
    root: path.resolve(process.cwd(), "../../"),
  },
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [68, 75, 78],
    remotePatterns: staticMediaPattern(),
  },
  typedRoutes: false,
  // r3f/three ship untranspiled ESM; transpile so Next can bundle them.
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  async headers() {
    return [
      {
        source: "/:locale/chapters/:slug",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default withSerwist(withMDX(withNextIntl(nextConfig)));

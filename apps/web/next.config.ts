import path from "path";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withMDX = createMDX();

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
  },
  typedRoutes: false,
  // r3f/three ship untranspiled ESM; transpile so Next can bundle them.
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default withMDX(withNextIntl(nextConfig));

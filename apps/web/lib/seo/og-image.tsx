import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { designTokens } from "@/lib/design-tokens";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Satori (next/og) renders NO text unless at least one font is supplied. Load
// Be Vietnam Pro (the book's display face, full Vietnamese diacritic coverage)
// from disk once per module. These routes are SSG, so this runs at build time
// under Node where fs is available.
const fontsDir = path.join(process.cwd(), "lib", "seo", "fonts");
const FONTS = [
  {
    name: "Be Vietnam Pro",
    data: fs.readFileSync(path.join(fontsDir, "BeVietnamPro-Regular.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Be Vietnam Pro",
    data: fs.readFileSync(path.join(fontsDir, "BeVietnamPro-SemiBold.ttf")),
    weight: 600 as const,
    style: "normal" as const,
  },
];

interface OgInput {
  kicker: string;
  title: string;
  accent?: string;
}

// Shared 1200×630 social card: dark atmosphere gradient, a small uppercase
// kicker (part / category), and the page title. Gradient-only so it renders
// reliably in the OG runtime without reading image files from disk.
export function renderOgImage({ kicker, title, accent = designTokens.biolum.cyan }: OgInput) {
  const { depth, text } = designTokens;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: `radial-gradient(circle at 18% 12%, ${accent}22, transparent 45%), linear-gradient(135deg, ${depth.void}, ${depth.surface})`,
        color: text.foreground,
        fontFamily: "Be Vietnam Pro",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 60 ? 64 : 80,
          fontWeight: 600,
          lineHeight: 1.05,
          maxWidth: "1000px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 30, color: text.muted, letterSpacing: 1 }}>
        The Pandora Code
      </div>
    </div>,
    { ...OG_SIZE, fonts: FONTS },
  );
}

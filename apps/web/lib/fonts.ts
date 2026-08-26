import { Be_Vietnam_Pro, IBM_Plex_Mono, Inter, Spectral } from "next/font/google";

// Display face - headings, hero titles, the book's visual identity. Built for
// Vietnamese (the default locale) with heavy weights for display impact.
export const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Long-form body - a screen-tuned serif for 5–7k-word chapters. Spectral has
// full Vietnamese diacritic coverage and reads comfortably at body sizes.
export const spectral = Spectral({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// UI sans - chrome, labels, badges, captions. Inter for crisp small text with
// full Vietnamese coverage.
export const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Monospace reading option. IBM Plex Mono has Vietnamese coverage, which the
// usual monospace choices (JetBrains Mono, Roboto Mono) lack for `ơ`/`ư`.
export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const fontVariables = `${beVietnamPro.variable} ${spectral.variable} ${inter.variable} ${ibmPlexMono.variable}`;

// JS-side mirror of the CSS @theme tokens in app/globals.css. Use this when
// JS consumers (charts, r3f scenes, canvas figures) need the same values as the
// stylesheet. Canonical palette = content/art-direction/style-bible.md.

export const designTokens = {
  depth: {
    void: "#070912",
    abyss: "#0a0e1a",
    background: "#090d18",
    surface: "#0e1320",
    surfaceRaised: "#141b2e",
    surfaceOverlay: "#1b2438",
  },
  text: {
    foreground: "#e9edf6",
    muted: "#9aa4bd",
    subtle: "#6c7690",
  },
  line: {
    border: "#1d2740",
    borderStrong: "#2c3858",
  },
  biolum: {
    cyan: "#36c5d9",
    teal: "#2bd4a8",
    magenta: "#ff5da8",
    amber: "#ffb454",
  },
  classification: {
    canon: "#36c5d9",
    inference: "#ffb454",
    speculation: "#ff7bc0",
    real_science: "#2bd4a8",
  },
  motion: {
    durationFast: "140ms",
    durationBase: "260ms",
    durationSlow: "520ms",
    easeOutQuart: "cubic-bezier(0.22, 1, 0.36, 1)",
    easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  spacing: {
    readingColumnCh: 72,
  },
} as const;

export type DesignTokens = typeof designTokens;

// Classification tier → display label + hue token name. Shared by CanonBadge,
// ConfidenceMeter, and the design preview.
export const classificationMeta = {
  canon: { token: "canon", labelEn: "Canon", labelVi: "Chính truyện" },
  inference: { token: "inference", labelEn: "Inference", labelVi: "Suy luận" },
  speculation: { token: "speculation", labelEn: "Speculation", labelVi: "Suy đoán" },
  real_science: { token: "real-science", labelEn: "Real science", labelVi: "Khoa học thật" },
} as const;

export type ClassificationKey = keyof typeof classificationMeta;

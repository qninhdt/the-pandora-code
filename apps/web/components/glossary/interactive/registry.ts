export const GLOSSARY_VISUALIZATION_IDS = [
  "alpha-centauri",
  "habitable-zone",
  "exomoon",
  "tidal-heating",
  "roche-limit",
  "radial-velocity",
  "direct-imaging",
  "transit-timing-variation",
  "hox-genes",
  "niche-partitioning",
  "countercurrent-exchange",
  "bioluminescence",
  "cladogram",
  "allometry",
  "lotka-volterra-equations",
  "chirality",
  "umwelt",
  "occams-razor",
] as const;

export type GlossaryVisualizationId = (typeof GLOSSARY_VISUALIZATION_IDS)[number];

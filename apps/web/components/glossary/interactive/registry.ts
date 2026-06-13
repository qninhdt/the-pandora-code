export const GLOSSARY_VISUALIZATION_IDS = ["alpha-centauri", "habitable-zone", "exomoon"] as const;

export type GlossaryVisualizationId = (typeof GLOSSARY_VISUALIZATION_IDS)[number];

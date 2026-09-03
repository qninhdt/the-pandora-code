// Trunk construction behind ArborescenceHabitSorter.
//
// "Tree" names a growth habit, not a lineage. Earth evolved the arborescent form
// independently in lycopsids, cladoxylopsids, progymnosperms, horsetails,
// monocots and eudicots, and the resulting trunks are built on incompatible
// engineering. A Carboniferous Lepidodendron carried 40 m of stem on a thick
// sub-epidermal periderm with under a tenth of its diameter in wood; a palm has
// no bifacial cambium at all and thickens by a primary meristem, scattering
// closed vascular bundles through ground tissue; a redwood lays down concentric
// secondary xylem year on year. Same silhouette, three unrelated solutions.
//
// So a Pandoran flora sorted by height and outline collapses into one pile that
// means nothing phylogenetically. Sorted by what holds the stem up, it separates
// — and each Pandoran construction lands beside the Earth lineage that solved it
// the same way. That pairing is convergence, not kinship.
//
// woodShare is the fraction of trunk diameter that is load-bearing secondary
// xylem. It is the single number that splits the constructions apart, and it is
// why the sorter's two modes disagree.

export type Construction = "anastomosing" | "tensile" | "pneumatic";

export type SortMode = "silhouette" | "construction";

export interface TrunkSpec {
  key: string;
  world: "pandora" | "earth";
  construction: Construction;
  /** Mature height in metres. */
  height: number;
  /** Share of trunk diameter that is load-bearing secondary xylem, 0-1. */
  woodShare: number;
  /** Whether growth stops at a determinate adult size. */
  determinate: boolean;
  tone: "cyan" | "teal" | "amber";
}

// Three Pandoran giants, each paired with the Earth lineage that reached tree
// stature by the same mechanism. Heights for the Pandoran taxa are the canon
// figures; the Earth values are measured.
export const TRUNKS: TrunkSpec[] = [
  {
    key: "kelutral",
    world: "pandora",
    construction: "anastomosing",
    height: 300,
    woodShare: 0.22,
    determinate: false,
    tone: "cyan",
  },
  {
    key: "banyan",
    world: "earth",
    construction: "anastomosing",
    height: 30,
    woodShare: 0.28,
    determinate: false,
    tone: "cyan",
  },
  {
    key: "saltarus",
    world: "pandora",
    construction: "tensile",
    height: 150,
    woodShare: 0.05,
    determinate: true,
    tone: "teal",
  },
  {
    key: "lepidodendron",
    world: "earth",
    construction: "tensile",
    height: 40,
    woodShare: 0.08,
    determinate: true,
    tone: "teal",
  },
  {
    key: "obesus",
    world: "pandora",
    construction: "pneumatic",
    height: 15,
    woodShare: 0.04,
    determinate: true,
    tone: "amber",
  },
  {
    key: "cactus",
    world: "earth",
    construction: "pneumatic",
    height: 12,
    woodShare: 0.06,
    determinate: true,
    tone: "amber",
  },
];

export const CONSTRUCTIONS: Construction[] = ["anastomosing", "tensile", "pneumatic"];

/**
 * Geometry for the two-row bench. Each disc carries two stacked caption lines
 * beneath it, so the row pitch and the total height are derived from the disc
 * radius and those caption offsets. Deriving them keeps the second row's
 * captions inside the viewBox: the SVG clips its overflow, so a hand-tuned
 * height silently swallows the bottom labels.
 */
export const TRUNK_LAYOUT = {
  width: 340,
  radius: 26,
  columns: 3,
  /** Gap above the first row of discs. */
  top: 6,
  /** Baseline offsets of the two caption lines, measured down from the disc edge. */
  captionOffsets: [11, 20] as const,
  /** Headroom below the last caption baseline for glyph descenders. */
  descent: 6,
} as const;

const LAST_CAPTION = TRUNK_LAYOUT.captionOffsets[TRUNK_LAYOUT.captionOffsets.length - 1];

/** Vertical distance between the centres of row one and row two. */
export const TRUNK_ROW_PITCH = 2 * TRUNK_LAYOUT.radius + LAST_CAPTION + TRUNK_LAYOUT.descent;

/** viewBox height that fits both rows of discs and all of their captions. */
export const TRUNK_VIEW_HEIGHT =
  TRUNK_LAYOUT.top +
  TRUNK_LAYOUT.radius +
  TRUNK_ROW_PITCH +
  TRUNK_LAYOUT.radius +
  LAST_CAPTION +
  TRUNK_LAYOUT.descent;

/** Centre y of the disc at bench position `index`, filling row by row. */
export function trunkRowCenterY(index: number): number {
  const row = Math.floor(index / TRUNK_LAYOUT.columns);
  return TRUNK_LAYOUT.top + TRUNK_LAYOUT.radius + row * TRUNK_ROW_PITCH;
}

/** Lowest y any ink reaches for a disc at `index`, captions and descenders included. */
export function trunkRowBottom(index: number): number {
  return trunkRowCenterY(index) + TRUNK_LAYOUT.radius + LAST_CAPTION + TRUNK_LAYOUT.descent;
}

/**
 * Order the bench for a sorting rule. By silhouette the trunks queue up tallest
 * first and the constructions interleave; by construction they cluster, and each
 * cluster holds one Pandoran and one Earth stem.
 */
export function sortedTrunks(mode: SortMode): TrunkSpec[] {
  if (mode === "silhouette") return [...TRUNKS].sort((a, b) => b.height - a.height);
  return CONSTRUCTIONS.flatMap((c) =>
    TRUNKS.filter((t) => t.construction === c).sort((a, b) => b.height - a.height),
  );
}

export interface SortVerdict {
  /** How many piles the rule produces. */
  groups: number;
  /** Whether every pile contains stems built the same way. */
  coherent: boolean;
  /** Spread of wood share inside the largest pile — the tell that a pile is mixed. */
  woodSpread: number;
}

export function verdictFor(mode: SortMode): SortVerdict {
  if (mode === "silhouette") {
    const shares = TRUNKS.map((t) => t.woodShare);
    return {
      groups: 1,
      coherent: false,
      woodSpread: Math.max(...shares) - Math.min(...shares),
    };
  }
  const spreads = CONSTRUCTIONS.map((c) => {
    const shares = TRUNKS.filter((t) => t.construction === c).map((t) => t.woodShare);
    return Math.max(...shares) - Math.min(...shares);
  });
  return { groups: CONSTRUCTIONS.length, coherent: true, woodSpread: Math.max(...spreads) };
}

export interface Disc {
  cx: number;
  cy: number;
  r: number;
}

/**
 * Ring positions for a cross-section drawing. `anastomosing` is a hollow crown
 * of fused prop-stems, `tensile` a slender core inside a thick fibrous sheath,
 * `pneumatic` a soft stem holding gas cavities.
 */
export function crossSectionRings(construction: Construction, r: number): Disc[] {
  if (construction === "anastomosing") {
    const count = 11;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return { cx: Math.cos(a) * r * 0.62, cy: Math.sin(a) * r * 0.62, r: r * 0.24 };
    });
  }
  if (construction === "pneumatic") {
    const count = 3;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      return { cx: Math.cos(a) * r * 0.38, cy: Math.sin(a) * r * 0.38, r: r * 0.34 };
    });
  }
  // tensile: discrete fibre bundles set in the outer third of the stem
  const count = 14;
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return { cx: Math.cos(a) * r * 0.76, cy: Math.sin(a) * r * 0.76, r: r * 0.1 };
  });
}

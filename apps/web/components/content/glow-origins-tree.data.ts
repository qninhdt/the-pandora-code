// Each independent origin of bioluminescence runs on a DIFFERENT luciferin and
// a different enzyme — the proof that the trait was invented separately, not
// inherited from one glowing ancestor. The per-lineage tint reinforces that
// each light is its own thing.

export interface Lineage {
  key: string;
  /** vertical slot 0..1 used to lay out the tip on the tree */
  slot: number;
  /** CSS colour for this lineage's glow */
  tone: string;
}

export const LINEAGES: Lineage[] = [
  {
    key: "bacteria",
    slot: 0,
    tone: "var(--cyan)",
  },
  {
    key: "dino",
    slot: 1,
    tone: "var(--teal)",
  },
  {
    key: "fungi",
    slot: 2,
    tone: "var(--amber)",
  },
  {
    key: "cnidaria",
    slot: 3,
    tone: "var(--accent-soft)",
  },
  {
    key: "firefly",
    slot: 4,
    tone: "var(--magenta)",
  },
];

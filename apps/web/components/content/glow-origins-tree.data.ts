// Each independent origin of bioluminescence runs on a DIFFERENT luciferin and
// a different enzyme — the proof that the trait was invented separately, not
// inherited from one glowing ancestor. The per-lineage tint reinforces that
// each light is its own thing.

export interface Lineage {
  key: string;
  /** vertical slot 0..1 used to lay out the tip on the tree */
  slot: number;
  nameVi: string;
  nameEn: string;
  fuelVi: string;
  fuelEn: string;
  enzymeVi: string;
  enzymeEn: string;
  /** CSS colour for this lineage's glow */
  tone: string;
}

export const LINEAGES: Lineage[] = [
  {
    key: "bacteria",
    slot: 0,
    nameVi: "Vi khuẩn",
    nameEn: "Bacteria",
    fuelVi: "Flavin khử (FMNH₂)",
    fuelEn: "Reduced flavin (FMNH₂)",
    enzymeVi: "Luciferase vi khuẩn",
    enzymeEn: "Bacterial luciferase",
    tone: "var(--cyan)",
  },
  {
    key: "dino",
    slot: 1,
    nameVi: "Tảo giáp",
    nameEn: "Dinoflagellates",
    fuelVi: "Tetrapyrrole mạch hở",
    fuelEn: "Open-chain tetrapyrrole",
    enzymeVi: "Luciferase tảo giáp",
    enzymeEn: "Dinoflagellate luciferase",
    tone: "var(--teal)",
  },
  {
    key: "fungi",
    slot: 2,
    nameVi: "Nấm",
    nameEn: "Fungi",
    fuelVi: "3-hydroxyhispidin",
    fuelEn: "3-hydroxyhispidin",
    enzymeVi: "Luz (nấm)",
    enzymeEn: "Luz (fungal)",
    tone: "var(--amber)",
  },
  {
    key: "cnidaria",
    slot: 3,
    nameVi: "Sứa & họ hàng",
    nameEn: "Cnidarians",
    fuelVi: "Coelenterazine",
    fuelEn: "Coelenterazine",
    enzymeVi: "Aequorin / luciferase",
    enzymeEn: "Aequorin / luciferase",
    tone: "var(--accent-soft)",
  },
  {
    key: "firefly",
    slot: 4,
    nameVi: "Đom đóm",
    nameEn: "Fireflies",
    fuelVi: "D-luciferin",
    fuelEn: "D-luciferin",
    enzymeVi: "Luciferase đom đóm",
    enzymeEn: "Firefly luciferase",
    tone: "var(--magenta)",
  },
];

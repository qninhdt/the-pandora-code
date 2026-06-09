// Fixed scene data behind UmweltLens. The whole argument is that none of this
// geometry moves between lenses — only the per-lens visibility/intensity table
// changes, and with it the entire world. The scene is one patch of Pandoran night
// forest: layered canopy + understorey silhouettes, a forest floor, bioluminescent
// flora, two figures, a footstep cascade, and the magnetic field threading it all.

export type Lens = "human" | "navi" | "magnetic" | "biolum";

export const SCENE_W = 360;
export const SCENE_H = 240;
export const GROUND_Y = 188;

// Per-feature visibility in each lens, 0..1. This table IS the thesis.
export interface Vis {
  human: number;
  navi: number;
  magnetic: number;
  biolum: number;
}

// A tree: a tapering trunk plus a canopy crown blob. Depth is faked with scale +
// a back/front flag so the scene reads as layered rather than flat.
export interface Tree {
  x: number;
  trunkW: number;
  trunkTop: number; // y of the crown base
  crownR: number;
  back: boolean; // back layer sits dimmer + smaller
  vis: Vis;
}

export const TREES: Tree[] = [
  {
    x: 60,
    trunkW: 16,
    trunkTop: 96,
    crownR: 34,
    back: true,
    vis: { human: 0.22, navi: 0.7, magnetic: 0.16, biolum: 0.22 },
  },
  {
    x: 300,
    trunkW: 14,
    trunkTop: 104,
    crownR: 30,
    back: true,
    vis: { human: 0.2, navi: 0.66, magnetic: 0.16, biolum: 0.2 },
  },
  {
    x: 40,
    trunkW: 26,
    trunkTop: 70,
    crownR: 46,
    back: false,
    vis: { human: 0.34, navi: 0.9, magnetic: 0.22, biolum: 0.3 },
  },
  {
    x: 168,
    trunkW: 34,
    trunkTop: 54,
    crownR: 54,
    back: false,
    vis: { human: 0.4, navi: 0.95, magnetic: 0.24, biolum: 0.34 },
  },
  {
    x: 322,
    trunkW: 22,
    trunkTop: 78,
    crownR: 38,
    back: false,
    vis: { human: 0.3, navi: 0.85, magnetic: 0.2, biolum: 0.26 },
  },
];

// Understorey fronds — low arcs near the floor, structural texture.
export const FRONDS: { x: number; y: number; w: number; h: number; vis: Vis }[] = [
  { x: 96, y: 184, w: 54, h: 26, vis: { human: 0.2, navi: 0.7, magnetic: 0.12, biolum: 0.5 } },
  { x: 210, y: 186, w: 64, h: 30, vis: { human: 0.22, navi: 0.72, magnetic: 0.12, biolum: 0.55 } },
  { x: 280, y: 184, w: 48, h: 24, vis: { human: 0.18, navi: 0.66, magnetic: 0.1, biolum: 0.48 } },
];

// Bioluminescent flora/ground points — faint to a human eye, dominant in the
// biolum channel, lifted in Na'vi night vision.
export const GLOW_POINTS: { x: number; y: number; r: number; vis: Vis }[] = [
  { x: 78, y: 198, r: 5, vis: { human: 0.12, navi: 0.6, magnetic: 0.05, biolum: 1 } },
  { x: 120, y: 212, r: 7, vis: { human: 0.14, navi: 0.65, magnetic: 0.05, biolum: 1 } },
  { x: 204, y: 204, r: 6, vis: { human: 0.1, navi: 0.6, magnetic: 0.05, biolum: 0.95 } },
  { x: 252, y: 216, r: 8, vis: { human: 0.16, navi: 0.7, magnetic: 0.05, biolum: 1 } },
  { x: 300, y: 200, r: 5, vis: { human: 0.1, navi: 0.55, magnetic: 0.05, biolum: 0.9 } },
  { x: 150, y: 150, r: 4, vis: { human: 0.1, navi: 0.5, magnetic: 0.04, biolum: 0.85 } },
  { x: 96, y: 122, r: 3, vis: { human: 0.08, navi: 0.45, magnetic: 0.04, biolum: 0.8 } },
  { x: 246, y: 132, r: 3, vis: { human: 0.08, navi: 0.45, magnetic: 0.04, biolum: 0.78 } },
];

// The footstep — origin of the reactive cascade rings, loudest in the biolum lens.
export const FOOTSTEP = { x: 150, y: 220 };

// The two figures, both always physically present; the lens decides which one's
// perspective is foregrounded (its salience lifts in its own lens).
export const FIGURES = {
  navi: { x: 120, y: 168, r: 10 },
  human: { x: 232, y: 172, r: 9 },
};

// Ambient backdrop brightness per lens — human world near-black, Na'vi night-eye
// floods the frame, the others stay dark so their channel reads.
export const AMBIENT: Record<Lens, number> = {
  human: 0.04,
  navi: 0.18,
  magnetic: 0.06,
  biolum: 0.05,
};

export const LENS_TONE: Record<Lens, "cyan" | "teal" | "magenta" | "amber"> = {
  human: "amber",
  navi: "teal",
  magnetic: "magenta",
  biolum: "cyan",
};

// Magnetic field-line contours twisting through the scene; only drawn in the
// magnetic lens. Returned as path strings keyed off a vertical base.
export function fieldPath(k: number): string {
  const y = 48 + k * 32;
  return `M -10 ${y} C 90 ${y - 24}, 180 ${y + 28}, 250 ${y - 16} S 380 ${y + 20}, 380 ${y + 4}`;
}

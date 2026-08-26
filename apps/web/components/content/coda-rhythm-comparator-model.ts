// ─────────────────────────────────────────────────────────────────────
// THE MODEL — the message is in the timing, not in the sound
//
// Sperm-whale codas are stereotyped rhythms of broadband clicks. Every
// click is essentially the same acoustic event; what separates one vocal
// clan from another is only where the clicks fall in time. Clans that use
// the same water and share maternal lineages never associate across that
// rhythmic boundary, so a difference no wider than a pause carries a
// social border.
//
// Each row is a documented coda signature: evenly spaced clicks for the
// Regular clan, two isolated clicks then a rapid triplet for +1+1+3, a
// condensed short burst for the Short clan. Offsets are the rhythm in
// units of one cycle — relative timing, because the literature names the
// pattern rather than millisecond onsets.
//
// The tulkun row is deliberately different in kind: canon states low
// rumbles, whistles and clicks, and translates them as dialogue, but never
// exposes a structure to draw. It is an unresolved band so the reader can
// see where analysis stops and assertion begins.
// ─────────────────────────────────────────────────────────────────────

export type Voice = "regular" | "plusOneOneThree" | "short" | "tulkun";

export interface VoiceRow {
  id: Voice;
  /** Click onsets as fractions of one cycle. Empty = no drawable structure. */
  onsets: number[];
  tone: string;
}

export const VOICE_ROWS: VoiceRow[] = [
  { id: "regular", onsets: [0.08, 0.22, 0.36, 0.5, 0.64, 0.78], tone: "var(--cyan)" },
  { id: "plusOneOneThree", onsets: [0.08, 0.3, 0.56, 0.63, 0.7], tone: "var(--teal)" },
  { id: "short", onsets: [0.08, 0.16, 0.24, 0.32], tone: "var(--amber)" },
  { id: "tulkun", onsets: [], tone: "var(--magenta)" },
];

/** Figure geometry, shared between the track rows and the playhead. */
export const TRACK = {
  width: 320,
  height: 190,
  x: 62,
  rowHeight: 40,
  rowTop: 30,
} as const;

export const TRACK_SPAN = TRACK.width - TRACK.x - 14;

export const rowY = (index: number): number => TRACK.rowTop + index * TRACK.rowHeight;
export const onsetX = (fraction: number): number => TRACK.x + fraction * TRACK_SPAN;

/**
 * Smallest gap between consecutive clicks, as a fraction of the cycle. The
 * condensed clan is defined by how tight this gets; a row with no drawable
 * structure has no answer, which is the point of returning null.
 */
export function tightestGap(row: VoiceRow): number | null {
  if (row.onsets.length < 2) return null;
  let min = Number.POSITIVE_INFINITY;
  for (let i = 1; i < row.onsets.length; i += 1) {
    min = Math.min(min, row.onsets[i] - row.onsets[i - 1]);
  }
  return min;
}

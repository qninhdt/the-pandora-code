// The physics behind WarningSignalRace, split out so the figure file stays lean.
// A warning is only a warning if it arrives first, and the arrival time is set
// entirely by the channel's measured propagation speed. Fungal figures are the
// generous end of the published ranges, so the underground alarm is judged at its
// best. The nerve entry is there because it is the comparison canon invites, and
// it is the one that shows how far off the "synapse" analogy is.

/** Propagation speeds in metres per second. */
export const CHANNELS = {
  streaming: { speed: 40e-6, tone: "var(--teal)" }, // cytoplasmic streaming, 5-40 um/s
  spike: { speed: 0.7e-2 / 60, tone: "var(--cyan)" }, // fungal electrical spikes, ~0.7 cm/min
  nerve: { speed: 100, tone: "var(--magenta)" }, // a fast myelinated axon
} as const;

export type ChannelKey = keyof typeof CHANNELS;

// The distance slider works in log10 metres so a leaf's width and a forest gap
// both fit on one control.
export const DIST_MIN_EXP = -2; // 1 cm
export const DIST_MAX_EXP = 2; // 100 m
export const DIST_DEFAULT_EXP = 0; // 1 m — the spacing the pot experiment used

export function formatDistance(m: number): string {
  if (m < 0.01) return `${(m * 1000).toFixed(0)} mm`;
  if (m < 1) return `${(m * 100).toFixed(1)} cm`;
  return `${m.toFixed(m < 10 ? 1 : 0)} m`;
}

// Seconds rendered in the largest unit that still reads as a human duration.
export function formatDuration(
  seconds: number,
  unit: (key: string, vals: Record<string, string>) => string,
): string {
  if (seconds < 0.01) return unit("instant", {});
  if (seconds < 60) return unit("seconds", { n: seconds.toFixed(seconds < 10 ? 2 : 0) });
  if (seconds < 3600) return unit("minutes", { n: (seconds / 60).toFixed(1) });
  if (seconds < 86400) return unit("hours", { n: (seconds / 3600).toFixed(1) });
  if (seconds < 31557600) return unit("days", { n: (seconds / 86400).toFixed(1) });
  return unit("years", { n: (seconds / 31557600).toFixed(1) });
}

// The gas math behind RespiratoryScrubberDial, kept separate so the component
// stays lean and the physiology is testable. A human breathing Pandoran air
// faces a REVERSED carbon-dioxide gradient (ambient CO2 ~20% vs ~0 on Earth) and
// hydrogen sulfide that jams the mitochondrial oxygen enzyme. Fick's law says
// diffusion flows from high to low partial pressure, so high ambient CO2 drives
// CO2 INTO the blood, dropping pH toward fatal acidosis. A mycelial catalytic
// filter lining the airway consumes incoming CO2 and neutralizes sulfide before
// they reach the blood. This model maps the two ambient dials + filter on/off to
// a blood pH and a plain survival verdict. Deterministic; no randomness.

export interface BreathState {
  /** Arterial blood pH after equilibration. */
  ph: number;
  /** 0..1 fraction of mitochondrial oxygen-processing still working. */
  mitoFunction: number;
  /** Coarse survival verdict key for i18n. */
  verdict: "safe" | "distress" | "fatal";
}

// Healthy arterial pH ~7.4; below ~6.8 is not survivable. We model pH as a
// baseline pushed down by whatever fraction of ambient CO2 actually reaches the
// blood. The filter removes most of it.
export function breathModel(
  co2Pct: number, // 0..25 ambient CO2 percent
  h2sPpm: number, // 0..400 ambient hydrogen sulfide, ppm
  filter: boolean,
): BreathState {
  // Filter passes only a small fraction of each toxin through to the blood.
  const co2Passthrough = filter ? 0.08 : 1;
  const h2sPassthrough = filter ? 0.05 : 1;

  const effectiveCo2 = co2Pct * co2Passthrough;
  const effectiveH2s = h2sPpm * h2sPassthrough;

  // Each percent of CO2 that reaches the blood past Earth-normal (~0.04%) drags
  // pH down. Rough but monotonic: ~0.03 pH units per effective percent.
  const ph = Math.max(6.4, 7.42 - effectiveCo2 * 0.031);

  // Sulfide poisons cytochrome c oxidase; ~200 ppm reaching tissue is crippling.
  const mitoFunction = Math.max(0, 1 - effectiveH2s / 200);

  let verdict: BreathState["verdict"];
  if (ph >= 7.25 && mitoFunction >= 0.85) verdict = "safe";
  else if (ph >= 6.9 && mitoFunction >= 0.4) verdict = "distress";
  else verdict = "fatal";

  return { ph, mitoFunction, verdict };
}

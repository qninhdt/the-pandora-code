"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface DetectionMethodScopeProps {
  caption?: string;
  className?: string;
}

type Method = "rv" | "transit" | "imaging";

const VIEW_W = 460;
const VIEW_H = 230;
const CX = 150; // scene centre x (star)
const CY = 96; // scene centre y
const ORBIT_RX = 70;
const ORBIT_RY = 26;

// An interactive, tabbed explainer for the three ways astronomers detect a
// world they cannot resolve by eye. A single orbital phase drives every view —
// the star's wobble, the transit dip, the imaged dot — so the methods read as
// three windows onto the same orbiting planet. SVG-only and deterministic for
// SSR; the optional animation is gated on reduced-motion.
export function DetectionMethodScope({ caption, className }: DetectionMethodScopeProps) {
  const reduced = useReducedMotionSafe();
  const t = useTranslations("viz.detectionScope");
  const uid = useId();
  const [method, setMethod] = useState<Method>("rv");
  const [playing, setPlaying] = useState(false);
  // ~5.5s per orbit; deterministic 0.18 start so the SSR frame shows the planet.
  const { phase, setPhase } = usePhaseLoop({ period: 5.5, playing, initial: 0.18 });

  const desc =
    method === "rv" ? t("descRv") : method === "transit" ? t("descTransit") : t("descImaging");

  const ang = phase * Math.PI * 2;
  // Planet position on a tilted ellipse around the star.
  const px = CX + ORBIT_RX * Math.cos(ang);
  const py = CY + ORBIT_RY * Math.sin(ang);
  const inFront = Math.sin(ang) > 0; // near the viewer → can transit
  // Transit happens when the planet is between us and the star (front, centred).
  const transitDepth =
    inFront && Math.abs(Math.cos(ang)) < 0.32 ? 1 - Math.abs(Math.cos(ang)) / 0.32 : 0;
  const starShiftX = 10 * Math.cos(ang); // RV wobble, exaggerated
  const rvTone = starShiftX < 0 ? "var(--cyan)" : "var(--magenta)";
  const starColor = method === "rv" ? rvTone : "var(--amber)";

  const controls = !reduced ? (
    <button
      type="button"
      onClick={() => setPlaying((p) => !p)}
      aria-label={playing ? t("pause") : t("play")}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-colors hover:bg-void/70"
    >
      {playing ? <Pause size={16} /> : <Play size={16} />}
    </button>
  ) : undefined;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      controls={controls}
      tone="cyan"
      className={className}
    >
      <SegmentedToggle
        options={[
          { value: "rv", label: t("rv") },
          { value: "transit", label: t("transit"), tone: "var(--amber)" },
          { value: "imaging", label: t("imaging"), tone: "var(--teal)" },
        ]}
        value={method}
        onChange={setMethod}
        ariaLabel={t("tablist")}
        className="mb-3 w-full"
      />

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={method === "rv" ? t("rv") : method === "transit" ? t("transit") : t("imaging")}
      >
        <GlowDefs idBase={uid} />

        {/* radial wash behind the star, the focal glow of the scene */}
        <circle
          cx={method === "rv" ? CX + starShiftX : CX}
          cy={CY}
          r={56}
          fill={glowUrl(
            uid,
            method === "rv" ? (starShiftX < 0 ? "wash-cyan" : "wash-magenta") : "wash-amber",
          )}
        />

        {/* orbit guide */}
        <ellipse
          cx={CX}
          cy={CY}
          rx={ORBIT_RX}
          ry={ORBIT_RY}
          fill="none"
          style={{ stroke: "var(--border)" }}
          strokeWidth={1}
          strokeDasharray="3 4"
        />

        {/* planet behind the star is drawn first */}
        {!inFront && (
          <circle
            cx={px}
            cy={py}
            r={5}
            style={{ fill: "var(--muted)" }}
            filter={glowUrl(uid, "soft-shadow")}
          />
        )}

        {/* the star (wobbles in the RV view) */}
        <circle
          cx={method === "rv" ? CX + starShiftX : CX}
          cy={CY}
          r={18}
          style={{
            fill: starColor,
            transition: reduced ? undefined : "fill 0.2s",
          }}
          filter={glowUrl(uid, "bloom-strong")}
          opacity={method === "transit" && transitDepth > 0 ? 0.92 : 1}
        />

        {/* coronagraph mask for the imaging view */}
        {method === "imaging" && (
          <circle
            cx={CX}
            cy={CY}
            r={22}
            style={{ fill: "var(--void)", stroke: "var(--border-strong)" }}
            strokeWidth={1.5}
          />
        )}

        {/* planet in front of the star */}
        {inFront && (
          <circle
            cx={px}
            cy={py}
            r={method === "transit" ? 6 : 5}
            style={{
              fill: method === "imaging" ? "var(--teal)" : "var(--surface-overlay)",
              stroke: method === "imaging" ? "var(--teal)" : "var(--border-strong)",
            }}
            filter={method === "imaging" ? glowUrl(uid, "bloom") : glowUrl(uid, "soft-shadow")}
            strokeWidth={1}
          />
        )}

        {/* RV shift label */}
        {method === "rv" && (
          <VizText x={CX} y={CY + 46} size="small" tone={rvTone} anchor="middle">
            {starShiftX < 0 ? t("blueShift") : t("redShift")}
          </VizText>
        )}

        {/* readout panel on the right: a small graph that fits the method */}
        <g transform={`translate(${260} ${36})`}>
          <VizText x={0} y={-10} size="small">
            {t("starlight")}
          </VizText>
          <rect
            x={0}
            y={0}
            width={170}
            height={120}
            rx={8}
            fill="var(--void)"
            style={{ stroke: "var(--border)" }}
            strokeWidth={1}
          />
          {method === "rv" && <RvCurve uid={uid} phase={phase} />}
          {method === "transit" && <TransitCurve uid={uid} phase={phase} />}
          {method === "imaging" && (
            <ImagingPanel uid={uid} planetLabel={t("planet")} maskLabel={t("maskedStar")} />
          )}
        </g>
      </svg>

      {/* description */}
      <p className="mt-2 font-serif text-sm leading-relaxed text-muted">{desc}</p>

      {/* scrub control */}
      {!reduced && (
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={0.999}
            step={0.001}
            value={phase}
            onChange={(e) => {
              setPlaying(false);
              setPhase(Number(e.target.value));
            }}
            aria-label={t("orbitalPhase")}
            className="viz-range w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            style={{
              background: `linear-gradient(to right, var(--cyan) ${phase * 100}%, var(--border) ${phase * 100}%)`,
              ["--viz-thumb" as string]: "var(--cyan)",
            }}
          />
        </div>
      )}
    </VizFigure>
  );
}

// A sine wave with a marker at the current phase — the radial-velocity curve.
function RvCurve({ uid, phase }: { uid: string; phase: number }) {
  const W = 170;
  const H = 120;
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * W;
    const y = H / 2 - Math.cos((i / 40) * Math.PI * 2) * 34;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mx = phase * W;
  const my = H / 2 - Math.cos(phase * Math.PI * 2) * 34;
  return (
    <>
      <line
        x1={0}
        y1={H / 2}
        x2={W}
        y2={H / 2}
        style={{ stroke: "var(--border)" }}
        strokeWidth={1}
      />
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: "var(--cyan)" }}
        filter={glowUrl(uid, "bloom")}
        strokeWidth={2}
      />
      <circle
        cx={mx}
        cy={my}
        r={4}
        style={{ fill: "var(--magenta)" }}
        filter={glowUrl(uid, "bloom")}
      />
    </>
  );
}

// A flat line with a periodic dip — the transit light curve.
function TransitCurve({ uid, phase }: { uid: string; phase: number }) {
  const W = 170;
  const base = 36;
  const pts = Array.from({ length: 61 }, (_, i) => {
    const p = i / 60;
    const x = p * W;
    // dip centred at phase 0.25 (front-centre crossing)
    const dip = Math.max(0, 1 - Math.abs(((p - 0.25 + 1) % 1) / 0.08)) * 28;
    const y = base + dip;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mx = phase * W;
  const dipNow = Math.max(0, 1 - Math.abs(((phase - 0.25 + 1) % 1) / 0.08)) * 28;
  return (
    <>
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: "var(--amber)" }}
        filter={glowUrl(uid, "bloom")}
        strokeWidth={2}
      />
      <circle
        cx={mx}
        cy={base + dipNow}
        r={4}
        style={{ fill: "var(--teal)" }}
        filter={glowUrl(uid, "bloom")}
      />
    </>
  );
}

// A static "before / after starlight removed" pair for direct imaging.
function ImagingPanel({
  uid,
  planetLabel,
  maskLabel,
}: {
  uid: string;
  planetLabel: string;
  maskLabel: string;
}) {
  return (
    <>
      <circle
        cx={55}
        cy={64}
        r={14}
        style={{ fill: "var(--void)", stroke: "var(--border-strong)" }}
        strokeWidth={1.5}
      />
      <circle
        cx={92}
        cy={52}
        r={4}
        style={{ fill: "var(--teal)" }}
        filter={glowUrl(uid, "bloom")}
      />
      <VizText x={92} y={38} size="small" tone="teal" anchor="middle">
        {planetLabel}
      </VizText>
      <VizText x={55} y={94} size="small" anchor="middle">
        {maskLabel}
      </VizText>
    </>
  );
}

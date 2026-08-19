"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Competition that manufactures difference. Two similar species sharing one
// resource axis — say beak size — overlap, and the individuals least like
// their competitor eat best and breed most. So exactly where the ranges meet,
// selection shoves the two distributions apart. Push them into overlap and
// watch the peaks repel: coexistence does not merely permit difference, it
// actively carves it. The glowing points under each curve are individuals;
// they drift and forage, but their spread always tracks the population mean.
const SIGMA = 8;
const gauss = (x: number, mu: number, s: number) =>
  Math.exp(-((x - mu) ** 2) / (2 * s * s));

// fixed pseudo-random population samples so dots feel organic but never reflow
const POP_A = [-1.6, -0.9, -0.4, 0.1, 0.6, 1.1, 1.7, -1.2, 0.3, -0.1].map(
  (dx, i) => ({ dx, frac: 0.2 + ((i * 37) % 70) / 100, phase: i * 1.3 }),
);
const POP_B = [-1.7, -1.0, -0.3, 0.2, 0.7, 1.2, 1.6, -1.3, 0.4, -0.2].map(
  (dx, i) => ({ dx, frac: 0.2 + ((i * 53) % 70) / 100, phase: i * 0.9 + 2 }),
);

export default function CharacterDisplacement() {
  const t = useTranslations("viz.character-displacement");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [sep, setSep] = useState(0.5); // imposed separation of the two means, 0..1

  const meanA = useRef(34);
  const meanB = useRef(66);
  const clock = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt, elapsed) => {
      clock.current = elapsed;
      const overlapTarget = Math.max(0, 1 - sep * 1.6);
      const displacement = overlapTarget * 14;
      const targetA = 34 - displacement;
      const targetB = 66 + displacement;
      // ease the realised means toward the selection-driven target — the
      // divergence looks like an active push, not an instant snap
      meanA.current += (targetA - meanA.current) * Math.min(1, dt * 3.2);
      meanB.current += (targetB - meanB.current) * Math.min(1, dt * 3.2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const mA = meanA.current;
  const mB = meanB.current;
  const overlap = Math.max(0, Math.min(1, 1 - (mB - mA - 22) / 18));
  const competing = overlap > 0.1;
  const pulse = 0.5 + 0.5 * Math.sin(clock.current * 2.4);

  const pathFor = (mu: number) => {
    let d = "";
    for (let x = 8; x <= 92; x += 2) {
      const y = 74 - gauss(x, mu, SIGMA) * 42;
      d += `${x === 8 ? "M" : "L"}${x} ${y.toFixed(1)}`;
    }
    return d;
  };
  const areaFor = (mu: number) => `${pathFor(mu)} L92 74 L8 74 Z`;

  const dotAt = (mu: number, o: { dx: number; frac: number; phase: number }) => {
    const x = mu + o.dx * SIGMA;
    const peakY = 74 - gauss(x, mu, SIGMA) * 42;
    const bob = Math.sin(clock.current * 1.6 + o.phase) * 1.4;
    const y = 74 - (74 - peakY) * o.frac + bob;
    return { x, y };
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSep(0.5)}
      allowFullscreen={false}
      caption={
        competing ? (
          <span className="text-magenta">{t("repelling")}</span>
        ) : (
          <span className="text-teal">{t("separate")}</span>
        )
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="chd-bg" cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#101a30" />
              <stop offset="100%" stopColor="#070912" />
            </radialGradient>
            <linearGradient id="chd-fill-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chd-fill-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="chd-overlap" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--magenta)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--magenta)" stopOpacity="0" />
            </radialGradient>
            <filter id="chd-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.1" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#chd-bg)" />
          {/* faint resource-axis grid */}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={i}
              x1={8 + i * 10.5}
              y1="20"
              x2={8 + i * 10.5}
              y2="74"
              stroke="var(--border-strong)"
              strokeWidth="0.25"
              opacity="0.25"
            />
          ))}
          <line x1="8" y1="74" x2="92" y2="74" stroke="var(--border-strong)" strokeWidth="0.5" />
          <text
            x="50"
            y="82"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("resourceAxis")}
          </text>

          {/* overlap glow zone, breathing while the two ranges collide */}
          {competing && (
            <ellipse
              cx={(mA + mB) / 2}
              cy="52"
              rx={14 + overlap * 6}
              ry={20}
              fill="url(#chd-overlap)"
              opacity={overlap * (0.55 + pulse * 0.25)}
            />
          )}

          <path d={areaFor(mA)} fill="url(#chd-fill-a)" />
          <path d={areaFor(mB)} fill="url(#chd-fill-b)" />
          <path d={pathFor(mA)} fill="none" stroke="var(--teal)" strokeWidth="1.1" filter="url(#chd-glow)" />
          <path d={pathFor(mB)} fill="none" stroke="var(--cyan)" strokeWidth="1.1" filter="url(#chd-glow)" />

          {/* foraging individuals drifting under each curve */}
          {POP_A.map((o, i) => {
            const p = dotAt(mA, o);
            return <circle key={`a${i}`} cx={p.x} cy={p.y} r="1" fill="var(--teal)" opacity="0.85" />;
          })}
          {POP_B.map((o, i) => {
            const p = dotAt(mB, o);
            return <circle key={`b${i}`} cx={p.x} cy={p.y} r="1" fill="var(--cyan)" opacity="0.85" />;
          })}

          <circle cx={mA} cy={32} r="1.8" fill="var(--teal)" filter="url(#chd-glow)" />
          <text x={mA} y="28" textAnchor="middle" style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--teal)" }}>
            {t("speciesA")}
          </text>
          <circle cx={mB} cy={32} r="1.8" fill="var(--cyan)" filter="url(#chd-glow)" />
          <text x={mB} y="28" textAnchor="middle" style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--cyan)" }}>
            {t("speciesB")}
          </text>

          {/* repulsion arrows — nudge outward, brighten with the overlap pulse */}
          {competing && (
            <g filter="url(#chd-glow)" opacity={0.5 + pulse * 0.5}>
              <path
                d={`M${mA + 6 + pulse} 60 L${mA} 60 M${mA + 2} 58.6 L${mA} 60 L${mA + 2} 61.4`}
                stroke="var(--magenta)"
                strokeWidth="0.7"
                fill="none"
              />
              <path
                d={`M${mB - 6 - pulse} 60 L${mB} 60 M${mB - 2} 58.6 L${mB} 60 L${mB - 2} 61.4`}
                stroke="var(--magenta)"
                strokeWidth="0.7"
                fill="none"
              />
            </g>
          )}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("overlapLabel")}
            value={`${Math.round(overlap * 100)}%`}
            accent={competing ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("imposedSeparation")}
            value={sep}
            min={0}
            max={1}
            step={0.01}
            onChange={setSep}
            display={competing ? t("overlapping") : t("distinct")}
            thumb={competing ? "magenta" : "teal"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Bodies are addressed, not hand-assembled. Homeosis is one part built in the
// likeness of another that belongs elsewhere — the classic Antennapedia fly, a
// leg growing where an antenna should be. It happens when the positional label a
// Hox gene stamps on a region is misplaced, so the cells there dutifully build a
// different address's structure. Flip the switch and watch the antenna morph limb-
// by-limb into a leg: proof that a single misdirected address rewrites a whole part.
export default function Homeosis() {
  const t = useTranslations("viz.homeosis");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [homeotic, setHomeotic] = useState(false);
  const morph = useRef(0); // 0 = antenna, 1 = leg
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      const target = homeotic ? 1 : 0;
      morph.current += (target - morph.current) * Math.min(1, dt * 2.4);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const m = morph.current;
  // antenna: thin, segmented, feathery. leg: jointed, thicker, clawed.
  const headX = 50;
  const headY = 64;

  // the appendage grows from the head; its joints straighten and thicken with morph
  const joints = [0, 1, 2, 3].map((i) => {
    const t0 = i / 3;
    // antenna curls; leg is angular
    const antAngle = -1.3 + t0 * 0.5;
    const legAngle = -1.5 + (i % 2 === 0 ? 0.7 : -0.4);
    const angle = antAngle * (1 - m) + legAngle * m;
    return { t0, angle, width: 0.8 * (1 - m) + 2.2 * m };
  });

  // build the appendage polyline
  let px = headX;
  let py = headY - 8;
  const segs: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  for (const j of joints) {
    const len = 8;
    const nx = px + Math.sin(j.angle) * len;
    const ny = py - Math.cos(j.angle) * len;
    segs.push({ x1: px, y1: py, x2: nx, y2: ny, w: j.width });
    px = nx;
    py = ny;
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setHomeotic(false)}
      allowFullscreen={false}
      caption={
        homeotic ? (
          <span className="text-amber">{t("antennapedia")}</span>
        ) : (
          <span className="text-teal">{t("wildType")}</span>
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
          {/* fly head */}
          <circle
            cx={headX}
            cy={headY}
            r="12"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          {/* compound eyes */}
          <circle cx={headX - 6} cy={headY - 2} r="3.5" fill="var(--cyan)" opacity="0.6" />
          <circle cx={headX + 6} cy={headY - 2} r="3.5" fill="var(--cyan)" opacity="0.6" />

          {/* the morphing appendage (mirrored for both sides) */}
          {[1, -1].map((side) => (
            <g
              key={side}
              transform={`translate(${headX} 0) scale(${side} 1) translate(${-headX} 0)`}
            >
              {segs.map((s, i) => (
                <line
                  key={i}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={m > 0.5 ? "var(--amber)" : "var(--teal)"}
                  strokeWidth={s.w}
                  strokeLinecap="round"
                  opacity="0.85"
                />
              ))}
              {/* claw at the tip when leg-like */}
              {m > 0.4 && (
                <circle
                  cx={segs[3].x2}
                  cy={segs[3].y2}
                  r={1 + m}
                  fill="var(--amber)"
                  opacity={m * 0.7}
                />
              )}
              {/* feathery antenna hairs when antenna-like */}
              {m < 0.6 &&
                segs.map((s, i) => (
                  <line
                    key={i}
                    x1={(s.x1 + s.x2) / 2}
                    y1={(s.y1 + s.y2) / 2}
                    x2={(s.x1 + s.x2) / 2 - 3 * (1 - m)}
                    y2={(s.y1 + s.y2) / 2 - 1}
                    stroke="var(--teal)"
                    strokeWidth="0.3"
                    opacity={(1 - m) * 0.5}
                  />
                ))}
            </g>
          ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("appendage")}
            value={m > 0.5 ? t("leg") : t("antenna")}
            accent={m > 0.5 ? "amber" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setHomeotic((h) => !h)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md transition-colors"
            style={{
              borderColor: homeotic ? "var(--amber)" : "var(--teal)",
              color: homeotic ? "var(--amber)" : "var(--teal)",
              background: homeotic
                ? "color-mix(in oklab, var(--amber) 12%, transparent)"
                : "color-mix(in oklab, var(--teal) 12%, transparent)",
            }}
          >
            {homeotic ? t("revertNormal") : t("induceHomeosis")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}

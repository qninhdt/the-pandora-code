"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Robustness that redundancy can't buy. Degeneracy is when structurally different
// parts happen to do the same job — kidneys, sweat glands and lungs all shed
// waste. Disable one route and flow finds another unlike it; the output holds.
// Only when enough distinct paths are cut does the function finally fail. Because
// the substitutes were never dedicated backups, just different parts with an
// overlapping talent, the system survives blows it was never designed for.
// Three parallel pathways, each a different structure, all reaching the output.
const PATHS = [
  { key: "renal", mid: { x: 50, y: 28 } },
  { key: "glandular", mid: { x: 50, y: 50 } },
  { key: "respiratory", mid: { x: 50, y: 72 } },
];

export default function DegeneracyBiology() {
  const t = useTranslations("viz.degeneracy-biology");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [alive, setAlive] = useState<boolean[]>([true, true, true]);
  const pulse = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      pulse.current = (pulse.current + dt * 0.6) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const liveCount = alive.filter(Boolean).length;
  const functioning = liveCount > 0;
  const IN = { x: 14, y: 50 };
  const OUT = { x: 86, y: 50 };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAlive([true, true, true])}
      allowFullscreen={false}
      caption={
        functioning ? (
          <span className="text-teal">{t("outputHolds", { n: liveCount })}</span>
        ) : (
          <span className="text-magenta">{t("outputFails")}</span>
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
          {/* input & output nodes */}
          <circle cx={IN.x} cy={IN.y} r="4" fill="var(--foreground)" />
          <text
            x={IN.x}
            y={IN.y - 6}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("input")}
          </text>
          <circle
            cx={OUT.x}
            cy={OUT.y}
            r="4"
            fill={functioning ? "var(--teal)" : "var(--magenta)"}
            opacity={functioning ? 0.9 : 0.5}
          />
          <text
            x={OUT.x}
            y={OUT.y - 6}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("output")}
          </text>

          {/* the three degenerate paths */}
          {PATHS.map((p, i) => {
            const on = alive[i];
            const d = `M${IN.x} ${IN.y} Q ${p.mid.x} ${p.mid.y} ${OUT.x} ${OUT.y}`;
            return (
              <g key={p.key}>
                <path
                  d={d}
                  fill="none"
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth={on ? 1 : 0.5}
                  opacity={on ? 0.7 : 0.3}
                  strokeDasharray={on ? undefined : "2 2"}
                />
                {/* travelling pulse on live paths */}
                {on && functioning && (
                  <circle
                    cx={IN.x + (OUT.x - IN.x) * pulse.current}
                    cy={(() => {
                      const tt = pulse.current;
                      // quadratic bezier y at parameter tt
                      return (1 - tt) ** 2 * IN.y + 2 * (1 - tt) * tt * p.mid.y + tt ** 2 * OUT.y;
                    })()}
                    r="1.6"
                    fill="var(--cyan)"
                  />
                )}
                {/* the pathway node — click to disable */}
                <circle
                  cx={p.mid.x}
                  cy={p.mid.y}
                  r="4.5"
                  fill={on ? "var(--surface)" : "var(--void)"}
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.6"
                  opacity={on ? 0.9 : 0.4}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(p.key)}
                  aria-pressed={!on}
                  onClick={() => setAlive((a) => a.map((v, j) => (j === i ? !v : v)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAlive((a) => a.map((v, j) => (j === i ? !v : v)));
                    }
                  }}
                />
                <text
                  x={p.mid.x}
                  y={p.mid.y + 1}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.4,
                    fontFamily: "monospace",
                    fill: on ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {t(p.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("liveRoutes")}
            value={`${liveCount}/3`}
            accent={functioning ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
          {t("tapToDisable")}
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The planet's heat-redistribution machine, seen as a limb (quarter-globe) with
// three stacked circulation wheels per hemisphere: Hadley, Ferrel, Polar. Warm
// air rises at the hot equator, sinks at ~30°, and the cells chain poleward.
// Turn up the equator-to-pole temperature gradient and the whole conveyor
// spins faster — more contrast, more urgent overturning.
const CELLS = [
  { name: "hadley", lat0: 0, lat1: 30, dir: 1 },
  { name: "ferrel", lat0: 30, lat1: 60, dir: -1 },
  { name: "polar", lat0: 60, lat1: 90, dir: 1 },
] as const;

// map latitude (0..90) to a point on the quarter-arc, radius r
function latPoint(lat: number, r: number): [number, number] {
  const a = (lat / 90) * (Math.PI / 2); // 0 at equator → π/2 at pole
  return [8 + Math.sin(a) * r, 92 - Math.cos(a) * r];
}

export default function AtmosphericGeneralCirculation() {
  const t = useTranslations("viz.atmospheric-general-circulation");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [gradient, setGradient] = useState(1.0); // eq-pole contrast multiplier
  const phase = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      phase.current = (phase.current + dt * gradient * 0.6) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const R_IN = 52;
  const R_OUT = 78;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      allowFullscreen={false}
      caption={
        <span>
          {t("gradient")}: <span className="text-amber">{(gradient * 40).toFixed(0)}°C</span>{" "}
          {t("eqToPole")}
        </span>
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
            <radialGradient id="agc-glow" cx="8%" cy="92%" r="90%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.25 * gradient} />
              <stop offset="45%" stopColor="var(--teal)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.12" />
            </radialGradient>
          </defs>

          {/* the planet limb (quarter disk) */}
          <path d={`M8 92 A ${R_IN} ${R_IN} 0 0 1 ${8 + R_IN} 92 Z`} fill="url(#agc-glow)" />
          <path
            d={`M8 92 A ${R_IN} ${R_IN} 0 0 1 ${8 + R_IN} 92`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          {/* atmosphere shell */}
          <path
            d={`M8 92 A ${R_OUT} ${R_OUT} 0 0 1 ${8 + R_OUT} 92`}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.4"
            opacity="0.3"
          />

          {/* equator (hot) + pole markers */}
          <circle cx={8 + R_IN} cy="92" r="2" fill="var(--amber)" />
          <circle cx="8" cy={92 - R_IN} r="2" fill="var(--cyan)" />

          {/* the three cells, each a rolling loop of particles */}
          {CELLS.map((cell) => {
            const rMid = (R_IN + R_OUT) / 2;
            return (
              <g key={cell.name}>
                {Array.from({ length: 7 }, (_, i) => {
                  const local = (((i / 7 + phase.current * cell.dir) % 1) + 1) % 1;
                  const lat = cell.lat0 + (cell.lat1 - cell.lat0) * local;
                  // oscillate radius to trace the overturning (rise/sink)
                  const rr = R_IN + (R_OUT - R_IN) * (0.5 + 0.42 * Math.sin(local * Math.PI * 2));
                  const [x, y] = latPoint(lat, rr);
                  const rising = Math.cos(local * Math.PI * 2) > 0;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="1.2"
                      fill={rising ? "var(--amber)" : "var(--cyan)"}
                      opacity="0.75"
                    />
                  );
                })}
                {/* cell boundary tick */}
                {(() => {
                  const [bx, by] = latPoint(cell.lat1, R_IN);
                  const [ox, oy] = latPoint(cell.lat1, R_OUT);
                  void rMid;
                  return (
                    <line
                      x1={bx}
                      y1={by}
                      x2={ox}
                      y2={oy}
                      stroke="var(--border-strong)"
                      strokeWidth="0.3"
                      opacity="0.4"
                      strokeDasharray="1 1"
                    />
                  );
                })()}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Legend
            vertical
            items={[
              { color: "var(--amber)", label: t("rising") },
              { color: "var(--cyan)", label: t("sinking") },
            ]}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("tempGradient")}
            value={gradient}
            min={0.2}
            max={2}
            step={0.05}
            onChange={setGradient}
            display={`${(gradient * 40).toFixed(0)}°C`}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

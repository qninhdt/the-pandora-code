"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

// Five coupled spheres — atmosphere, biosphere, hydrosphere, cryosphere,
// lithosphere — laid out in a ring, with feedback arrows between them. Click any
// arrow (edge) to read how one sphere acts on another. This is Gaia grown up:
// not a goddess, just measurable loops linking rock, water, air, ice, and life
// into one coupled system.
const SPHERES = [
  { key: "atmosphere", color: "var(--cyan)" },
  { key: "biosphere", color: "var(--teal)" },
  { key: "hydrosphere", color: "#4a90d9" },
  { key: "cryosphere", color: "#c8e8f8" },
  { key: "lithosphere", color: "var(--amber)" },
] as const;

// each directed edge carries an i18n key describing the coupling
const EDGES: { from: number; to: number; key: string }[] = [
  { from: 0, to: 1, key: "e_atmBio" }, // air feeds photosynthesis
  { from: 1, to: 0, key: "e_bioAtm" }, // life makes oxygen
  { from: 0, to: 3, key: "e_atmCryo" }, // warming melts ice
  { from: 3, to: 0, key: "e_cryoAtm" }, // ice albedo cools air
  { from: 2, to: 0, key: "e_hydAtm" }, // ocean stores/moves heat
  { from: 4, to: 0, key: "e_lithAtm" }, // volcanoes exhale CO2
  { from: 0, to: 4, key: "e_atmLith" }, // acid rain weathers rock
  { from: 2, to: 1, key: "e_hydBio" }, // water sustains life
];

function spherePos(i: number): [number, number] {
  const a = -Math.PI / 2 + (i / SPHERES.length) * Math.PI * 2;
  return [50 + Math.cos(a) * 32, 46 + Math.sin(a) * 32];
}

export default function EarthSystemScience() {
  const t = useTranslations("viz.earth-system-science");
  const [active, setActive] = useState<number | null>(null);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setActive(null)}
      allowFullscreen={false}
      caption={
        active !== null ? (
          <span className="text-teal">{t(EDGES[active].key)}</span>
        ) : (
          <span className="text-muted">{t("tapArrow")}</span>
        )
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <marker
              id="ess-arrow"
              markerWidth="5"
              markerHeight="5"
              refX="4"
              refY="2.5"
              orient="auto"
            >
              <path d="M0 0 L5 2.5 L0 5 Z" fill="var(--teal)" />
            </marker>
            <marker
              id="ess-arrow-dim"
              markerWidth="5"
              markerHeight="5"
              refX="4"
              refY="2.5"
              orient="auto"
            >
              <path d="M0 0 L5 2.5 L0 5 Z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {/* feedback edges (curved so opposing pairs don't overlap) */}
          {EDGES.map((e, i) => {
            const [x1, y1] = spherePos(e.from);
            const [x2, y2] = spherePos(e.to);
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            // bow the curve toward centre-perpendicular for separation
            const dx = x2 - x1;
            const dy = y2 - y1;
            const nx = -dy;
            const ny = dx;
            const len = Math.hypot(nx, ny) || 1;
            const bow = 8;
            const cx = mx + (nx / len) * bow;
            const cy = my + (ny / len) * bow;
            const isActive = active === i;
            // shorten endpoints so arrow sits at node edge
            const t1 = 0.16;
            const sx = x1 + (cx - x1) * t1;
            const sy = y1 + (cy - y1) * t1;
            const ex = x2 + (cx - x2) * t1;
            const ey = y2 + (cy - y2) * t1;
            return (
              <path
                key={i}
                d={`M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`}
                fill="none"
                stroke={isActive ? "var(--teal)" : "var(--border-strong)"}
                strokeWidth={isActive ? 1.2 : 0.5}
                opacity={isActive ? 1 : active === null ? 0.5 : 0.2}
                markerEnd={isActive ? "url(#ess-arrow)" : "url(#ess-arrow-dim)"}
                className="cursor-pointer"
                onClick={() => setActive(isActive ? null : i)}
              />
            );
          })}

          {/* spheres */}
          {SPHERES.map((s, i) => {
            const [x, y] = spherePos(i);
            const touched = active !== null && (EDGES[active].from === i || EDGES[active].to === i);
            return (
              <g key={s.key}>
                <circle
                  cx={x}
                  cy={y}
                  r={touched ? 9 : 8}
                  fill="var(--void)"
                  stroke={s.color}
                  strokeWidth={touched ? 1.4 : 0.8}
                  opacity={touched || active === null ? 1 : 0.4}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3.4"
                  fill={s.color}
                  opacity={touched || active === null ? 0.7 : 0.3}
                />
                <text
                  x={x}
                  y={y + 14}
                  textAnchor="middle"
                  style={{
                    fontSize: 3,
                    fontFamily: "monospace",
                    fill: touched ? s.color : "var(--muted)",
                  }}
                >
                  {t(s.key)}
                </text>
              </g>
            );
          })}

          {/* centre label */}
          <text
            x="50"
            y="47"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("oneSystem")}
          </text>
        </svg>
      </div>
    </GlossaryFrame>
  );
}

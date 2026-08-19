"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The lab disc, scaled to a planet. Pandora's floating mountains are a
// superconducting unobtanium core sewn into the Flux Vortex — the overlapping
// fields of the moon and the gas giant it orbits, doing what a neodymium rail
// does under a YBCO puck. Drag the mountain and the pinned flux threads stretch
// and pull it home; let go and it settles, because the pinned core (pulling up)
// and the heavy non-magnetic ballast rock (pulling down) act as two opposed
// springs into a passive, powerless, self-correcting equilibrium. Not resting on
// a cushion it could slide off — threaded onto a gas giant's field and held.
export default function HallelujahMountains() {
  const t = useTranslations("viz.hallelujah-mountains");
  const { ref, inView } = useInView<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  // displacement from the pinned rest position
  const [disp, setDisp] = useState({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  // true once the mountain has come to rest — lets the loop idle instead of
  // re-rendering every frame at equilibrium. Cleared on release of a drag.
  const settled = useRef(true);

  useRafLoop(
    () => {
      if (dragging.current || settled.current) return; // onMove drives display while dragging; idle at rest
      // spring back to rest — two opposed springs → stable equilibrium
      const dt = 1 / 60;
      const k = 34;
      const damp = 6;
      pos.current.x += vel.current.x * dt;
      pos.current.y += vel.current.y * dt;
      vel.current.x += (-k * pos.current.x - damp * vel.current.x) * dt;
      vel.current.y += (-k * pos.current.y - damp * vel.current.y) * dt;
      if (
        Math.abs(pos.current.x) < 0.02 &&
        Math.abs(pos.current.y) < 0.02 &&
        Math.hypot(vel.current.x, vel.current.y) < 0.05
      ) {
        pos.current.x = 0;
        pos.current.y = 0;
        vel.current.x = 0;
        vel.current.y = 0;
        settled.current = true;
      }
      setDisp({ x: pos.current.x, y: pos.current.y });
    },
    { active: inView },
  );

  const restX = 50;
  const restY = 42;
  const mx = restX + disp.x;
  const my = restY + disp.y;
  const displaced = Math.hypot(disp.x, disp.y);

  const onMove = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const rx = ((clientX - rect.left) / rect.width) * 100 - restX;
    const ry = ((clientY - rect.top) / rect.height) * 100 - restY;
    // pinning resists — allow only limited travel, then it fights back
    const clamp = (v: number) => Math.max(-14, Math.min(14, v));
    pos.current = { x: clamp(rx), y: clamp(ry) };
    vel.current = { x: 0, y: 0 };
    settled.current = false; // a drag displaces it — the spring must run on release
    setDisp({ ...pos.current });
  };

  // flux threads from the vortex sources (top) to the core
  const sources = [30, 42, 58, 70];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        pos.current = { x: 0, y: 0 };
        vel.current = { x: 0, y: 0 };
        settled.current = true;
        setDisp({ x: 0, y: 0 });
      }}
      allowFullscreen={false}
      caption={
        displaced > 0.5 ? (
          <span className="text-cyan">{t("pinnedPullsBack")}</span>
        ) : (
          <span className="text-teal">{t("stableEquilibrium")}</span>
        )
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full touch-none"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            onMove(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => dragging.current && onMove(e.clientX, e.clientY)}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        >
          {/* sky + mist bands */}
          <rect x="0" y="0" width="100" height="100" fill="#070c16" />
          {Array.from({ length: 4 }, (_, i) => (
            <rect
              key={i}
              x="0"
              y={58 + i * 10}
              width="100"
              height="6"
              fill="#0d1626"
              opacity="0.5"
            />
          ))}

          {/* Flux Vortex: structured swirl of field at the top */}
          {Array.from({ length: 3 }, (_, ringi) => (
            <ellipse
              key={ringi}
              cx="50"
              cy="12"
              rx={16 + ringi * 9}
              ry={5 + ringi * 2.5}
              fill="none"
              stroke="var(--magenta)"
              strokeWidth="0.4"
              opacity={0.3 - ringi * 0.06}
            />
          ))}

          {/* flux threads to the core, stretching as the mountain is displaced */}
          {sources.map((sx, i) => {
            const coreX = mx - 8 + (i / (sources.length - 1)) * 16;
            const coreY = my - 2;
            const tension = Math.min(1, displaced / 10);
            return (
              <line
                key={i}
                x1={sx}
                y1="12"
                x2={coreX}
                y2={coreY}
                stroke="var(--cyan)"
                strokeWidth={0.5 + tension * 0.7}
                opacity={0.35 + tension * 0.45}
              />
            );
          })}

          {/* the floating mountain — inverted-teardrop rock silhouette */}
          <g transform={`translate(${mx} ${my})`}>
            {/* glowing unobtanium core */}
            <ellipse cx="0" cy="-1" rx="11" ry="5" fill="var(--cyan)" opacity="0.16" />
            <path
              d="M-13 -3 Q -14 3 -9 6 Q -6 12 -2 15 Q 0 19 2 15 Q 7 11 10 6 Q 14 2 12 -3 Q 6 -7 0 -6 Q -7 -7 -13 -3 Z"
              fill="#1a2436"
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />
            {/* exposed core glow */}
            <ellipse cx="-1" cy="0" rx="6" ry="2.6" fill="var(--cyan)" opacity="0.5" />
            {/* canopy speckle on top */}
            {Array.from({ length: 7 }, (_, i) => (
              <circle
                key={i}
                cx={-11 + i * 3.4}
                cy={-5 + (i % 2) * 1.5}
                r="1"
                fill="var(--teal)"
                opacity="0.55"
              />
            ))}
            {/* hanging ballast keel */}
            <path d="M-3 14 L-1.5 22 L1.5 22 L3 14 Z" fill="#141c2c" opacity="0.9" />
          </g>

          {/* rest-position marker */}
          <circle cx={restX} cy={restY} r="1" fill="var(--foreground)" opacity="0.3" />
          {displaced > 0.5 && (
            <line
              x1={restX}
              y1={restY}
              x2={mx}
              y2={my}
              stroke="var(--foreground)"
              strokeWidth="0.3"
              strokeDasharray="1 1.5"
              opacity="0.3"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("displacement")}
            value={`${Math.round((displaced / 14) * 100)}%`}
            accent={displaced > 0.5 ? "cyan" : "teal"}
          />
          <Readout label={t("lock")} value={t("pinned")} accent="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}

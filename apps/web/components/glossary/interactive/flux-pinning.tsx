"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Why the hover becomes a lock. In a Type-II superconductor the field pierces the
// bulk as quantized flux threads — and a free thread drifts, dissipates, and
// spoils the superconductivity. So the material puts them to work: every lattice
// defect (a missing atom, a void, a grain boundary) is a spot where
// superconductivity was already weak, and a flux thread's normal core drops into
// it like a key into a lock and stays. Drag the disc and the pinned threads
// stretch against their anchors and haul it back. More defects, more pins, more
// grip — the same trick unobtanium's void-riddled quasicrystal plays on a planet.
export default function FluxPinning() {
  const t = useTranslations("viz.flux-pinning");
  const [defects, setDefects] = useState(0.6); // 0..1 defect density
  const [drag, setDrag] = useState(0); // -1..1 horizontal displacement from rest
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // number of pinned threads scales with defect density
  const nThreads = 3 + Math.round(defects * 6);
  // pin strength (restoring) grows with defect count
  const grip = defects;
  // displacement resisted: the more grip, the less the disc actually moves
  const shown = drag * (1 - grip * 0.55);

  const restX = 50;
  const discX = restX + shown * 22;
  const discY = 44;
  const trackY = 78;

  // anchor points on the magnet track (fixed) that threads pin to
  const anchors = Array.from({ length: nThreads }, (_, i) => {
    const t0 = nThreads > 1 ? i / (nThreads - 1) : 0.5;
    return 26 + t0 * 48;
  });

  const onMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const rel = ((clientX - rect.left) / rect.width) * 100;
    setDrag(Math.max(-1, Math.min(1, (rel - restX) / 22)));
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setDefects(0.6);
        setDrag(0);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("grip")}: <span className="text-teal">{Math.round(grip * 100)}%</span> ·{" "}
          {t("dragHint")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full touch-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            onMove(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && onMove(e.clientX)}
          onPointerUp={() => {
            dragging.current = false;
            setDrag(0); // snaps back to the pinned rest position
          }}
          onPointerCancel={() => {
            dragging.current = false;
            setDrag(0);
          }}
        >
          {/* magnet track */}
          <rect
            x="20"
            y={trackY}
            width="60"
            height="8"
            rx="1.5"
            fill="var(--magenta)"
            opacity="0.7"
          />
          <rect
            x="20"
            y={trackY}
            width="60"
            height="3"
            rx="1.5"
            fill="var(--magenta)"
            opacity="0.4"
          />

          {/* rest-position guide */}
          <line
            x1={restX}
            y1={discY - 10}
            x2={restX}
            y2={trackY}
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
            opacity="0.4"
          />

          {/* flux threads: from track anchors up into the disc, stretching under drag */}
          {anchors.map((ax, i) => {
            // where this thread enters the disc (moves with the disc)
            const topX = discX - 14 + (anchors.length > 1 ? (i / (anchors.length - 1)) * 28 : 14);
            return (
              <g key={i}>
                <line
                  x1={ax}
                  y1={trackY}
                  x2={topX}
                  y2={discY + 6}
                  stroke="var(--cyan)"
                  strokeWidth={0.5 + grip * 0.6}
                  opacity={0.4 + grip * 0.4}
                />
                {/* pin site (defect) inside the disc */}
                <circle cx={topX} cy={discY + 6} r="1" fill="var(--cyan)" opacity="0.9" />
                {/* anchor on track */}
                <circle cx={ax} cy={trackY} r="0.9" fill="var(--magenta)" />
              </g>
            );
          })}

          {/* the superconducting disc with visible voids/defects */}
          <g transform={`translate(${discX - restX} 0)`}>
            <ellipse
              cx={restX}
              cy={discY}
              rx="16"
              ry="7"
              fill="var(--surface)"
              stroke="var(--teal)"
              strokeWidth="0.7"
            />
            <ellipse cx={restX} cy={discY} rx="16" ry="7" fill="var(--teal)" opacity="0.12" />
            {/* void speckle — defect map */}
            {Array.from({ length: Math.round(defects * 14) }, (_, i) => {
              const a = (i / 14) * Math.PI * 2 * 2.3;
              const rr = 2 + ((i * 5) % 12);
              return (
                <circle
                  key={i}
                  cx={restX + Math.cos(a) * rr}
                  cy={discY + Math.sin(a) * rr * 0.42}
                  r="0.7"
                  fill="var(--void)"
                  opacity="0.7"
                />
              );
            })}
          </g>

          {/* restoring-force arrow when displaced */}
          {Math.abs(shown) > 0.03 && (
            <g transform={`translate(${discX} ${discY - 11})`}>
              <path
                d={
                  shown > 0 ? "M2 0 L-5 0 M-3 -1.6 L-5 0 L-3 1.6" : "M-2 0 L5 0 M3 -1.6 L5 0 L3 1.6"
                }
                stroke="var(--teal)"
                strokeWidth="0.7"
                fill="none"
              />
            </g>
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("threads")} value={nThreads} accent="cyan" />
          <Readout label={t("resist")} value={`${Math.round(grip * 100)}%`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("defectDensity")}
            value={defects}
            min={0}
            max={1}
            step={0.01}
            onChange={setDefects}
            display={defects < 0.25 ? t("fewPins") : defects > 0.7 ? t("manyPins") : t("somePins")}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// One overturning wheel, in cross-section. Warm moist air rises at the equator
// (left edge), rains itself out into rainforest, drifts poleward aloft, and
// sinks as dry air over desert. The sink latitude is set by spin: slower spin →
// weaker Coriolis → the air escapes farther before turning → a WIDER cell that
// pushes the wet belt out and exiles the desert. Pandora is the slow-spin case,
// which is why Australis is rainforest coast to coast.
export default function HadleyCell() {
  const t = useTranslations("viz.hadley-cell");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [spin, setSpin] = useState(1.0); // 1 = Earth-like
  const flow = useRef(0);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      flow.current = (flow.current + dt * 0.35) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // sink latitude (as an x-fraction across the panel). Fast spin → sink near 30°
  // (narrow). Slow spin → sink pushed out toward 50° (wide).
  const sinkX = 20 + (1 / spin) * 42; // px in a 0..100 viewBox width band
  const clampedSink = Math.min(88, sinkX);

  const EQ_X = 8;
  const TOP_Y = 24;
  const GND_Y = 74;

  // trace a loop: up at equator, over at top, down at sink, back along ground
  const loop = `M${EQ_X} ${GND_Y} L${EQ_X} ${TOP_Y} L${clampedSink} ${TOP_Y} L${clampedSink} ${GND_Y} Z`;

  // particles riding the loop
  const perim = [
    { x: EQ_X, y: GND_Y },
    { x: EQ_X, y: TOP_Y },
    { x: clampedSink, y: TOP_Y },
    { x: clampedSink, y: GND_Y },
  ];
  const segLen = [GND_Y - TOP_Y, clampedSink - EQ_X, GND_Y - TOP_Y, clampedSink - EQ_X];
  const total = segLen.reduce((a, b) => a + b, 0);

  function ptAt(frac: number): [number, number, boolean] {
    let d = frac * total;
    for (let i = 0; i < 4; i++) {
      if (d <= segLen[i]) {
        const a = perim[i];
        const b = perim[(i + 1) % 4];
        const f = d / segLen[i];
        return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, i === 0];
      }
      d -= segLen[i];
    }
    return [EQ_X, GND_Y, true];
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      allowFullscreen={false}
      caption={
        <span>
          {t("sinkLat")}:{" "}
          <span className="text-amber">~{Math.round((clampedSink - EQ_X) / 1.6)}°</span> ·{" "}
          {spin < 0.8 ? t("wide") : spin > 1.3 ? t("narrow") : t("earthlike")}
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
          {/* sky + ground */}
          <rect x="0" y="0" width="100" height={GND_Y} fill="#080c16" />
          <rect x="0" y={GND_Y} width="100" height={100 - GND_Y} fill="#0b1420" />

          {/* wet belt (under the rising branch) */}
          <rect
            x="0"
            y={GND_Y}
            width={EQ_X + 14}
            height={100 - GND_Y}
            fill="var(--teal)"
            opacity="0.22"
          />
          {/* desert (under the sink) */}
          <rect
            x={clampedSink - 10}
            y={GND_Y}
            width="24"
            height={100 - GND_Y}
            fill="var(--amber)"
            opacity="0.16"
          />

          {/* rainforest tufts */}
          {Array.from({ length: 6 }, (_, i) => (
            <circle
              key={i}
              cx={EQ_X - 4 + i * 3.4}
              cy={GND_Y + 4}
              r="1.6"
              fill="var(--teal)"
              opacity="0.6"
            />
          ))}
          {/* desert dunes */}
          <path
            d={`M${clampedSink - 8} ${GND_Y + 6} q 4 -3 8 0 q 4 3 8 0`}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="0.6"
            opacity="0.5"
          />

          {/* the loop path */}
          <path
            d={loop}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            opacity="0.5"
          />

          {/* rising rain column */}
          {Array.from({ length: 6 }, (_, i) => {
            const yy = TOP_Y + 6 + ((i * 9 + flow.current * 40) % (GND_Y - TOP_Y - 6));
            return (
              <line
                key={i}
                x1={EQ_X - 2 + (i % 2) * 4}
                y1={yy}
                x2={EQ_X - 3 + (i % 2) * 4}
                y2={yy + 3}
                stroke="var(--cyan)"
                strokeWidth="0.4"
                opacity="0.5"
              />
            );
          })}
          {/* rising cloud */}
          <ellipse cx={EQ_X} cy={TOP_Y + 2} rx="7" ry="3" fill="var(--cyan)" opacity="0.2" />

          {/* flowing particles */}
          {Array.from({ length: 12 }, (_, i) => {
            const [x, y, rising] = ptAt((i / 12 + flow.current) % 1);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.1"
                fill={rising ? "var(--amber)" : "var(--cyan)"}
                opacity="0.8"
              />
            );
          })}
        </svg>

        <div className="absolute left-3 top-16 flex flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-teal">
            {t("equator")}
          </span>
        </div>
        <div className="absolute right-3 top-16">
          <Readout
            label={t("cellWidth")}
            value={spin < 0.8 ? t("wide") : spin > 1.3 ? t("narrow") : t("medium")}
            accent="amber"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("rotationRate")}
            value={spin}
            min={0.4}
            max={2}
            step={0.05}
            onChange={setSpin}
            display={spin < 0.8 ? `${spin.toFixed(1)}× ${t("pandora")}` : `${spin.toFixed(1)}×`}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

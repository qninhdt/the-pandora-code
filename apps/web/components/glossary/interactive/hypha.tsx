"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Single fungal thread steers toward a nutrient patch.
export default function Hypha() {
  const t = useTranslations("viz.hypha");
  const [growth, setGrowth] = useState(0.55);
  const [steer, setSteer] = useState(0.5); // 0 left → 1 right nutrient

  const nutrient = { x: 20 + steer * 60, y: 28 };
  const path = useMemo(() => {
    const points: { x: number; y: number }[] = [{ x: 50, y: 78 }];
    const steps = 8 + Math.round(growth * 10);
    let x = 50;
    let y = 78;
    for (let i = 0; i < steps; i++) {
      const tx = nutrient.x - x;
      const ty = nutrient.y - y;
      const len = Math.hypot(tx, ty) || 1;
      const pull = 0.25 + growth * 0.5;
      x += (tx / len) * (4 + growth * 2) + Math.sin(i * 1.3) * (1.2 - pull);
      y += (ty / len) * (4 + growth * 2);
      points.push({ x, y });
    }
    return points;
  }, [growth, nutrient.x, nutrient.y]);

  const tip = path[path.length - 1];
  const d = path
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // side branches near tip
  const branches = path.slice(-4, -1).map((p, i) => {
    const ang = (i % 2 === 0 ? 1 : -1) * (0.6 + growth * 0.4);
    return {
      x1: p.x,
      y1: p.y,
      x2: p.x + Math.cos(ang) * (4 + growth * 3),
      y2: p.y + Math.sin(ang) * (3 + growth * 2),
    };
  });

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setGrowth(0.55);
        setSteer(0.5);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-magenta">
          {t("tip")} → {t("nutrient")}
        </span>
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
          <rect x="0" y="0" width="100" height="100" fill="#080a10" />
          {/* nutrient patch */}
          <circle
            cx={nutrient.x}
            cy={nutrient.y}
            r={6 + growth * 2}
            fill="var(--amber)"
            opacity={0.35}
          />
          <circle cx={nutrient.x} cy={nutrient.y} r="2.5" fill="var(--amber)" opacity={0.85} />
          <text
            x={nutrient.x}
            y={nutrient.y - 9}
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            {t("nutrient")}
          </text>
          {/* hypha */}
          <path
            d={d}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={0.9}
          />
          {branches.map((b, i) => (
            <line
              key={i}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              stroke="var(--teal)"
              strokeWidth="0.9"
              opacity={0.75}
            />
          ))}
          <circle
            cx={tip.x}
            cy={tip.y}
            r={2 + growth}
            fill="var(--cyan)"
            style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }}
          />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("growth")} value={`${Math.round(growth * 100)}%`} accent="magenta" />
        </div>
        <div className="absolute inset-x-3 bottom-10 space-y-2">
          <ControlSlider
            label={t("growth")}
            value={growth}
            min={0.1}
            max={1}
            step={0.01}
            display={`${Math.round(growth * 12)} µm/h`}
            onChange={setGrowth}
            thumb="magenta"
          />
          <ControlSlider
            label={t("steer")}
            value={steer}
            min={0}
            max={1}
            step={0.01}
            display={t("nutrient")}
            onChange={setSteer}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

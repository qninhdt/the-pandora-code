"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Food = { x: number; y: number; id: number };

// Expanding colony reorganizes toward food and prunes idle threads.
export default function Mycelium() {
  const t = useTranslations("viz.mycelium");
  const [foods, setFoods] = useState<Food[]>([
    { x: 72, y: 28, id: 1 },
    { x: 24, y: 36, id: 2 },
  ]);
  const [prune, setPrune] = useState(false);
  const [tick, setTick] = useState(0);

  const hub = { x: 50, y: 58 };
  const threads = useMemo(() => {
    const base = foods.map((f) => ({
      x2: f.x,
      y2: f.y,
      active: true,
      key: `f-${f.id}`,
    }));
    const explorers = [
      { x2: 18, y2: 70, active: !prune, key: "e1" },
      { x2: 82, y2: 72, active: !prune, key: "e2" },
      { x2: 40, y2: 80, active: !prune, key: "e3" },
      { x2: 62, y2: 18, active: foods.length < 3 && !prune, key: "e4" },
    ];
    return [...base, ...explorers];
  }, [foods, prune]);

  const colony = foods.length * 18 + (prune ? 8 : 16) + tick;

  const dropFood = () => {
    setFoods((prev) => {
      if (prev.length >= 5) return prev;
      const id = Date.now();
      return [...prev, { x: 15 + Math.random() * 70, y: 18 + Math.random() * 40, id }];
    });
    setTick((t0) => t0 + 1);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setFoods([
          { x: 72, y: 28, id: 1 },
          { x: 24, y: 36, id: 2 },
        ]);
        setPrune(false);
        setTick(0);
      }}
      allowFullscreen={false}
      caption={
        <span className={prune ? "text-teal" : "text-magenta"}>
          {prune ? t("optimize") : t("explore")}
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
          <rect x="0" y="0" width="100" height="100" fill="#070a0f" />
          {/* substrate grain */}
          {Array.from({ length: 20 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 17) % 100}
              cy={(i * 29) % 100}
              r="0.5"
              fill="var(--border-strong)"
              opacity={0.4}
            />
          ))}
          {/* threads */}
          {threads.map((th) => (
            <g key={th.key} opacity={th.active ? 0.9 : 0.15}>
              <line
                x1={hub.x}
                y1={hub.y}
                x2={th.x2}
                y2={th.y2}
                stroke={th.active ? "var(--magenta)" : "var(--muted)"}
                strokeWidth={th.active ? 1.1 : 0.5}
              />
              {/* mesh cross-links when optimized */}
              {prune && th.active && (
                <line
                  x1={th.x2}
                  y1={th.y2}
                  x2={hub.x + (th.x2 - hub.x) * 0.4}
                  y2={hub.y - 8}
                  stroke="var(--teal)"
                  strokeWidth="0.5"
                  opacity={0.6}
                />
              )}
            </g>
          ))}
          {/* hub colony */}
          <circle
            cx={hub.x}
            cy={hub.y}
            r={6 + foods.length}
            fill="var(--teal)"
            opacity={0.45}
            style={{ filter: "drop-shadow(0 0 6px var(--teal))" }}
          />
          {/* food sources */}
          {foods.map((f) => (
            <g key={f.id}>
              <circle cx={f.x} cy={f.y} r="4" fill="var(--amber)" opacity={0.7} />
              <circle cx={f.x} cy={f.y} r="1.5" fill="var(--amber)" />
            </g>
          ))}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("colony")} value={`${colony}`} unit="mm" accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex justify-center gap-2">
          <ControlButton variant="accent" onClick={dropFood} aria-label={t("food")}>
            <span className="px-1 text-[11px] uppercase tracking-wider">{t("food")}</span>
          </ControlButton>
          <ControlButton
            variant={prune ? "active" : "default"}
            onClick={() => setPrune((v) => !v)}
            aria-label={t("prune")}
          >
            <span className="px-1 text-[11px] uppercase tracking-wider">{t("prune")}</span>
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

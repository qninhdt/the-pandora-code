"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const LAYERS = ["emergent", "canopy", "understory", "shrub", "floor"] as const;
type Layer = (typeof LAYERS)[number];

const LAYER_Y: Record<Layer, { y: number; h: number; light: number; humidity: number }> = {
  emergent: { y: 10, h: 14, light: 1, humidity: 0.35 },
  canopy: { y: 24, h: 16, light: 0.7, humidity: 0.5 },
  understory: { y: 40, h: 12, light: 0.25, humidity: 0.7 },
  shrub: { y: 52, h: 10, light: 0.12, humidity: 0.8 },
  floor: { y: 62, h: 12, light: 0.02, humidity: 0.92 },
};

export default function ForestStratification() {
  const t = useTranslations("viz.forest-stratification");
  const [active, setActive] = useState<Layer>("canopy");
  const [pandoran, setPandoran] = useState(false);
  const meta = LAYER_Y[active];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setActive("canopy");
        setPandoran(false);
      }}
      allowFullscreen={false}
      caption={
        <span className={pandoran ? "text-magenta" : "text-teal"}>
          {t(active)}
          {pandoran ? ` · ${t("variant")}` : ""}
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
          {LAYERS.map((layer) => {
            const m = LAYER_Y[layer];
            const on = layer === active;
            const fill = pandoran
              ? layer === "emergent"
                ? "var(--magenta)"
                : layer === "canopy"
                  ? "var(--teal)"
                  : "var(--cyan)"
              : "var(--teal)";
            return (
              <g key={layer} onClick={() => setActive(layer)} style={{ cursor: "pointer" }}>
                <rect
                  x="18"
                  y={m.y}
                  width="50"
                  height={m.h - 1}
                  fill={fill}
                  opacity={on ? 0.55 : 0.18}
                  stroke={on ? fill : "var(--border-strong)"}
                  strokeWidth={on ? 1 : 0.4}
                  rx="1"
                />
                <text
                  x="20"
                  y={m.y + m.h / 2 + 1}
                  style={{
                    fontSize: 2.3,
                    fontFamily: "monospace",
                    fill: on ? fill : "var(--muted)",
                  }}
                >
                  {t(layer)}
                </text>
                {pandoran && on && (
                  <circle
                    cx="60"
                    cy={m.y + m.h / 2}
                    r="2"
                    fill="var(--magenta)"
                    opacity={0.9}
                    style={{ filter: "drop-shadow(0 0 4px var(--magenta))" }}
                  />
                )}
              </g>
            );
          })}
          {/* trunk spine */}
          <rect x="40" y="12" width="3" height="60" fill="var(--cyan)" opacity={0.25} />
          <rect x="16" y="74" width="54" height="4" fill="var(--surface)" opacity={0.5} />
        </svg>
        <div className="absolute right-3 top-14 space-y-1">
          <Readout label={t("light")} value={`${Math.round(meta.light * 100)}%`} accent="amber" />
          <Readout
            label={t("humidity")}
            value={`${Math.round(meta.humidity * 100)}%`}
            accent="cyan"
          />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex flex-wrap justify-center gap-1.5">
          {LAYERS.map((layer) => (
            <ControlButton
              key={layer}
              variant={active === layer ? "active" : "default"}
              onClick={() => setActive(layer)}
              aria-label={t(layer)}
              className="!p-1.5"
            >
              <span className="px-0.5 text-[10px] uppercase tracking-wider">{t(layer)}</span>
            </ControlButton>
          ))}
          <ControlButton
            variant={pandoran ? "accent" : "default"}
            onClick={() => setPandoran((v) => !v)}
            aria-label={t("variant")}
          >
            <span className="px-0.5 text-[10px] uppercase tracking-wider">{t("variant")}</span>
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const LEVELS = ["galaxy", "brain", "atom", "electron"] as const;

// Zoom scales; panpsychism keeps a spark at every level, emergentism only at brains.
export default function Panpsychism() {
  const t = useTranslations("viz.panpsychism");
  const [zoom, setZoom] = useState(0.4);
  const [mode, setMode] = useState<"pan" | "emerge">("pan");

  const tier = useMemo(() => {
    if (zoom < 0.25) return 0;
    if (zoom < 0.5) return 1;
    if (zoom < 0.75) return 2;
    return 3;
  }, [zoom]);

  const label = LEVELS[tier];
  // emergentism: spark only at brain (tier 1)
  const spark = mode === "pan" || tier === 1;
  const radius = 28 - tier * 5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setZoom(0.4);
        setMode("pan");
      }}
      allowFullscreen={false}
      caption={
        <span className={spark ? "text-amber" : "text-muted"}>
          {t(label)} · {spark ? t("spark") : "—"} · {t(mode)}
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
          {/* nested shells */}
          {LEVELS.map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="46"
              r={28 - i * 5}
              fill="none"
              stroke={i === tier ? "var(--cyan)" : "var(--border-strong)"}
              strokeWidth={i === tier ? 1 : 0.4}
              opacity={i === tier ? 0.9 : 0.35}
            />
          ))}

          {/* level body */}
          <circle
            cx="50"
            cy="46"
            r={radius * 0.55}
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.7"
            opacity={0.7}
          />

          {/* spark of experience */}
          <circle
            cx="50"
            cy="46"
            r={spark ? 3.5 + (1 - tier * 0.15) : 1}
            fill={spark ? "var(--amber)" : "var(--void)"}
            opacity={spark ? 0.85 : 0.2}
          />
          {spark && (
            <circle
              cx="50"
              cy="46"
              r="7"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="0.5"
              opacity={0.45}
            />
          )}

          <text
            x="50"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t(label)}
          </text>
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("spark")}
            value={spark ? "●" : "○"}
            accent={spark ? "amber" : "foreground"}
          />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          <ControlButton
            variant={mode === "pan" ? "active" : "default"}
            onClick={() => setMode("pan")}
            className="px-2 py-1"
          >
            {t("pan")}
          </ControlButton>
          <ControlButton
            variant={mode === "emerge" ? "active" : "default"}
            onClick={() => setMode("emerge")}
            className="px-2 py-1"
          >
            {t("emerge")}
          </ControlButton>
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("zoom")}
            value={zoom}
            min={0}
            max={1}
            step={0.02}
            display={t(label)}
            onChange={setZoom}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Climb into faster wind, dive downwind — shear pays the energy bill, not muscle.
export default function DynamicSoaring() {
  const t = useTranslations("viz.dynamic-soaring");
  const [mode, setMode] = useState<"soar" | "flap">("soar");
  const energy = mode === "soar" ? 82 : 28;
  const cost = mode === "soar" ? 12 : 74;

  // figure-eight path points
  const path =
    "M20 60 C 30 40, 45 35, 50 50 C 55 65, 70 70, 80 50 C 70 30, 55 35, 50 50 C 45 65, 30 70, 20 60";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("soar")}
      allowFullscreen={false}
      caption={
        <span className={mode === "soar" ? "text-teal" : "text-amber"}>
          {mode === "soar" ? t("soar") : t("flap")} · {t("shear")}
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
          {/* wind layers */}
          {[30, 45, 60, 75].map((y, i) => (
            <line
              key={y}
              x1="8"
              y1={y}
              x2="92"
              y2={y}
              stroke="var(--cyan)"
              strokeWidth="0.4"
              opacity={0.15 + i * 0.12}
              strokeDasharray="2 2"
            />
          ))}
          <path
            d={path}
            fill="none"
            stroke={mode === "soar" ? "var(--teal)" : "var(--amber)"}
            strokeWidth="1.4"
            opacity="0.9"
          />
          <circle cx="50" cy="50" r="3" fill={mode === "soar" ? "var(--teal)" : "var(--amber)"} />
          {/* energy bar */}
          <rect
            x="12"
            y="88"
            width="76"
            height="4"
            rx="1"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          <rect
            x="12"
            y="88"
            width={(76 * energy) / 100}
            height="4"
            rx="1"
            fill="var(--teal)"
            opacity="0.85"
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("energy")} value={`${energy}%`} accent="teal" />
          <Readout label={t("cost")} value={`${cost}%`} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {(["soar", "flap"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase tracking-wide"
              style={{
                borderColor:
                  mode === m
                    ? m === "soar"
                      ? "var(--teal)"
                      : "var(--amber)"
                    : "var(--border-strong)",
                color:
                  mode === m ? (m === "soar" ? "var(--teal)" : "var(--amber)") : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t(m)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}

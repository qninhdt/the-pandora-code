"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Ventral glow cancels the silhouette against downwelling light.
export default function CounterIllumination() {
  const t = useTranslations("viz.counter-illumination");
  const [on, setOn] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOn(false)}
      allowFullscreen={false}
      caption={
        <span className={on ? "text-cyan" : "text-muted"}>{on ? t("match") : t("silhouette")}</span>
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
          <rect x="8" y="8" width="84" height="40" fill="var(--cyan)" opacity="0.12" />
          <ellipse
            cx="50"
            cy="58"
            rx="22"
            ry="10"
            fill={on ? "var(--cyan)" : "var(--void)"}
            opacity={on ? 0.35 : 0.85}
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          {on &&
            Array.from({ length: 7 }, (_, i) => (
              <circle
                key={i}
                cx={34 + i * 5.5}
                cy="62"
                r="1.6"
                fill="var(--cyan)"
                style={{ filter: "drop-shadow(0 0 3px var(--cyan))" }}
              />
            ))}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={on ? t("on") : t("off")}
            value={on ? t("match") : t("silhouette")}
            accent={on ? "cyan" : "foreground"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setOn((v) => !v)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase"
            style={{
              borderColor: on ? "var(--cyan)" : "var(--border-strong)",
              color: on ? "var(--cyan)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {on ? t("on") : t("off")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}

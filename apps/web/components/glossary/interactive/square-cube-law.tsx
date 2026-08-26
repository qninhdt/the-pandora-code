"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Scale k: area ~k², volume ~k³. Grow until volume overtops area.
export default function SquareCubeLaw() {
  const t = useTranslations("viz.square-cube-law");
  const [k, setK] = useState(1.8);
  const area = k * k;
  const volume = k * k * k;
  const stress = volume / area;
  const overtop = volume > area * 1.8;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setK(1.8)}
      allowFullscreen={false}
      caption={
        <span className={overtop ? "text-magenta" : "text-cyan"}>
          {t("stress")} ∝ {stress.toFixed(2)}
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
          <rect
            x="14"
            y={70 - 12}
            width="12"
            height="12"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.8"
          />
          <rect
            x="48"
            y={70 - 12 * k}
            width={12 * k}
            height={12 * k}
            fill="var(--surface)"
            stroke={overtop ? "var(--magenta)" : "var(--cyan)"}
            strokeWidth="1"
          />
          <rect
            x="14"
            y="82"
            width={Math.min(36, area * 6)}
            height="4"
            fill="var(--teal)"
            opacity="0.8"
          />
          <rect
            x="54"
            y="82"
            width={Math.min(36, volume * 3)}
            height="4"
            fill={overtop ? "var(--magenta)" : "var(--cyan)"}
            opacity="0.85"
          />
          <text
            x="14"
            y="92"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("area")}
          </text>
          <text
            x="54"
            y="92"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("volume")}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("area")} value={area.toFixed(2)} accent="teal" />
          <Readout
            label={t("volume")}
            value={volume.toFixed(2)}
            accent={overtop ? "magenta" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("scale")}
            value={k}
            min={1}
            max={4}
            step={0.05}
            display={`k=${k.toFixed(2)}`}
            onChange={setK}
            thumb={overtop ? "magenta" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

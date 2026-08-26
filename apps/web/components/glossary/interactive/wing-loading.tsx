"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Loading = weight / area. High → fast landing, poor turns. Ikran preset for anchor.
export default function WingLoading() {
  const t = useTranslations("viz.wing-loading");
  const [weight, setWeight] = useState(2500); // N proxy
  const [area, setArea] = useState(18); // m²
  const loading = weight / Math.max(area, 0.1);
  // landing speed proxy ~ sqrt(loading)
  const land = Math.sqrt(loading) * 0.9;
  const agility = Math.max(0.1, 40 / loading);

  const ikran = () => {
    setWeight(2500);
    setArea(18);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={ikran}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("loading")} {loading.toFixed(1)} N/m²
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
          {/* wing area visual */}
          <ellipse
            cx="50"
            cy="36"
            rx={10 + area * 1.2}
            ry={4 + area * 0.25}
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <ellipse cx="50" cy="36" rx="4" ry="5" fill="var(--teal)" opacity="0.75" />
          {/* meters */}
          <rect
            x="14"
            y="62"
            width="30"
            height="5"
            rx="1"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          <rect x="14" y="62" width={Math.min(30, land)} height="5" rx="1" fill="var(--amber)" />
          <text
            x="14"
            y="74"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("landSpeed")}
          </text>
          <rect
            x="56"
            y="62"
            width="30"
            height="5"
            rx="1"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          <rect
            x="56"
            y="62"
            width={Math.min(30, agility * 8)}
            height="5"
            rx="1"
            fill="var(--teal)"
          />
          <text
            x="56"
            y="74"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("agility")}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("loading")} value={loading.toFixed(1)} accent="cyan" />
          <Readout label={t("landSpeed")} value={land.toFixed(1)} accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={ikran}
              className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
              style={{
                borderColor: "var(--teal)",
                color: "var(--teal)",
                background: "var(--void)",
              }}
            >
              {t("ikran")}
            </button>
          </div>
          <ControlSlider
            label={t("weight")}
            value={weight}
            min={200}
            max={5000}
            step={50}
            display={`${weight.toFixed(0)} N`}
            onChange={setWeight}
            thumb="amber"
          />
          <ControlSlider
            label={t("area")}
            value={area}
            min={2}
            max={40}
            step={0.5}
            display={`${area.toFixed(1)} m²`}
            onChange={setArea}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

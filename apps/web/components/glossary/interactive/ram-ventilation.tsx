"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Below threshold: must pump. Above: open mouth, ram flow.
export default function RamVentilation() {
  const t = useTranslations("viz.ram-ventilation");
  const [speed, setSpeed] = useState(0.6);
  const threshold = 0.55;
  const ram = speed >= threshold;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSpeed(0.6)}
      allowFullscreen={false}
      caption={
        <span className={ram ? "text-cyan" : "text-amber"}>{ram ? t("ram") : t("pump")}</span>
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
          <ellipse
            cx={30 + speed * 20}
            cy="48"
            rx="16"
            ry="8"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.8"
          />
          <path
            d={`M${42 + speed * 20} 48 Q ${50 + speed * 20} 48 ${55 + speed * 20} 48`}
            stroke="var(--cyan)"
            strokeWidth="1.2"
            fill="none"
            opacity={ram ? 0.9 : 0.3}
          />
          {Array.from({ length: ram ? 6 : 2 }, (_, i) => (
            <line
              key={i}
              x1={48 + speed * 20}
              y1={42 + i * 2.5}
              x2={70 + speed * 10}
              y2={42 + i * 2.5}
              stroke="var(--cyan)"
              strokeWidth="0.5"
              opacity={0.3 + speed * 0.5}
            />
          ))}
          <line
            x1={16 + threshold * 60}
            y1="78"
            x2={16 + threshold * 60}
            y2="88"
            stroke="var(--amber)"
            strokeWidth="0.8"
          />
          <text
            x="50"
            y="86"
            textAnchor="middle"
            style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("threshold")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("speed")} value={speed.toFixed(2)} accent={ram ? "cyan" : "amber"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("speed")}
            value={speed}
            min={0.1}
            max={1.2}
            step={0.02}
            display={speed.toFixed(2)}
            onChange={setSpeed}
            thumb={ram ? "cyan" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

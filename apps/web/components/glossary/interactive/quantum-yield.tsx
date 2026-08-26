"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Photons out per reaction — pH, temp, O₂ tune the yield.
export default function QuantumYield() {
  const t = useTranslations("viz.quantum-yield");
  const [ph, setPh] = useState(7.4);
  const [temp, setTemp] = useState(25);
  const [o2, setO2] = useState(0.8);
  const yieldV = Math.max(
    0.05,
    Math.min(
      0.98,
      0.9 * Math.exp(-((ph - 7.8) ** 2) / 2) * Math.exp(-((temp - 22) ** 2) / 200) * o2,
    ),
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setPh(7.4);
        setTemp(25);
        setO2(0.8);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("yield")}: {(yieldV * 100).toFixed(0)}%
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
            x="20"
            y="28"
            width="60"
            height="28"
            rx="2"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <rect
            x="20"
            y="28"
            width={60 * yieldV}
            height="28"
            rx="2"
            fill="var(--teal)"
            opacity="0.55"
            style={{ filter: "drop-shadow(0 0 6px var(--teal))" }}
          />
          <text
            x="50"
            y="45"
            textAnchor="middle"
            style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {(yieldV * 100).toFixed(0)}%
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("yield")} value={yieldV.toFixed(2)} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1">
          <ControlSlider
            label={t("ph")}
            value={ph}
            min={5}
            max={9}
            step={0.1}
            display={ph.toFixed(1)}
            onChange={setPh}
            thumb="cyan"
          />
          <ControlSlider
            label={t("temp")}
            value={temp}
            min={5}
            max={45}
            step={1}
            display={`${temp}°C`}
            onChange={setTemp}
            thumb="amber"
          />
          <ControlSlider
            label={t("o2")}
            value={o2}
            min={0.1}
            max={1}
            step={0.05}
            display={o2.toFixed(2)}
            onChange={setO2}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

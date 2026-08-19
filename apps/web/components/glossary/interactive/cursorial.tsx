"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Limb ratio drives Froude-ish gait bands: walk <0.5, trot <1, else gallop.
export default function Cursorial() {
  const t = useTranslations("viz.cursorial");
  const [ratio, setRatio] = useState(1.2);
  const [speed, setSpeed] = useState(0.6);
  const fr = speed * Math.sqrt(ratio);
  const gait = fr < 0.5 ? "walk" : fr < 1 ? "trot" : "gallop";
  const leg = 18 * ratio;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setRatio(1.2);
        setSpeed(0.6);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("gait")}: {t(gait)} · Fr {fr.toFixed(2)}
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
          <line x1="10" y1="78" x2="90" y2="78" stroke="var(--border-strong)" strokeWidth="0.6" />
          {/* body */}
          <ellipse cx="50" cy={78 - leg - 6} rx="14" ry="5" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="0.8" />
          {/* legs — phase offset by gait */}
          {[0, 1, 2, 3].map((i) => {
            const phase =
              gait === "walk" ? i * 0.25 : gait === "trot" ? (i % 2) * 0.5 : i < 2 ? 0 : 0.5;
            const swing = Math.sin(phase * Math.PI * 2 + speed * 4) * 8;
            const x = 42 + i * 5;
            return (
              <line
                key={i}
                x1={x}
                y1={78 - leg - 4}
                x2={x + swing}
                y2="78"
                stroke="var(--teal)"
                strokeWidth="1.2"
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("froude")} value={fr.toFixed(2)} accent="cyan" />
          <Readout label={t("gait")} value={t(gait)} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <ControlSlider label={t("limbRatio")} value={ratio} min={0.7} max={2} step={0.05} display={ratio.toFixed(2)} onChange={setRatio} thumb="teal" />
          <ControlSlider label={t("froude")} value={speed} min={0.15} max={1.4} step={0.05} display={speed.toFixed(2)} onChange={setSpeed} thumb="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}

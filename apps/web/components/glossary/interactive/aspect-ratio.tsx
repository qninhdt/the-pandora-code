"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// AR = span² / area ≈ span / chord for a rectangle. High AR soars; low AR turns.
const PRESETS = {
  ikran: { span: 12, chord: 1.6 },
  albatross: { span: 3.1, chord: 0.22 },
  sparrow: { span: 0.22, chord: 0.08 },
} as const;

export default function AspectRatio() {
  const t = useTranslations("viz.aspect-ratio");
  const [span, setSpan] = useState(12);
  const [chord, setChord] = useState(1.6);
  const ar = span / Math.max(chord, 0.05);
  const ld = Math.min(28, 4 + ar * 1.4);

  const apply = (key: keyof typeof PRESETS) => {
    setSpan(PRESETS[key].span);
    setChord(PRESETS[key].chord);
  };

  // silhouette width/height in viewBox
  const w = Math.min(70, 10 + span * 4);
  const h = Math.min(28, 4 + chord * 10);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => apply("ikran")}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("ar")} {ar.toFixed(1)} · {t("ld")} {ld.toFixed(1)}
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
          <ellipse
            cx="50"
            cy="38"
            rx={w / 2}
            ry={h / 2}
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <ellipse cx="50" cy="38" rx="4" ry="6" fill="var(--teal)" opacity="0.8" />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("ar")} value={ar.toFixed(1)} accent="cyan" />
          <Readout label={t("ld")} value={ld.toFixed(1)} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <div className="flex justify-center gap-1.5">
            {(["ikran", "albatross", "sparrow"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => apply(k)}
                className="rounded-lg border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--muted)",
                  background: "var(--void)",
                }}
              >
                {t(k)}
              </button>
            ))}
          </div>
          <ControlSlider label={t("span")} value={span} min={0.2} max={16} step={0.1} display={`${span.toFixed(1)} m`} onChange={setSpan} thumb="cyan" />
          <ControlSlider label={t("chord")} value={chord} min={0.05} max={3} step={0.05} display={`${chord.toFixed(2)} m`} onChange={setChord} thumb="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Trait ∝ base^b. Pick the exponent; the log-log curve tilts.
const EXPS = [0.5, 0.75, 1, 2] as const;

export default function ScalingExponent() {
  const t = useTranslations("viz.scaling-exponent");
  const [b, setB] = useState(0.75);
  const [base, setBase] = useState(2);

  const pts = Array.from({ length: 12 }, (_, i) => {
    const x = 0.5 + i * 0.25;
    return { x, y: x ** b };
  });
  const maxY = Math.max(...pts.map((p) => p.y));
  const trait = base ** b;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setB(0.75);
        setBase(2);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("trait")} ∝ {t("base")}^{b}
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
          <line x1="16" y1="72" x2="88" y2="72" stroke="var(--border-strong)" strokeWidth="0.5" />
          <line x1="16" y1="72" x2="16" y2="18" stroke="var(--border-strong)" strokeWidth="0.5" />
          <polyline
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.2"
            points={pts
              .map((p) => {
                const px = 16 + ((p.x - 0.5) / 3) * 72;
                const py = 72 - (p.y / maxY) * 50;
                return `${px},${py}`;
              })
              .join(" ")}
          />
          {/* base marker */}
          <circle
            cx={16 + ((base - 0.5) / 3) * 72}
            cy={72 - (trait / maxY) * 50}
            r="2.8"
            fill="var(--teal)"
          />
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1">
          <Readout label={t("exponent")} value={b.toFixed(2)} accent="cyan" />
          <Readout label={t("trait")} value={trait.toFixed(2)} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1.5">
          <div className="flex justify-center gap-1.5">
            {EXPS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setB(e)}
                className="rounded-lg border px-2.5 py-1 font-mono text-[10px]"
                style={{
                  borderColor: b === e ? "var(--cyan)" : "var(--border-strong)",
                  color: b === e ? "var(--cyan)" : "var(--muted)",
                  background: "var(--void)",
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <ControlSlider
            label={t("base")}
            value={base}
            min={0.5}
            max={3.5}
            step={0.05}
            display={base.toFixed(2)}
            onChange={setBase}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

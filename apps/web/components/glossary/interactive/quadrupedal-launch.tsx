"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Big flyer launch: crouch → vault → unfold → first stroke. Power from the leap.
const STEPS = ["crouch", "push", "unfold", "stroke"] as const;

export default function QuadrupedalLaunch() {
  const t = useTranslations("viz.quadrupedal-launch");
  const [step, setStep] = useState(0);
  const key = STEPS[step];

  // pose knobs per step
  const bodyY = [62, 48, 40, 34][step];
  const wingSpread = [8, 12, 28, 34][step];
  const legPush = [0, 14, 8, 4][step];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setStep(0)}
      onStepBack={() => setStep((s) => Math.max(0, s - 1))}
      onStepForward={() => setStep((s) => Math.min(3, s + 1))}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("step")} {step + 1}/4 · {t(key)}
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
          <ellipse
            cx="50"
            cy={bodyY}
            rx="12"
            ry="5"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          {/* wings */}
          <line
            x1={50 - wingSpread}
            y1={bodyY - 2}
            x2={50 + wingSpread}
            y2={bodyY - 2}
            stroke="var(--teal)"
            strokeWidth="1.4"
          />
          {/* legs pushing */}
          <line
            x1="44"
            y1={bodyY + 4}
            x2={42}
            y2={78 - legPush}
            stroke="var(--amber)"
            strokeWidth="1.2"
          />
          <line
            x1="56"
            y1={bodyY + 4}
            x2={58}
            y2={78 - legPush}
            stroke="var(--amber)"
            strokeWidth="1.2"
          />
          <line
            x1="40"
            y1={bodyY + 2}
            x2={36}
            y2={78 - legPush * 0.6}
            stroke="var(--amber)"
            strokeWidth="1"
          />
          <line
            x1="60"
            y1={bodyY + 2}
            x2={64}
            y2={78 - legPush * 0.6}
            stroke="var(--amber)"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("step")} value={`${step + 1}/4`} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className="rounded-lg border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide"
              style={{
                borderColor: step === i ? "var(--cyan)" : "var(--border-strong)",
                color: step === i ? "var(--cyan)" : "var(--muted)",
                background: "var(--void)",
              }}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}

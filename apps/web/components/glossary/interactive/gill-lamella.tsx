"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Countercurrent vs parallel across lamellae — efficiency halves when flipped.
export default function GillLamella() {
  const t = useTranslations("viz.gill-lamella");
  const [counter, setCounter] = useState(true);
  const efficiency = counter ? 0.86 : 0.43;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCounter(true)}
      allowFullscreen={false}
      caption={
        <span className={counter ? "text-teal" : "text-amber"}>
          {counter ? t("counter") : t("parallel")}
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
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line
                x1="20"
                y1={28 + i * 10}
                x2="80"
                y2={28 + i * 10}
                stroke="var(--cyan)"
                strokeWidth="1.2"
                opacity="0.7"
              />
              <line
                x1="22"
                y1={32 + i * 10}
                x2="78"
                y2={32 + i * 10}
                stroke="var(--magenta)"
                strokeWidth="0.8"
                opacity="0.7"
                strokeDasharray={counter ? undefined : "2 2"}
              />
              {/* flow arrows */}
              <path d={`M24 ${28 + i * 10} l4 -2 l0 4 z`} fill="var(--cyan)" opacity="0.8" />
              <path
                d={counter ? `M76 ${32 + i * 10} l-4 -2 l0 4 z` : `M24 ${32 + i * 10} l4 -2 l0 4 z`}
                fill="var(--magenta)"
                opacity="0.8"
              />
            </g>
          ))}
          <rect
            x="20"
            y="84"
            width={efficiency * 60}
            height="5"
            fill="var(--teal)"
            opacity="0.85"
          />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("efficiency")}
            value={`${(efficiency * 100).toFixed(0)}%`}
            accent="teal"
          />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setCounter(true)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: counter ? "var(--teal)" : "var(--border-strong)",
              color: counter ? "var(--teal)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("counter")}
          </button>
          <button
            type="button"
            onClick={() => setCounter(false)}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: !counter ? "var(--amber)" : "var(--border-strong)",
              color: !counter ? "var(--amber)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("parallel")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}

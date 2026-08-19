"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Diverse vs monoculture under stress. Redundant species cover function when
// some fail; monoculture loses the whole bar when its single type is hit.
const SPECIES = 6;

export default function InsuranceHypothesis() {
  const t = useTranslations("viz.insurance-hypothesis");
  const [stress, setStress] = useState(0); // 0..3 stress events fired
  const [seed, setSeed] = useState(1);

  // each species has a stress tolerance 0–1 (deterministic from seed)
  const tolerances = useMemo(() => {
    let s = seed * 9973;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: SPECIES }, () => 0.25 + rnd() * 0.7);
  }, [seed]);

  const stressLevel = Math.min(1, stress * 0.28);
  // diverse: fraction of species still functioning
  const diverseAlive = tolerances.filter((tol) => tol > stressLevel).length;
  const diverseFn = diverseAlive / SPECIES;
  // mono uses species 0 only
  const monoFn = tolerances[0] > stressLevel ? 1 : 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setStress(0);
        setSeed((s) => s + 1);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("function")}:{" "}
          <span className="text-teal">{Math.round(diverseFn * 100)}%</span> vs{" "}
          <span className="text-magenta">{Math.round(monoFn * 100)}%</span>
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
          {/* diverse plot */}
          <text
            x="28"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("diverse")}
          </text>
          {tolerances.map((tol, i) => {
            const alive = tol > stressLevel;
            const colors = ["var(--cyan)", "var(--teal)", "var(--amber)", "var(--cyan)", "var(--teal)", "var(--amber)"];
            return (
              <rect
                key={i}
                x={12 + i * 5.5}
                y={alive ? 50 - tol * 28 : 52}
                width="4.5"
                height={alive ? tol * 28 : 4}
                rx="0.6"
                fill={alive ? colors[i] : "var(--border-strong)"}
                opacity={alive ? 0.85 : 0.4}
              />
            );
          })}
          {/* function bar diverse */}
          <rect x="12" y="58" width="34" height="5" rx="1" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.3" />
          <rect x="12" y="58" width={34 * diverseFn} height="5" rx="1" fill="var(--teal)" opacity="0.8" />

          {/* monoculture plot */}
          <text
            x="72"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            {t("mono")}
          </text>
          {Array.from({ length: SPECIES }, (_, i) => {
            const alive = monoFn > 0;
            return (
              <rect
                key={i}
                x={56 + i * 5.5}
                y={alive ? 50 - tolerances[0] * 28 : 52}
                width="4.5"
                height={alive ? tolerances[0] * 28 : 4}
                rx="0.6"
                fill={alive ? "var(--magenta)" : "var(--border-strong)"}
                opacity={alive ? 0.75 : 0.4}
              />
            );
          })}
          <rect x="56" y="58" width="34" height="5" rx="1" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="0.3" />
          <rect x="56" y="58" width={34 * monoFn} height="5" rx="1" fill="var(--magenta)" opacity="0.8" />

          {/* stress overlay */}
          {stress > 0 && (
            <rect
              x="8"
              y="20"
              width="84"
              height={stressLevel * 30}
              fill="var(--amber)"
              opacity="0.08"
            />
          )}
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("diverse")} value={`${Math.round(diverseFn * 100)}%`} accent="teal" />
          <Readout label={t("mono")} value={`${Math.round(monoFn * 100)}%`} accent="magenta" />
        </div>

        <div className="absolute right-3 top-14">
          <ControlButton
            variant="accent"
            onClick={() => setStress((s) => Math.min(4, s + 1))}
            className="px-2.5 py-1.5"
          >
            {t("stress")} ({stress})
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

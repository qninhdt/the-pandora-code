"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type ClaimId = "claimA" | "claimB" | "claimC" | "claimD";
type Bin = "mechanism" | "purpose" | null;

// Correct scientific framing: A,D → mechanism; B,C smuggle purpose/teleology.
const CORRECT: Record<ClaimId, Bin> = {
  claimA: "mechanism",
  claimB: "purpose",
  claimC: "purpose",
  claimD: "mechanism",
};

const CLAIMS: ClaimId[] = ["claimA", "claimB", "claimC", "claimD"];

// Sort teleological vs mechanistic claims; Daisyworld cameo stays goal-free.
export default function Teleology() {
  const t = useTranslations("viz.teleology");
  const [bins, setBins] = useState<Record<ClaimId, Bin>>({
    claimA: null,
    claimB: null,
    claimC: null,
    claimD: null,
  });
  const [active, setActive] = useState<ClaimId>("claimA");

  const sorted = useMemo(
    () => CLAIMS.filter((c) => bins[c] !== null).length,
    [bins],
  );
  const correct = useMemo(
    () => CLAIMS.filter((c) => bins[c] === CORRECT[c]).length,
    [bins],
  );

  const assign = (bin: Bin) => {
    setBins((prev) => ({ ...prev, [active]: bin }));
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() =>
        setBins({ claimA: null, claimB: null, claimC: null, claimD: null })
      }
      allowFullscreen={false}
      caption={
        <span className={correct === 4 ? "text-teal" : "text-amber"}>
          {t("score")}: {correct}/4 · {sorted} placed
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
          {/* heart */}
          <path
            d="M50 36 C50 28, 38 24, 34 34 C30 44, 50 58, 50 58 C50 58, 70 44, 66 34 C62 24, 50 28, 50 36 Z"
            fill="var(--magenta)"
            opacity={0.35}
            stroke="var(--magenta)"
            strokeWidth="0.7"
          />

          {/* two bins */}
          <rect
            x="8"
            y="64"
            width="38"
            height="18"
            rx="2"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth="0.7"
          />
          <text
            x="27"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("mechanism")}
          </text>
          <text
            x="27"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("valid")}
          </text>

          <rect
            x="54"
            y="64"
            width="38"
            height="18"
            rx="2"
            fill="var(--surface)"
            stroke="var(--amber)"
            strokeWidth="0.7"
          />
          <text
            x="73"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            {t("purpose")}
          </text>
          <text
            x="73"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            {t("invalid")}
          </text>

          {/* placed chips */}
          {CLAIMS.map((c) => {
            const b = bins[c];
            if (!b) return null;
            const n = CLAIMS.filter((x) => bins[x] === b).indexOf(c);
            const x = b === "mechanism" ? 14 + n * 8 : 60 + n * 8;
            const ok = b === CORRECT[c];
            return (
              <circle
                key={c}
                cx={x}
                cy="68"
                r="2.2"
                fill={ok ? "var(--teal)" : "var(--magenta)"}
                opacity={0.85}
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("score")}
            value={`${correct}/4`}
            accent={correct === 4 ? "teal" : "amber"}
          />
        </div>

        <div className="absolute left-3 top-12 flex max-w-[70%] flex-wrap gap-1">
          {CLAIMS.map((c) => (
            <ControlButton
              key={c}
              variant={active === c ? "active" : bins[c] ? "accent" : "default"}
              onClick={() => setActive(c)}
              className="px-2 py-1"
            >
              {t(c).slice(0, 14)}
            </ControlButton>
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-10 flex justify-center gap-2">
          <ControlButton
            onClick={() => assign("mechanism")}
            className="px-3 py-1"
            variant="active"
          >
            → {t("mechanism")}
          </ControlButton>
          <ControlButton
            onClick={() => assign("purpose")}
            className="px-3 py-1"
            variant="accent"
          >
            → {t("purpose")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

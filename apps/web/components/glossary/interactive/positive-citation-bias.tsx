"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Run a batch of trials. Only positives get filed; nulls drop into a drawer.
// The published stack skews sunny even when half the world was null — citation bias.
function runBatch(n: number) {
  // deterministic-ish mix so SSR/CSR match for a given length
  return Array.from({ length: n }, (_, i) => (i * 7 + 3) % 10 < 4);
}

export default function PositiveCitationBias() {
  const t = useTranslations("viz.positive-citation-bias");
  const [batches, setBatches] = useState(1);
  const trials = useMemo(() => runBatch(batches * 8), [batches]);
  const positives = trials.filter(Boolean).length;
  const nulls = trials.length - positives;
  const skew = trials.length ? Math.round((positives / trials.length) * 100) : 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setBatches(1)}
      allowFullscreen={false}
      caption={
        <span className="text-amber">
          {t("bias")}: {skew}%
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
          {/* published shelf */}
          <rect
            x="12"
            y="22"
            width="40"
            height="50"
            rx="2"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <text
            x="32"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("published")}
          </text>
          {trials
            .map((p, i) => ({ p, i }))
            .filter((x) => x.p)
            .map((x, k) => (
              <rect
                key={`p-${x.i}`}
                x={16 + (k % 5) * 6.5}
                y={64 - Math.floor(k / 5) * 7}
                width="5.5"
                height="5"
                rx="0.6"
                fill="var(--cyan)"
                opacity="0.85"
              />
            ))}

          {/* null drawer */}
          <rect
            x="58"
            y="48"
            width="30"
            height="24"
            rx="2"
            fill="var(--void)"
            stroke="var(--muted)"
            strokeWidth="0.5"
            opacity="0.9"
          />
          <text
            x="73"
            y="44"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("nulls")}
          </text>
          {Array.from({ length: Math.min(nulls, 12) }, (_, k) => (
            <rect
              key={`n-${k}`}
              x={62 + (k % 4) * 6}
              y={64 - Math.floor(k / 4) * 5}
              width="5"
              height="3.5"
              rx="0.4"
              fill="var(--muted)"
              opacity="0.35"
            />
          ))}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col gap-1">
          <Readout label={t("positive")} value={positives} accent="cyan" />
          <Readout label={t("null")} value={nulls} accent="foreground" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setBatches((b) => Math.min(b + 1, 5))}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: "var(--amber)",
              color: "var(--amber)",
              background: "var(--void)",
            }}
          >
            {t("run")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}

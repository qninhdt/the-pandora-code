"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Popper's gate as a card flipper. Each claim is a risky bet or a sealed vault.
// Flip to reveal falsifiable ✓ vs not-falsifiable ✗ — only the former is science.
const CLAIMS = [
  { id: 0, falsifiable: true },
  { id: 1, falsifiable: false },
  { id: 2, falsifiable: true },
  { id: 3, falsifiable: false },
];

export default function Falsifiability() {
  const t = useTranslations("viz.falsifiability");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const claim = CLAIMS[idx];

  const reset = () => {
    setIdx(0);
    setFlipped(false);
  };

  const next = () => {
    setIdx((i) => (i + 1) % CLAIMS.length);
    setFlipped(false);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      allowFullscreen={false}
      caption={
        flipped ? (
          <span className={claim.falsifiable ? "text-cyan" : "text-magenta"}>
            {claim.falsifiable ? t("testable") : t("notTestable")}
          </span>
        ) : (
          <span className="text-muted">{t("flip")}</span>
        )
      }
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative h-[58%] w-[42%] rounded-xl border backdrop-blur-md transition-colors"
          style={{
            borderColor: flipped
              ? claim.falsifiable
                ? "var(--cyan)"
                : "var(--magenta)"
              : "var(--border-strong)",
            background: flipped
              ? `color-mix(in oklab, ${claim.falsifiable ? "var(--cyan)" : "var(--magenta)"} 14%, var(--surface))`
              : "var(--surface)",
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 px-3">
            <span
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              {t("verdict")} · {idx + 1}/{CLAIMS.length}
            </span>
            <span
              className="font-mono text-lg uppercase tracking-wide"
              style={{
                color: flipped
                  ? claim.falsifiable
                    ? "var(--cyan)"
                    : "var(--magenta)"
                  : "var(--foreground)",
              }}
            >
              {flipped ? (claim.falsifiable ? t("testable") : t("notTestable")) : t("flip")}
            </span>
            {flipped && (
              <span
                className="text-3xl"
                style={{
                  color: claim.falsifiable ? "var(--cyan)" : "var(--magenta)",
                }}
              >
                {claim.falsifiable ? "✓" : "✗"}
              </span>
            )}
          </div>
        </button>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("verdict")}
            value={flipped ? (claim.falsifiable ? "✓" : "✗") : "?"}
            accent={flipped ? (claim.falsifiable ? "cyan" : "magenta") : "foreground"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={next}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("next")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}

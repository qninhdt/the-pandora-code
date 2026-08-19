"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A choice chemistry never forced, frozen because everything came to depend on it.
// The genetic code maps each codon to an amino acid — one of many workable
// assignments, picked early by chance and then locked, because reassigning a codon
// now would silently corrupt every protein that ever used it. Try to reassign one
// and watch the damage ripple through the proteome: not one change but thousands,
// which is exactly why the code has stayed put for ~4 billion years. Its opposite
// is a universal optimum — a feature chemistry forces, so any life converges on it.
const CODONS = ["UUU", "CUG", "AUG", "GCC", "GAA", "AAG", "UAC", "CGU", "GGA", "UCA", "ACC", "GUG"];

export default function FrozenAccident() {
  const t = useTranslations("viz.frozen-accident");
  const [reassigned, setReassigned] = useState<number | null>(null);

  // each codon appears with some frequency across the proteome; reassigning it
  // corrupts that fraction of all proteins
  const freq = (i: number) => 3 + ((i * 37) % 12); // % of proteins using it
  const corrupted = reassigned == null ? 0 : freq(reassigned) * 90; // scaled proteins hit

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setReassigned(null)}
      allowFullscreen={false}
      caption={
        reassigned == null ? (
          <span className="text-teal">{t("codeLockedIn")}</span>
        ) : (
          <span className="text-magenta">{t("proteinsCorrupted", { n: corrupted })}</span>
        )
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
          {/* codon grid 4×3 */}
          {CODONS.map((codon, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = 14 + col * 20;
            const y = 26 + row * 16;
            const isHit = reassigned === i;
            return (
              <g key={codon}>
                <rect
                  x={x}
                  y={y}
                  width="17"
                  height="13"
                  rx="1.5"
                  fill={isHit ? "var(--magenta)" : "var(--surface)"}
                  stroke={isHit ? "var(--magenta)" : "var(--border-strong)"}
                  strokeWidth="0.6"
                  opacity={isHit ? 0.35 : 0.85}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${codon} — ${t("reassign")}`}
                  onClick={() => setReassigned(i === reassigned ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setReassigned(i === reassigned ? null : i);
                    }
                  }}
                />
                <text
                  x={x + 8.5}
                  y={y + 6}
                  textAnchor="middle"
                  style={{
                    fontSize: 3.2,
                    fontFamily: "monospace",
                    fill: isHit ? "var(--magenta)" : "var(--foreground)",
                  }}
                >
                  {codon}
                </text>
                <text
                  x={x + 8.5}
                  y={y + 11}
                  textAnchor="middle"
                  style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}
                >
                  {freq(i)}%
                </text>
                {/* corruption ripples */}
                {isHit &&
                  Array.from({ length: 3 }, (_, k) => (
                    <rect
                      key={k}
                      x={x - k * 1.5}
                      y={y - k * 1.5}
                      width={17 + k * 3}
                      height={13 + k * 3}
                      rx="1.5"
                      fill="none"
                      stroke="var(--magenta)"
                      strokeWidth="0.3"
                      opacity={0.4 - k * 0.1}
                    />
                  ))}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("proteome")}
            value={reassigned == null ? t("intact") : t("broken")}
            accent={reassigned == null ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
          {reassigned == null ? t("tapToReassign") : t("lockInLesson")}
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Astrobiology's self-mocking reminder — don't assume all life must be like
// Earth's — with the twist that carbon really is thermodynamically superior.
// Click an element to see why it's good or bad at building complex biochemistry;
// a "complexity index" bar scores it on bond versatility, stability, and whether
// its oxide is a disposable gas. Carbon tops the chart, but the point is telling
// what chemistry forces from what is mere habit of imagination.
interface Element {
  key: string;
  symbol: string;
  bonds: number; // versatility
  stability: number; // bond strength balance
  oxide: number; // is its oxide an exhalable gas?
  color: string;
}
const ELEMENTS: Element[] = [
  { key: "carbon", symbol: "C", bonds: 1.0, stability: 1.0, oxide: 1.0, color: "var(--teal)" },
  { key: "silicon", symbol: "Si", bonds: 0.75, stability: 0.4, oxide: 0.1, color: "var(--amber)" },
  { key: "nitrogen", symbol: "N", bonds: 0.6, stability: 0.7, oxide: 0.5, color: "var(--cyan)" },
  {
    key: "phosphorus",
    symbol: "P",
    bonds: 0.7,
    stability: 0.55,
    oxide: 0.2,
    color: "var(--magenta)",
  },
  { key: "sulfur", symbol: "S", bonds: 0.65, stability: 0.5, oxide: 0.6, color: "#e0b040" },
  { key: "boron", symbol: "B", bonds: 0.5, stability: 0.45, oxide: 0.15, color: "#8a7ad0" },
];

export default function CarbonChauvinism() {
  const t = useTranslations("viz.carbon-chauvinism");
  const [sel, setSel] = useState<string>("carbon");

  const el = ELEMENTS.find((e) => e.key === sel) ?? ELEMENTS[0];
  const complexity = (el.bonds * 0.4 + el.stability * 0.35 + el.oxide * 0.25) * 100;
  const verdict = complexity > 80 ? t("superior") : complexity > 50 ? t("plausible") : t("poor");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel("carbon")}
      allowFullscreen={false}
      caption={
        <span>
          {el.symbol}: <span className="text-teal">{t(`${el.key}Why`)}</span>
        </span>
      }
    >
      <div className="absolute inset-0 flex flex-col px-4 pt-14 pb-14">
        {/* element grid */}
        <div className="grid grid-cols-3 gap-2">
          {ELEMENTS.map((e) => {
            const active = e.key === sel;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => setSel(e.key)}
                className="flex flex-col items-center rounded-lg border py-2 backdrop-blur-md transition-all"
                style={{
                  borderColor: active ? e.color : "var(--border-strong)",
                  background: active
                    ? `color-mix(in oklab, ${e.color} 14%, transparent)`
                    : "var(--void)",
                  boxShadow: active ? `0 0 14px -3px ${e.color}` : "none",
                }}
              >
                <span
                  className="font-mono text-lg font-bold"
                  style={{ color: active ? e.color : "var(--foreground)" }}
                >
                  {e.symbol}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-muted">
                  {t(e.key)}
                </span>
              </button>
            );
          })}
        </div>

        {/* trait bars for the selected element */}
        <div className="mt-3 flex flex-1 flex-col justify-center gap-2">
          {[
            { label: t("bondVersatility"), v: el.bonds },
            { label: t("bondStability"), v: el.stability },
            { label: t("disposableOxide"), v: el.oxide },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-24 font-mono text-[9px] uppercase tracking-wider text-muted">
                {row.label}
              </span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-void/70">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${row.v * 100}%`, background: el.color, opacity: 0.75 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* complexity index */}
      <div className="absolute right-3 top-16">
        <Readout
          label={t("complexityIndex")}
          value={Math.round(complexity)}
          accent={complexity > 80 ? "teal" : complexity > 50 ? "amber" : "magenta"}
        />
      </div>
      <div className="absolute left-3 top-16">
        <Readout label={t("verdict")} value={verdict} accent={complexity > 80 ? "teal" : "amber"} />
      </div>
    </GlossaryFrame>
  );
}

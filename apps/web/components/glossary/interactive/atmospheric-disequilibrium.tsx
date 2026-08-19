"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Two atmospheres side by side. A dead world sits at the bottom of the energy
// hill — only the burnt-out gases remain. A living world holds mortal enemies
// (O₂ + CH₄ + H₂S) side by side, because something replenishes them faster than
// they annihilate. Toggle the reactive gases on the living world: the more
// incompatible pairs you keep lit, the higher the disequilibrium — the signature
// of life read from four light-years off. This is Lovelock's atmosphere test.
interface Gas {
  key: string;
  reactive: boolean;
  color: string;
}
const GASES: Gas[] = [
  { key: "co2", reactive: false, color: "#5a6270" },
  { key: "n2", reactive: false, color: "#414855" },
  { key: "o2", reactive: true, color: "var(--cyan)" },
  { key: "ch4", reactive: true, color: "var(--amber)" },
  { key: "h2s", reactive: true, color: "var(--magenta)" },
];
// which reactive gases annihilate each other → each live pair = disequilibrium
const CONFLICTS: [string, string][] = [
  ["o2", "ch4"],
  ["o2", "h2s"],
];

export default function AtmosphericDisequilibrium() {
  const t = useTranslations("viz.atmospheric-disequilibrium");
  const [on, setOn] = useState<Record<string, boolean>>({
    co2: true,
    n2: true,
    o2: true,
    ch4: true,
    h2s: true,
  });

  const toggle = (k: string) => setOn((s) => ({ ...s, [k]: !s[k] }));
  const liveConflicts = CONFLICTS.filter(([a, b]) => on[a] && on[b]).length;
  const disequilibrium = liveConflicts / CONFLICTS.length; // 0..1
  const alive = disequilibrium > 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOn({ co2: true, n2: true, o2: true, ch4: true, h2s: true })}
      allowFullscreen={false}
      caption={
        alive ? (
          <span className="text-teal">{t("signatureLife")}</span>
        ) : (
          <span className="text-muted">{t("deadAir")}</span>
        )
      }
    >
      <div className="absolute inset-0 grid grid-cols-2 gap-px pt-14 pb-24">
        {/* DEAD reference world — always at equilibrium */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0c1018] to-[#080a10]">
          <span className="absolute left-2 top-1 font-mono text-[9px] uppercase tracking-wider text-muted">
            {t("deadWorld")}
          </span>
          <div
            className="relative size-24 rounded-full border border-border/40"
            style={{ background: "radial-gradient(circle at 40% 35%, #2a2018, #0a0a0e)" }}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const ang = (i / 10) * Math.PI * 2;
              return (
                <span
                  key={i}
                  className="absolute size-1.5 rounded-full"
                  style={{
                    left: `${50 + Math.cos(ang) * 32}%`,
                    top: `${50 + Math.sin(ang) * 32}%`,
                    background: "#5a6270",
                    opacity: 0.5,
                  }}
                />
              );
            })}
          </div>
          <span className="mt-2 font-mono text-[9px] uppercase tracking-wide text-muted">
            {t("settled")}
          </span>
        </div>

        {/* LIVING world — Pandora; reactive gases held in defiance */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a1620] to-[#06101a]">
          <span className="absolute left-2 top-1 font-mono text-[9px] uppercase tracking-wider text-teal">
            {t("livingWorld")}
          </span>
          <div
            className="relative size-24 rounded-full border transition-all"
            style={{
              borderColor: alive ? "var(--teal)" : "var(--border-strong)",
              background: "radial-gradient(circle at 40% 35%, #10403a, #06121a)",
              boxShadow: alive ? `0 0 ${8 + disequilibrium * 22}px var(--teal)` : "none",
            }}
          >
            {GASES.filter((g) => g.reactive && on[g.key]).map((g, i, arr) => {
              const ang = (i / arr.length) * Math.PI * 2;
              return (
                <span
                  key={g.key}
                  className="absolute size-2 animate-pulse rounded-full"
                  style={{
                    left: `${50 + Math.cos(ang) * 30}%`,
                    top: `${50 + Math.sin(ang) * 30}%`,
                    background: g.color,
                    boxShadow: `0 0 6px ${g.color}`,
                  }}
                />
              );
            })}
          </div>
          <span
            className="mt-2 font-mono text-[9px] uppercase tracking-wide"
            style={{ color: alive ? "var(--teal)" : "var(--muted)" }}
          >
            {alive ? t("restless") : t("settled")}
          </span>
        </div>
      </div>

      {/* disequilibrium meter */}
      <div className="absolute inset-x-3 top-16">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
            {t("meter")}
          </span>
          <Readout
            value={`${Math.round(disequilibrium * 100)}%`}
            accent={alive ? "teal" : "foreground"}
          />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-void/70">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${disequilibrium * 100}%`,
              background: "linear-gradient(90deg, var(--cyan), var(--teal))",
            }}
          />
        </div>
      </div>

      {/* gas toggles for the living world */}
      <div className="absolute inset-x-3 bottom-12 flex flex-wrap justify-center gap-1.5">
        {GASES.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => toggle(g.key)}
            disabled={!g.reactive}
            className="rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-md transition-colors disabled:opacity-40"
            style={{
              borderColor: on[g.key] ? g.color : "var(--border-strong)",
              color: on[g.key] ? g.color : "var(--muted)",
              background: on[g.key]
                ? `color-mix(in oklab, ${g.color} 12%, transparent)`
                : "var(--void)",
            }}
          >
            {t(g.key)}
          </button>
        ))}
      </div>
    </GlossaryFrame>
  );
}

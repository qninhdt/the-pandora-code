"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The four eons, scaled by their true duration (Myr). The Phanerozoic — all of
// complex visible life — is a thin sliver at the top; the anonymous deep eons
// dwarf it. Heights are proportional so the scale teaches by geometry.
const EONS = [
  { key: "phanerozoic", startMa: 539, endMa: 0, color: "var(--amber)" },
  { key: "proterozoic", startMa: 2500, endMa: 539, color: "var(--teal)" },
  { key: "archean", startMa: 4031, endMa: 2500, color: "var(--cyan)" },
  { key: "hadean", startMa: 4540, endMa: 4031, color: "#6c5ce7" },
] as const;

const TOTAL = 4540;

export default function GeologicTimeScale() {
  const t = useTranslations("viz.geologic-time-scale");
  const [active, setActive] = useState<string>("phanerozoic");

  const cur = EONS.find((e) => e.key === active) ?? EONS[0];
  const duration = cur.startMa - cur.endMa;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      allowFullscreen={false}
      caption={
        <span>
          {t(cur.key)} · {duration.toLocaleString()} {t("myr")}
        </span>
      }
    >
      <div className="absolute inset-0 flex gap-3 px-4 pt-14 pb-4">
        {/* the proportional ribbon */}
        <div className="flex h-full w-16 flex-col overflow-hidden rounded-lg border border-border/50">
          {EONS.map((e) => {
            const h = ((e.startMa - e.endMa) / TOTAL) * 100;
            const on = e.key === active;
            return (
              <button
                key={e.key}
                type="button"
                onMouseEnter={() => setActive(e.key)}
                onFocus={() => setActive(e.key)}
                onClick={() => setActive(e.key)}
                className="group relative w-full cursor-pointer overflow-hidden transition-all"
                style={{ height: `${h}%` }}
                aria-label={t(e.key)}
              >
                <span
                  className="absolute inset-0 transition-opacity"
                  style={{
                    background: e.color,
                    opacity: on ? 0.85 : 0.4,
                  }}
                />
                {on && (
                  <span
                    className="absolute inset-0 animate-pulse"
                    style={{ boxShadow: `inset 0 0 16px ${e.color}` }}
                  />
                )}
                <span className="absolute inset-x-0 top-1 font-mono text-[7px] uppercase tracking-wider text-void">
                  {h > 6 ? t(`${e.key}Short`) : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* detail panel for the hovered eon */}
        <div className="flex flex-1 flex-col justify-center gap-2">
          <span
            className="font-mono text-sm font-semibold uppercase tracking-wide"
            style={{ color: cur.color }}
          >
            {t(cur.key)}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Readout
              label={t("start")}
              value={cur.startMa.toLocaleString()}
              unit={t("maAgo")}
              accent="cyan"
            />
            <Readout
              label={t("span")}
              value={duration.toLocaleString()}
              unit={t("myr")}
              accent="amber"
            />
          </div>
          <p className="max-w-[92%] font-sans text-[11px] leading-relaxed text-muted">
            {t(`${cur.key}Desc`)}
          </p>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
            {t("hint")}
          </span>
        </div>
      </div>

      {/* now / origin markers */}
      <span className="absolute left-4 top-12 font-mono text-[8px] uppercase tracking-wider text-muted">
        {t("present")}
      </span>
      <span className="absolute bottom-4 left-4 font-mono text-[8px] uppercase tracking-wider text-muted">
        {t("origin")}
      </span>
    </GlossaryFrame>
  );
}

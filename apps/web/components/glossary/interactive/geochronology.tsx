"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";

// Each method is a "clock" good over a bounded age window (log10 years). Outside
// its range the parent is either barely depleted (too young) or all gone (too
// old). Drag a target age and watch which clocks stay legible.
const METHODS = [
  { key: "carbon", loMinLog: 2, loLog: 2.5, hiLog: 4.7, color: "var(--teal)" },
  { key: "potassium", loMinLog: 4, loLog: 5, hiLog: 9.7, color: "var(--cyan)" },
  { key: "uranium", loMinLog: 6, loLog: 6.5, hiLog: 9.85, color: "var(--amber)" },
] as const;

const AGE_MIN_LOG = 2; // 100 yr
const AGE_MAX_LOG = 9.9; // ~8 Gyr

function fmtYears(log: number): string {
  const y = 10 ** log;
  if (y >= 1e9) return `${(y / 1e9).toFixed(2)} Gyr`;
  if (y >= 1e6) return `${(y / 1e6).toFixed(0)} Myr`;
  if (y >= 1e3) return `${(y / 1e3).toFixed(0)} kyr`;
  return `${Math.round(y)} yr`;
}

export default function Geochronology() {
  const t = useTranslations("viz.geochronology");
  const [ageLog, setAgeLog] = useState(6.8);

  const agePct = ((ageLog - AGE_MIN_LOG) / (AGE_MAX_LOG - AGE_MIN_LOG)) * 100;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAgeLog(6.8)}
      allowFullscreen={false}
      caption={
        <span>
          {t("target")}: <span className="text-cyan">{fmtYears(ageLog)}</span>
        </span>
      }
    >
      <div className="absolute inset-0 flex flex-col px-4 pt-14 pb-14">
        <div className="flex flex-1 flex-col justify-center gap-3">
          {METHODS.map((m) => {
            const usable = ageLog >= m.loLog && ageLog <= m.hiLog;
            const marginal =
              (ageLog >= m.loMinLog && ageLog < m.loLog) ||
              (ageLog > m.hiLog && ageLog <= m.hiLog + 0.3);
            const loPct = ((m.loLog - AGE_MIN_LOG) / (AGE_MAX_LOG - AGE_MIN_LOG)) * 100;
            const hiPct = ((m.hiLog - AGE_MIN_LOG) / (AGE_MAX_LOG - AGE_MIN_LOG)) * 100;
            return (
              <div key={m.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] uppercase tracking-wide"
                    style={{ color: usable ? m.color : "var(--muted)" }}
                  >
                    {t(m.key)}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      color: usable ? m.color : marginal ? "var(--amber)" : "var(--border-strong)",
                    }}
                  >
                    {usable ? t("reads") : marginal ? t("marginal") : t("blind")}
                  </span>
                </div>
                {/* the clock's usable window as a lit bar on a shared log axis */}
                <div className="relative h-5 overflow-hidden rounded-md border border-border/40 bg-void/60">
                  <div
                    className="absolute inset-y-0 rounded-sm"
                    style={{
                      left: `${loPct}%`,
                      width: `${hiPct - loPct}%`,
                      background: m.color,
                      opacity: usable ? 0.5 : 0.14,
                      boxShadow: usable ? `0 0 12px ${m.color}` : "none",
                    }}
                  />
                  {/* target-age needle */}
                  <div
                    className="absolute inset-y-0 w-px"
                    style={{ left: `${agePct}%`, background: "var(--foreground)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* shared log-time axis ticks */}
        <div className="mb-1 flex justify-between font-mono text-[8px] uppercase tracking-wider text-muted">
          <span>{t("recent")}</span>
          <span>{t("deep")}</span>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-12">
        <ControlSlider
          label={t("age")}
          value={ageLog}
          min={AGE_MIN_LOG}
          max={AGE_MAX_LOG}
          step={0.01}
          onChange={setAgeLog}
          display={fmtYears(ageLog)}
          thumb="cyan"
        />
      </div>
    </GlossaryFrame>
  );
}

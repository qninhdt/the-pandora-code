"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { GlossaryFrame } from "./shared/frame";

interface OccamsRazorProps {
  locale: string;
}

interface Assumption {
  id: string;
  labelEn: string;
  labelVi: string;
}

export default function OccamsRazor({ locale }: OccamsRazorProps) {
  const t = useTranslations("viz.occamsRazor");

  // Theory assumptions
  const [assumptionsA, setAssumptionsA] = useState<string[]>(["active"]);
  const [assumptionsB, setAssumptionsB] = useState<string[]>(["drones", "paint", "stealth"]);

  const assumptionsListA: Assumption[] = [
    {
      id: "active",
      labelEn: "Banshee was active in this area",
      labelVi: "Banshee kiếm ăn tại khu vực này",
    },
    {
      id: "hungry",
      labelEn: "Banshee was hungry (seeking prey)",
      labelVi: "Banshee đang đói (săn mồi)",
    },
  ];

  const assumptionsListB: Assumption[] = [
    {
      id: "drones",
      labelEn: "RDA deployed silent stealth drones",
      labelVi: "RDA đã triển khai drone tàng hình",
    },
    {
      id: "paint",
      labelEn: "Drones leaked glowing cyan chemical paint",
      labelVi: "Drone bị rò rỉ hóa chất phát quang màu lam",
    },
    {
      id: "stealth",
      labelEn: "Stealth drone intentionally snapped twigs to mark path",
      labelVi: "Drone cố tình bẻ gãy cành cây để đánh dấu",
    },
    {
      id: "wind",
      labelEn: "Heavy storm wind carried the drones here undetected",
      labelVi: "Cơn bão lớn đã thổi bay drone đến đây mà không bị phát hiện",
    },
  ];

  const toggleAssumptionA = (id: string) => {
    setAssumptionsA((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAssumptionB = (id: string) => {
    setAssumptionsB((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const scoreA = assumptionsA.length;
  const scoreB = assumptionsB.length;

  const maxAssumptionsThreshold = 2.5;

  const isShavedA = scoreA > maxAssumptionsThreshold;
  const isShavedB = scoreB > maxAssumptionsThreshold;

  const handleReset = () => {
    setAssumptionsA(["active"]);
    setAssumptionsB(["drones", "paint", "stealth"]);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("hint")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Comparator Columns */}
        <div className="w-full flex-1 flex gap-4 justify-between pb-32 pt-4">
          {/* Column Theory A */}
          <div
            className={`flex-1 flex flex-col justify-between p-3 border rounded-xl transition-all duration-300 ${
              isShavedA
                ? "bg-void/10 border-border/10 opacity-40 scale-[0.98]"
                : "bg-void/40 border-cyan/40 shadow-[0_0_10px_rgba(54,197,217,0.15)]"
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <h4 className="text-[11px] font-bold text-cyan font-mono uppercase tracking-wider">
                  {t("theoryA") || "Theory A"}
                </h4>
                <span className="text-[8px] font-mono text-muted">
                  {locale === "vi" ? "Giải thích Tự nhiên" : "Natural Explan."}
                </span>
              </div>

              <div className="relative w-full h-1.5 rounded bg-surface border border-border/15 overflow-hidden mt-1">
                <div
                  className="h-full bg-cyan transition-all duration-300"
                  style={{ width: `${(scoreA / 4) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-muted mt-0.5">
                {scoreA} {t("assumptions") || "assumptions"}
              </span>

              {/* Checkbox Items */}
              <div className="flex flex-col gap-1.5 mt-2">
                {assumptionsListA.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAssumptionA(a.id)}
                    className="flex items-start text-left gap-1.5 p-1 rounded hover:bg-surface-overlay transition-colors"
                  >
                    <span
                      className={`w-3 h-3 rounded flex items-center justify-center border font-mono text-[8px] mt-0.5 shrink-0 transition-colors ${
                        assumptionsA.includes(a.id)
                          ? "bg-cyan border-cyan text-void font-bold"
                          : "border-border"
                      }`}
                    >
                      {assumptionsA.includes(a.id) ? "✓" : ""}
                    </span>
                    <span className="text-[9px] font-sans leading-tight text-foreground/80 select-none">
                      {locale === "vi" ? a.labelVi : a.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shaved Overlay Status */}
            {isShavedA && (
              <div className="text-[9px] font-mono text-magenta text-center font-bold tracking-wide mt-2 animate-pulse">
                {locale === "vi" ? "✗ BỊ CẮT BỎ (QUÁ PHỨC TẠP)" : "✗ SHAVED (TOO COMPLEX)"}
              </div>
            )}
            {!isShavedA && (
              <div className="text-[9px] font-mono text-teal text-center font-bold tracking-wide mt-2">
                {locale === "vi" ? "✓ KHẢ THI (HỢP LÝ)" : "✓ PLAUSIBLE (PARSIMONIOUS)"}
              </div>
            )}
          </div>

          {/* Center Razor representation */}
          <div className="w-1 relative flex flex-col items-center">
            {/* Guide line */}
            <div className="absolute top-0 bottom-0 w-[1px] bg-border/20" />
            {/* Slicing Razor Line */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-8 h-[2px] bg-magenta/80 shadow-[0_0_8px_var(--magenta)] z-20 flex items-center justify-center transition-all duration-300"
              style={{ top: `${(maxAssumptionsThreshold / 4) * 100}%` }}
            >
              <span className="absolute -right-14 text-[6px] font-mono text-magenta/80 font-bold uppercase tracking-widest whitespace-nowrap">
                OCCAM'S RAZOR
              </span>
            </div>
          </div>

          {/* Column Theory B */}
          <div
            className={`flex-1 flex flex-col justify-between p-3 border rounded-xl transition-all duration-300 ${
              isShavedB
                ? "bg-void/10 border-border/10 opacity-40 scale-[0.98]"
                : "bg-void/40 border-cyan/40 shadow-[0_0_10px_rgba(54,197,217,0.15)]"
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <h4 className="text-[11px] font-bold text-cyan font-mono uppercase tracking-wider">
                  {t("theoryB") || "Theory B"}
                </h4>
                <span className="text-[8px] font-mono text-muted">
                  {locale === "vi" ? "Giả thuyết Phức tạp" : "Conspiratorial Explan."}
                </span>
              </div>

              <div className="relative w-full h-1.5 rounded bg-surface border border-border/15 overflow-hidden mt-1">
                <div
                  className="h-full bg-cyan transition-all duration-300"
                  style={{ width: `${(scoreB / 4) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-muted mt-0.5">
                {scoreB} {t("assumptions") || "assumptions"}
              </span>

              {/* Checkbox Items */}
              <div className="flex flex-col gap-1.5 mt-2">
                {assumptionsListB.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleAssumptionB(b.id)}
                    className="flex items-start text-left gap-1.5 p-1 rounded hover:bg-surface-overlay transition-colors"
                  >
                    <span
                      className={`w-3 h-3 rounded flex items-center justify-center border font-mono text-[8px] mt-0.5 shrink-0 transition-colors ${
                        assumptionsB.includes(b.id)
                          ? "bg-cyan border-cyan text-void font-bold"
                          : "border-border"
                      }`}
                    >
                      {assumptionsB.includes(b.id) ? "✓" : ""}
                    </span>
                    <span className="text-[9px] font-sans leading-tight text-foreground/80 select-none">
                      {locale === "vi" ? b.labelVi : b.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shaved Overlay Status */}
            {isShavedB && (
              <div className="text-[9px] font-mono text-magenta text-center font-bold tracking-wide mt-2 animate-pulse">
                {locale === "vi" ? "✗ BỊ CẮT BỎ (QUÁ PHỨC TẠP)" : "✗ SHAVED (TOO COMPLEX)"}
              </div>
            )}
            {!isShavedB && (
              <div className="text-[9px] font-mono text-teal text-center font-bold tracking-wide mt-2">
                {locale === "vi" ? "✓ KHẢ THI (HỢP LÝ)" : "✓ PLAUSIBLE (PARSIMONIOUS)"}
              </div>
            )}
          </div>
        </div>

        {/* HUD Readout Bottom */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2 z-10 text-[9.5px] font-mono">
          <div className="flex justify-between items-center">
            <span className="text-muted uppercase tracking-wide">{t("verdict") || "Verdict"}:</span>
            <span
              className={`font-bold uppercase tracking-wider text-[11px] ${
                scoreA === scoreB ? "text-amber" : scoreA < scoreB ? "text-teal" : "text-magenta"
              }`}
            >
              {scoreA === scoreB
                ? t("verdictTie") || "Equally plausible"
                : scoreA < scoreB
                  ? t("verdictA") || "Theory A is preferred"
                  : t("verdictB") || "Theory B is preferred"}
            </span>
          </div>
          <div className="text-[9.5px] text-muted/95 italic leading-snug border-t border-border/15 pt-2">
            {scoreA === scoreB &&
              (t("noteTie") || "Both require the same number of leaps of faith.")}
            {scoreA < scoreB &&
              (t("noteA") ||
                "Theory A demands fewer unproven assumptions and is the most parsimonious path.")}
            {scoreA > scoreB &&
              (t("noteB") ||
                "Theory B demands fewer unproven assumptions and is the most parsimonious path.")}
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}

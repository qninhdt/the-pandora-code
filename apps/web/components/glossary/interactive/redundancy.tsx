"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const PATHS0 = [
  { id: 0, y: 28, alive: true },
  { id: 1, y: 44, alive: true },
  { id: 2, y: 60, alive: true },
  { id: 3, y: 76, alive: true },
];

export default function Redundancy() {
  const t = useTranslations("viz.redundancy");
  const [paths, setPaths] = useState(PATHS0.map((p) => ({ ...p })));
  const left = paths.filter((p) => p.alive).length;
  const alive = left > 0;

  const sever = () => {
    setPaths((ps) => {
      const idx = ps.findIndex((p) => p.alive);
      if (idx < 0) return ps;
      return ps.map((p, i) => (i === idx ? { ...p, alive: false } : p));
    });
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPaths(PATHS0.map((p) => ({ ...p })))}
      allowFullscreen={false}
      caption={
        <span className={alive ? "text-teal" : "text-magenta"}>
          {alive ? t("alive") : t("dead")} · {t("paths")}: {left}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {/* source / sink */}
          <circle
            cx="16"
            cy="52"
            r="7"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth={1.2}
          />
          <circle
            cx="84"
            cy="52"
            r="7"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth={1.2}
          />
          <text
            x="16"
            y="53.5"
            textAnchor="middle"
            style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            S
          </text>
          <text
            x="84"
            y="53.5"
            textAnchor="middle"
            style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            T
          </text>
          {paths.map((p) => (
            <g key={p.id}>
              <path
                d={`M23 ${52} C40 ${p.y}, 60 ${p.y}, 77 ${52}`}
                fill="none"
                stroke={p.alive ? "var(--teal)" : "var(--magenta)"}
                strokeWidth={p.alive ? 1.6 : 0.8}
                opacity={p.alive ? 0.9 : 0.3}
                strokeDasharray={p.alive ? undefined : "2 1.5"}
              />
              {!p.alive && (
                <text
                  x="50"
                  y={p.y + 1}
                  textAnchor="middle"
                  style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--magenta)" }}
                >
                  ×
                </text>
              )}
            </g>
          ))}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("paths")} value={left} accent={alive ? "teal" : "magenta"} />
          <ControlButton onClick={sever} disabled={!alive} className="px-2.5">
            {t("sever")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

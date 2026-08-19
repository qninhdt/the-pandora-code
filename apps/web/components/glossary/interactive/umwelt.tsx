"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Five sensory bubbles — flip creatures; worlds overlap or diverge.
const CREATURES = [
  { key: "c1", vision: 0.9, electro: 0.1, chemical: 0.4, pressure: 0.3, magnetic: 0.2 },
  { key: "c2", vision: 0.3, electro: 0.9, chemical: 0.2, pressure: 0.5, magnetic: 0.1 },
  { key: "c3", vision: 0.5, electro: 0.2, chemical: 0.9, pressure: 0.4, magnetic: 0.2 },
  { key: "c4", vision: 0.4, electro: 0.3, chemical: 0.3, pressure: 0.9, magnetic: 0.2 },
  { key: "c5", vision: 0.6, electro: 0.2, chemical: 0.3, pressure: 0.3, magnetic: 0.95 },
] as const;

const SENSES = ["vision", "electro", "chemical", "pressure", "magnetic"] as const;

export default function Umwelt() {
  const t = useTranslations("viz.umwelt");
  const [idx, setIdx] = useState(0);
  const c = CREATURES[idx];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setIdx(0)}
      allowFullscreen={false}
      caption={<span className="text-cyan">{t("creature")} {idx + 1}/5</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {SENSES.map((s, i) => {
            const v = c[s];
            const ang = (i / SENSES.length) * Math.PI * 2 - Math.PI / 2;
            const r = 10 + v * 28;
            return (
              <g key={s}>
                <line x1="50" y1="44" x2={50 + Math.cos(ang) * r} y2={44 + Math.sin(ang) * r}
                  stroke="var(--cyan)" strokeWidth="1" opacity={0.4 + v * 0.6} />
                <circle cx={50 + Math.cos(ang) * r} cy={44 + Math.sin(ang) * r} r={2 + v * 3}
                  fill="var(--teal)" opacity={0.5 + v * 0.5} />
                <text x={50 + Math.cos(ang) * (r + 8)} y={44 + Math.sin(ang) * (r + 8)}
                  textAnchor="middle" style={{ fontSize: 2.1, fontFamily: "monospace", fill: "var(--muted)" }}>{t(s)}</text>
              </g>
            );
          })}
          <circle cx="50" cy="44" r="4" fill="var(--surface)" stroke="var(--amber)" strokeWidth="0.7" />
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("creature")} value={`${idx + 1}`} accent="cyan" />
        </div>
        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1">
          {CREATURES.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} className="rounded-lg border px-2.5 py-1 font-mono text-[10px]"
              style={{ borderColor: idx === i ? "var(--cyan)" : "var(--border-strong)", color: idx === i ? "var(--cyan)" : "var(--muted)", background: "var(--void)" }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}

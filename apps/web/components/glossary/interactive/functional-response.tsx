"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Holling Type I / II / III. Type II: aN/(1+a h N). Type III: a N²/(1+a h N²).
type FrType = "I" | "II" | "III";

function intake(type: FrType, N: number, a: number, h: number): number {
  if (type === "I") return Math.min(a * N, 1 / Math.max(h, 0.05));
  if (type === "II") return (a * N) / (1 + a * h * N);
  return (a * N * N) / (1 + a * h * N * N);
}

export default function FunctionalResponse() {
  const t = useTranslations("viz.functional-response");
  const [type, setType] = useState<FrType>("II");
  const [handling, setHandling] = useState(0.35);
  const a = 0.9;

  const curve = useMemo(() => {
    const pts: { n: number; f: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const n = (i / 40) * 10;
      pts.push({ n, f: intake(type, n, a, handling) });
    }
    return pts;
  }, [type, handling]);

  const maxF = Math.max(...curve.map((p) => p.f), 0.01);
  const toX = (n: number) => 10 + (n / 10) * 80;
  const toY = (f: number) => 70 - (f / maxF) * 48;
  const path = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.n).toFixed(2)} ${toY(p.f).toFixed(2)}`)
    .join(" ");

  // marker at mid density
  const nMark = 4;
  const fMark = intake(type, nMark, a, handling);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setType("II");
        setHandling(0.35);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("intake")} @ N=4 → <span className="text-cyan">{fMark.toFixed(2)}</span>
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
          <line x1="10" y1="70" x2="90" y2="70" stroke="var(--border-strong)" strokeWidth="0.4" />
          <line x1="10" y1="22" x2="10" y2="70" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x="50"
            y="78"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            prey N
          </text>
          <text
            x="6"
            y="46"
            textAnchor="middle"
            transform="rotate(-90 6 46)"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            f(N)
          </text>

          <path d={path} fill="none" stroke="var(--cyan)" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx={toX(nMark)} cy={toY(fMark)} r="1.8" fill="var(--amber)" />

          {/* asymptote 1/h for type II */}
          {type !== "I" && (
            <line
              x1="10"
              y1={toY(1 / Math.max(handling, 0.08))}
              x2="90"
              y2={toY(1 / Math.max(handling, 0.08))}
              stroke="var(--amber)"
              strokeWidth="0.4"
              strokeDasharray="2 1.5"
              opacity="0.7"
            />
          )}
        </svg>

        <div className="absolute left-3 top-14 flex gap-1.5">
          {(["I", "II", "III"] as FrType[]).map((tp) => (
            <ControlButton
              key={tp}
              variant={type === tp ? "active" : "default"}
              onClick={() => setType(tp)}
              className="px-2 py-1"
            >
              {tp === "I" ? t("typeI") : tp === "II" ? t("typeII") : t("typeIII")}
            </ControlButton>
          ))}
        </div>

        <div className="absolute right-3 top-14">
          <Readout label={t("intake")} value={fMark.toFixed(2)} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("handling")}
            value={handling}
            min={0.08}
            max={1.2}
            step={0.02}
            display={handling.toFixed(2)}
            onChange={setHandling}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

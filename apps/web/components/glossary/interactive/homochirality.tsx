"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One hand, or nothing works. A biosphere uses just one mirror-form of its chiral
// molecules — Earth life runs on almost entirely left-handed amino acids and right-
// handed sugars. No chemical law forced that choice, but once made, everything
// built afterward depends on it. Homochirality is what lets a protein fold: feed a
// chain of all-left residues and it settles into a clean working shape; mix in
// right-handed ones and the fold tangles into a useless knot. Slide the L/R purity
// and watch the structure form or fail.
export default function Homochirality() {
  const t = useTranslations("viz.homochirality");
  const [purity, setPurity] = useState(1); // 1 = all-left, 0.5 = racemic

  // fraction of residues that are the "wrong" hand
  const wrong = 1 - purity;
  const folds = purity > 0.88;
  const N = 18;

  // build a chain path: when pure, a compact folded coil; when contaminated,
  // wrong-handed residues kink the backbone into a tangle
  const points: { x: number; y: number; bad: boolean }[] = [];
  let x = 30;
  let y = 40;
  let dir = 0;
  for (let i = 0; i < N; i++) {
    // deterministic "is this residue wrong-handed": spread the wrong ones through the chain
    const bad = i / N < wrong && i % 2 === 1;
    // a clean fold turns consistently; a bad residue injects a reversed kink
    const turn = bad ? -1.7 : 0.62;
    dir += turn;
    x += Math.cos(dir) * 7;
    y += Math.sin(dir) * 7;
    // keep within view
    x = Math.max(18, Math.min(82, x));
    y = Math.max(20, Math.min(70, y));
    points.push({ x, y, bad });
  }

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPurity(1)}
      allowFullscreen={false}
      caption={
        folds ? (
          <span className="text-teal">{t("foldsCleanly")}</span>
        ) : (
          <span className="text-magenta">{t("misfolds")}</span>
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
          {/* folded-shape halo when it works */}
          {folds && <ellipse cx="50" cy="45" rx="26" ry="20" fill="var(--teal)" opacity="0.08" />}

          {/* the backbone chain */}
          <path
            d={path}
            fill="none"
            stroke={folds ? "var(--teal)" : "var(--magenta)"}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* residues, colored by hand */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2"
              fill={p.bad ? "var(--magenta)" : folds ? "var(--teal)" : "var(--cyan)"}
              opacity="0.9"
            />
          ))}

          {/* verdict glyph */}
          {folds ? (
            <text
              x="50"
              y="86"
              textAnchor="middle"
              className="fill-teal"
              style={{ fontSize: 3, fontFamily: "monospace" }}
            >
              {t("workingShape")}
            </text>
          ) : (
            <text
              x="50"
              y="86"
              textAnchor="middle"
              className="fill-magenta"
              style={{ fontSize: 3, fontFamily: "monospace" }}
            >
              {t("tangled")}
            </text>
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("purityLabel")}
            value={`${Math.round(purity * 100)}% L`}
            accent={folds ? "teal" : "magenta"}
          />
          <Readout
            label={t("fold")}
            value={folds ? t("native") : t("failed")}
            accent={folds ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("handedness")}
            value={purity}
            min={0.5}
            max={1}
            step={0.01}
            onChange={setPurity}
            display={folds ? t("homochiral") : t("mixed")}
            thumb={folds ? "teal" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

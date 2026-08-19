"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Handedness at the molecular scale. A chiral molecule comes in two mirror-image
// forms that can never be superimposed — same atoms, same bonds, opposite three-
// dimensional arrangement, exactly like a left and a right hand. Rotate the right-
// hand copy however you like and it never overlays the left. Because an enzyme
// recognizes shape, its pocket grips only one hand; the mirror form is usually
// biologically useless. From the Greek cheir, hand.
export default function Chirality() {
  const t = useTranslations("viz.chirality");
  const [rot, setRot] = useState(0); // rotation attempt on the right molecule, degrees

  // a chiral centre: 4 distinct groups. Left is fixed; right is its mirror,
  // then rotated by `rot`. They can never coincide because mirror ≠ rotation.
  const GROUPS = [
    { label: "a", angle: -90, color: "var(--cyan)" },
    { label: "b", angle: 30, color: "var(--teal)" },
    { label: "c", angle: 150, color: "var(--amber)" },
    { label: "d", angle: 210, color: "var(--magenta)" },
  ];

  // "match" score: how well the rotated right hand overlays the left. For a true
  // mirror image this maxes out well below perfect no matter the rotation.
  const rad = (rot * Math.PI) / 180;
  // best possible overlap of a reflected set under rotation stays low (~50%)
  const match = Math.round((0.5 + 0.18 * Math.cos(rad * 2)) * 100);
  const enzymeFits = false; // the mirror form never fits the left-handed pocket

  const molecule = (cx: number, mirror: boolean, spin: number) => (
    <g transform={`translate(${cx} 46)`}>
      <circle cx="0" cy="0" r="3" fill="var(--foreground)" opacity="0.9" />
      {GROUPS.map((g) => {
        const base = mirror ? 180 - g.angle : g.angle;
        const a = ((base + spin) * Math.PI) / 180;
        const ex = Math.cos(a) * 15;
        const ey = Math.sin(a) * 15;
        return (
          <g key={g.label}>
            <line x1="0" y1="0" x2={ex} y2={ey} stroke={g.color} strokeWidth="1.1" opacity="0.7" />
            <circle cx={ex} cy={ey} r="3.4" fill={g.color} opacity="0.85" />
            <text
              x={ex}
              y={ey + 1.2}
              textAnchor="middle"
              style={{ fontSize: 3, fontFamily: "monospace", fill: "var(--void)" }}
            >
              {g.label}
            </text>
          </g>
        );
      })}
    </g>
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setRot(0)}
      allowFullscreen={false}
      caption={
        <span>
          {t("overlap")}: <span className="text-magenta">{match}%</span> ·{" "}
          <span className="text-magenta">{t("neverAligns")}</span>
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
          {/* mirror line */}
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="66"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            opacity="0.5"
          />

          {/* left (reference) molecule */}
          {molecule(28, false, 0)}
          <text
            x="28"
            y="70"
            textAnchor="middle"
            className="fill-cyan"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("leftHand")}
          </text>

          {/* right (mirror) molecule, rotating with the slider */}
          {molecule(72, true, rot)}
          <text
            x="72"
            y="70"
            textAnchor="middle"
            className="fill-magenta"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("rightHand")}
          </text>

          {/* enzyme glove at the bottom — accepts left only */}
          <g transform="translate(50 84)">
            <path
              d="M-10 -4 Q -12 4 -4 5 L 4 5 Q 12 4 10 -4 Q 5 -1 0 -2 Q -5 -1 -10 -4 Z"
              fill="var(--surface)"
              stroke="var(--cyan)"
              strokeWidth="0.6"
              opacity="0.7"
            />
            <text
              x="0"
              y="2"
              textAnchor="middle"
              className="fill-cyan"
              style={{ fontSize: 2.6, fontFamily: "monospace" }}
            >
              {t("enzymePocket")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("overlapLabel")} value={`${match}%`} accent="magenta" />
          <Readout
            label={t("enzyme")}
            value={enzymeFits ? t("fits") : t("rejected")}
            accent="magenta"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("rotateAttempt")}
            value={rot}
            min={0}
            max={360}
            step={1}
            onChange={setRot}
            display={`${Math.round(rot)}°`}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

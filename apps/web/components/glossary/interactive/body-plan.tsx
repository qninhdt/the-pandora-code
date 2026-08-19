"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The architecture an animal is built on — its axes, its symmetry, the count and
// placement of repeated parts. Set the segment number and paint regional identity
// along the head-to-tail axis: head, thorax, abdomen. Most animals share a small
// handful of these plans, and each stays nearly fixed for hundreds of millions of
// years, because changing it early in the embryo cascades into collapse. This is
// the press Pandora stamped its whole six-limbed bestiary from.
const REGIONS = [
  { key: "head", color: "var(--amber)" },
  { key: "thorax", color: "var(--cyan)" },
  { key: "abdomen", color: "var(--teal)" },
];

export default function BodyPlan() {
  const t = useTranslations("viz.body-plan");
  const [segments, setSegments] = useState(8);
  // which region each segment belongs to (index into REGIONS), cycled by click
  const [assign, setAssign] = useState<number[]>(() => [0, 1, 1, 1, 2, 2, 2, 2]);

  const n = segments;
  const region = (i: number) => assign[i] ?? (i === 0 ? 0 : i < n * 0.5 ? 1 : 2);

  const cycle = (i: number) =>
    setAssign((prev) => {
      const base = Array.from(
        { length: n },
        (_, j) => prev[j] ?? (j === 0 ? 0 : j < n * 0.5 ? 1 : 2),
      );
      base[i] = (base[i] + 1) % REGIONS.length;
      return base;
    });

  const segW = 66 / n;
  const counts = REGIONS.map(
    (_, r) => Array.from({ length: n }, (_, i) => region(i)).filter((x) => x === r).length,
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setSegments(8);
        setAssign([0, 1, 1, 1, 2, 2, 2, 2]);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("tapToPaint")} ·{" "}
          {REGIONS.map((r, i) => (
            <span key={r.key} style={{ color: r.color }}>
              {t(r.key)} {counts[i]}
              {i < REGIONS.length - 1 ? " · " : ""}
            </span>
          ))}
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
          {/* head-to-tail axis */}
          <line x1="17" y1="40" x2="83" y2="40" stroke="var(--border-strong)" strokeWidth="0.4" />
          <text
            x="15"
            y="41"
            textAnchor="end"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("headEnd")}
          </text>

          {/* segments */}
          {Array.from({ length: n }, (_, i) => {
            const r = region(i);
            const x = 17 + i * segW;
            return (
              <rect
                key={i}
                x={x + 0.4}
                y={30}
                width={segW - 0.8}
                height={20}
                rx="1.5"
                fill={REGIONS[r].color}
                opacity="0.55"
                stroke={REGIONS[r].color}
                strokeWidth="0.5"
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label={`${t("segment")} ${i + 1} — ${t(REGIONS[r].key)}`}
                onClick={() => cycle(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    cycle(i);
                  }
                }}
              />
            );
          })}

          {/* mirrored ventral echo to read as a body */}
          {Array.from({ length: n }, (_, i) => {
            const r = region(i);
            const x = 17 + i * segW;
            return (
              <rect
                key={i}
                x={x + 0.4}
                y={52}
                width={segW - 0.8}
                height={5}
                rx="1"
                fill={REGIONS[r].color}
                opacity="0.25"
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("segmentsLabel")} value={n} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("segmentCount")}
            value={segments}
            min={3}
            max={12}
            step={1}
            onChange={(v) => setSegments(v)}
            display={t("segmentsN", { n })}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

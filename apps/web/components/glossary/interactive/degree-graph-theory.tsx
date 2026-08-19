"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Leaf = { id: number; angle: number };

export default function DegreeGraphTheory() {
  const t = useTranslations("viz.degree-graph-theory");
  const [leaves, setLeaves] = useState<Leaf[]>(() =>
    Array.from({ length: 3 }, (_, i) => ({ id: i, angle: (i / 3) * Math.PI * 2 - Math.PI / 2 })),
  );
  const [nextId, setNextId] = useState(3);
  const degree = leaves.length;

  const add = () => {
    if (leaves.length >= 12) return;
    const angle = leaves.length === 0 ? -Math.PI / 2 : leaves[leaves.length - 1].angle + (Math.PI * 2) / (leaves.length + 1);
    // redistribute angles evenly
    const n = leaves.length + 1;
    const id = nextId;
    setNextId((x) => x + 1);
    setLeaves(
      Array.from({ length: n }, (_, i) => ({
        id: i === n - 1 ? id : leaves[i]?.id ?? id,
        angle: (i / n) * Math.PI * 2 - Math.PI / 2,
      })),
    );
  };

  const drop = () => {
    if (leaves.length === 0) return;
    const n = leaves.length - 1;
    const kept = leaves.slice(0, n);
    setLeaves(
      kept.map((lf, i) => ({
        ...lf,
        angle: n === 0 ? 0 : (i / n) * Math.PI * 2 - Math.PI / 2,
      })),
    );
  };

  const cx = 50;
  const cy = 46;
  const R = 28;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setLeaves(
          Array.from({ length: 3 }, (_, i) => ({
            id: i,
            angle: (i / 3) * Math.PI * 2 - Math.PI / 2,
          })),
        );
        setNextId(3);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("degree")}: <span className="text-cyan">{degree}</span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {leaves.map((lf) => {
            const x = cx + Math.cos(lf.angle) * R;
            const y = cy + Math.sin(lf.angle) * R;
            return (
              <g key={lf.id}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="var(--teal)"
                  strokeWidth={1.1}
                  opacity={0.75}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill="var(--surface)"
                  stroke="var(--teal)"
                  strokeWidth={0.9}
                />
              </g>
            );
          })}
          <circle
            cx={cx}
            cy={cy}
            r={7.5}
            fill="var(--cyan)"
            opacity={0.25}
          />
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth={1.4}
          />
          <text
            x={cx}
            y={cy + 1.6}
            textAnchor="middle"
            style={{ fontSize: 4.5, fontFamily: "monospace", fill: "var(--cyan)", fontWeight: 700 }}
          >
            {degree}
          </text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("degree")} value={degree} accent="cyan" />
          <ControlButton onClick={add} className="px-2.5" disabled={degree >= 12}>
            {t("add")}
          </ControlButton>
          <ControlButton onClick={drop} className="px-2.5" disabled={degree === 0}>
            {t("drop")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

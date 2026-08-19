"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Piece = "head" | "notebook" | "teammate" | "board";

const WEIGHT: Record<Piece, number> = {
  head: 0.35,
  notebook: 0.2,
  teammate: 0.3,
  board: 0.15,
};

const POS: Record<Piece, { x: number; y: number }> = {
  head: { x: 28, y: 42 },
  notebook: { x: 55, y: 30 },
  teammate: { x: 72, y: 50 },
  board: { x: 48, y: 68 },
};

// Cognition lives across skull, tools, and place — toggle pieces offline.
export default function DistributedCognition() {
  const t = useTranslations("viz.distributed-cognition");
  const [on, setOn] = useState<Record<Piece, boolean>>({
    head: true,
    notebook: true,
    teammate: true,
    board: true,
  });

  const capacity = useMemo(
    () =>
      (Object.keys(WEIGHT) as Piece[]).reduce(
        (s, k) => s + (on[k] ? WEIGHT[k] : 0),
        0,
      ),
    [on],
  );
  const intact = capacity >= 0.99;
  const active = (Object.keys(on) as Piece[]).filter((k) => on[k]);

  const toggle = (k: Piece) => {
    if (k === "head") return; // skull always present as anchor
    setOn((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() =>
        setOn({ head: true, notebook: true, teammate: true, board: true })
      }
      allowFullscreen={false}
      caption={
        <span className={intact ? "text-teal" : "text-magenta"}>
          {intact ? t("intact") : t("degraded")} · {(capacity * 100).toFixed(0)}%
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
          {/* links between active pieces */}
          {active.map((a, i) =>
            active.slice(i + 1).map((b) => (
              <line
                key={`${a}-${b}`}
                x1={POS[a].x}
                y1={POS[a].y}
                x2={POS[b].x}
                y2={POS[b].y}
                stroke="var(--cyan)"
                strokeWidth="0.7"
                opacity={0.45}
              />
            )),
          )}

          {(Object.keys(POS) as Piece[]).map((k) => {
            const p = POS[k];
            const activeP = on[k];
            return (
              <g
                key={k}
                transform={`translate(${p.x} ${p.y})`}
                className={k === "head" ? undefined : "cursor-pointer"}
                onClick={() => toggle(k)}
                opacity={activeP ? 1 : 0.28}
              >
                <circle
                  r="8"
                  fill="var(--surface)"
                  stroke={activeP ? "var(--teal)" : "var(--magenta)"}
                  strokeWidth="0.8"
                />
                <text
                  y="1.2"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.4,
                    fontFamily: "monospace",
                    fill: activeP ? "var(--teal)" : "var(--magenta)",
                  }}
                >
                  {t(k).slice(0, 4)}
                </text>
              </g>
            );
          })}

          {/* capacity ring */}
          <circle
            cx="50"
            cy="50"
            r={12 + capacity * 18}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="0.5"
            opacity={0.35}
            strokeDasharray="2 2"
          />
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("capacity")}
            value={`${Math.round(capacity * 100)}%`}
            accent={intact ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute left-3 top-14 flex flex-wrap gap-1">
          {(["notebook", "teammate", "board"] as Piece[]).map((k) => (
            <ControlButton
              key={k}
              variant={on[k] ? "active" : "default"}
              onClick={() => toggle(k)}
              className="px-2 py-1"
            >
              {t(k)}
            </ControlButton>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}

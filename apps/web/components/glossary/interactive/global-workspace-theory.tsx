"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Module = "vision" | "sound" | "memory";

const MODS: { id: Module; x: number; y: number; color: string }[] = [
  { id: "vision", x: 22, y: 38, color: "var(--cyan)" },
  { id: "sound", x: 50, y: 28, color: "var(--amber)" },
  { id: "memory", x: 78, y: 38, color: "var(--magenta)" },
];

// Baars theater: modules compete; winner floods the lit global workspace.
export default function GlobalWorkspaceTheory() {
  const t = useTranslations("viz.global-workspace-theory");
  const [winner, setWinner] = useState<Module | null>("vision");
  const [pulse, setPulse] = useState(0);

  const inject = (m: Module) => {
    setWinner(m);
    setPulse((p) => p + 1);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setWinner("vision");
        setPulse(0);
      }}
      allowFullscreen={false}
      caption={
        <span className={winner ? "text-cyan" : "text-muted"}>
          {winner ? `${t("broadcast")}: ${t(winner)}` : t("dark")}
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
          {/* stage / workspace */}
          <ellipse
            cx="50"
            cy="72"
            rx="28"
            ry="10"
            fill="var(--cyan)"
            opacity={winner ? 0.2 + (pulse % 3) * 0.05 : 0.06}
            stroke="var(--cyan)"
            strokeWidth="0.7"
          />
          <text
            x="50"
            y="74"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("broadcast")}
          </text>

          {/* unconscious modules */}
          {MODS.map((m) => {
            const lit = winner === m.id;
            return (
              <g key={m.id}>
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={lit ? 9 : 7}
                  fill="var(--surface)"
                  stroke={m.color}
                  strokeWidth={lit ? 1.2 : 0.6}
                  opacity={lit ? 1 : 0.55}
                  className="cursor-pointer"
                  onClick={() => inject(m.id)}
                />
                <text
                  x={m.x}
                  y={m.y + 1}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.4,
                    fontFamily: "monospace",
                    fill: m.color,
                  }}
                >
                  {t(m.id).slice(0, 3)}
                </text>
                {/* broadcast beam */}
                {lit && (
                  <line
                    x1={m.x}
                    y1={m.y + 9}
                    x2="50"
                    y2="64"
                    stroke={m.color}
                    strokeWidth="1.2"
                    opacity={0.75}
                  />
                )}
                {!lit && (
                  <line
                    x1={m.x}
                    y1={m.y + 7}
                    x2="50"
                    y2="64"
                    stroke="var(--border-strong)"
                    strokeWidth="0.4"
                    strokeDasharray="1.5 1.5"
                    opacity={0.4}
                  />
                )}
              </g>
            );
          })}

          {/* spotlight */}
          {winner && (
            <polygon
              points="50,62 38,48 62,48"
              fill="var(--amber)"
              opacity={0.15}
            />
          )}
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("broadcast")}
            value={winner ? t(winner) : t("dark")}
            accent={winner ? "cyan" : "foreground"}
          />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          {MODS.map((m) => (
            <ControlButton
              key={m.id}
              variant={winner === m.id ? "active" : "default"}
              onClick={() => inject(m.id)}
              className="px-2 py-1"
            >
              {t("inject")} {t(m.id).slice(0, 3)}
            </ControlButton>
          ))}
        </div>
      </div>
    </GlossaryFrame>
  );
}

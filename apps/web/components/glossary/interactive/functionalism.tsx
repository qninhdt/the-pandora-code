"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Substrate = "neurons" | "silicon" | "roots";

const SUBS: { id: Substrate; x: number; color: string }[] = [
  { id: "neurons", x: 22, color: "var(--teal)" },
  { id: "silicon", x: 50, color: "var(--cyan)" },
  { id: "roots", x: 78, color: "var(--amber)" },
];

// Same function on three substrates. I/O matches; "anyone home?" raises the qualia objection.
export default function Functionalism() {
  const t = useTranslations("viz.functionalism");
  const [input, setInput] = useState(0);
  const [home, setHome] = useState(false);

  // deterministic "function" of input
  const output = (input * 3 + 1) % 7;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setInput(0);
        setHome(false);
      }}
      allowFullscreen={false}
      caption={
        <span className={home ? "text-magenta" : "text-teal"}>
          {home ? t("objection") : t("match")} · out={output}
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
          {/* shared input bus */}
          <line x1="10" y1="28" x2="90" y2="28" stroke="var(--cyan)" strokeWidth="0.7" />
          <circle cx="10" cy="28" r="3" fill="var(--cyan)" />
          <text
            x="10"
            y="22"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            in={input}
          </text>

          {SUBS.map((s) => (
            <g key={s.id}>
              <line
                x1={s.x}
                y1="28"
                x2={s.x}
                y2="44"
                stroke={s.color}
                strokeWidth="0.7"
              />
              <rect
                x={s.x - 10}
                y="44"
                width="20"
                height="16"
                rx="2"
                fill="var(--surface)"
                stroke={s.color}
                strokeWidth="0.8"
              />
              <text
                x={s.x}
                y="54"
                textAnchor="middle"
                style={{ fontSize: 2.3, fontFamily: "monospace", fill: s.color }}
              >
                {t(s.id).slice(0, 6)}
              </text>
              <line
                x1={s.x}
                y1="60"
                x2={s.x}
                y2="72"
                stroke={s.color}
                strokeWidth="0.7"
              />
              {/* identical outputs */}
              <circle cx={s.x} cy="76" r="4" fill={s.color} opacity={0.75} />
              <text
                x={s.x}
                y="77.2"
                textAnchor="middle"
                style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--void)" }}
              >
                {output}
              </text>

              {/* qualia gap overlay */}
              {home && (
                <text
                  x={s.x}
                  y="88"
                  textAnchor="middle"
                  style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
                >
                  ?
                </text>
              )}
            </g>
          ))}

          {!home && (
            <text
              x="50"
              y="90"
              textAnchor="middle"
              style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--teal)" }}
            >
              {t("match")}
            </text>
          )}
          {home && (
            <text
              x="50"
              y="94"
              textAnchor="middle"
              style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--magenta)" }}
            >
              {t("objection")}
            </text>
          )}
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={home ? t("home") : t("match")}
            value={home ? "?" : String(output)}
            accent={home ? "magenta" : "teal"}
          />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          <ControlButton
            onClick={() => setInput((v) => (v + 1) % 8)}
            className="px-2 py-1"
            variant="accent"
          >
            {t("input")}
          </ControlButton>
          <ControlButton
            variant={home ? "active" : "default"}
            onClick={() => setHome((h) => !h)}
            className="px-2 py-1"
          >
            {t("home")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const N = 8;

// Each flip is exactly one bit. Stack eight switches → a byte of message.
export default function Bit() {
  const t = useTranslations("viz.bit");
  const [bits, setBits] = useState<number[]>(() => Array(N).fill(0));

  const total = bits.length;
  const value = useMemo(() => bits.reduce((acc, b, i) => acc + b * 2 ** (N - 1 - i), 0), [bits]);
  const pattern = bits.join("");

  const flip = (i: number) => {
    setBits((prev) => {
      const next = prev.slice();
      next[i] = prev[i] ^ 1;
      return next;
    });
  };

  const reset = () => setBits(Array(N).fill(0));

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("message")}: {pattern} = {value}
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
          {bits.map((b, i) => {
            const x = 8 + i * 11;
            const on = b === 1;
            return (
              <g
                key={i}
                transform={`translate(${x} 42)`}
                className="cursor-pointer"
                onClick={() => flip(i)}
              >
                <rect
                  x="0"
                  y="0"
                  width="9"
                  height="22"
                  rx="2"
                  fill="var(--surface)"
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.7"
                />
                <circle
                  cx="4.5"
                  cy={on ? 6.5 : 15.5}
                  r="3.2"
                  fill={on ? "var(--cyan)" : "var(--magenta)"}
                  opacity={0.9}
                />
                <text
                  x="4.5"
                  y="30"
                  textAnchor="middle"
                  style={{
                    fontSize: 3,
                    fontFamily: "monospace",
                    fill: on ? "var(--cyan)" : "var(--magenta)",
                  }}
                >
                  {on ? t("one") : t("zero")}
                </text>
              </g>
            );
          })}

          {/* bit count ticks */}
          <text
            x="50"
            y="28"
            textAnchor="middle"
            style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {total} × 1 {t("title").toLowerCase()}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("total")} value={total} unit="bit" accent="cyan" />
          <Readout label={t("message")} value={value} accent="teal" />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          <ControlButton
            onClick={() => flip(Math.floor(Math.random() * N))}
            className="px-2 py-1"
            variant="accent"
          >
            {t("flip")}
          </ControlButton>
          <ControlButton
            onClick={() => setBits(Array.from({ length: N }, () => (Math.random() > 0.5 ? 1 : 0)))}
            className="px-2 py-1"
          >
            rnd
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Place thermals; ikran circles and altitude climbs for free.
export default function ThermalSoaring() {
  const t = useTranslations("viz.thermal-soaring");
  const [thermals, setThermals] = useState<{ x: number; y: number }[]>([
    { x: 30, y: 70 },
    { x: 62, y: 68 },
  ]);
  const altitude = 20 + thermals.length * 18;

  const addThermal = () => {
    if (thermals.length >= 5) return;
    setThermals((prev) => [...prev, { x: 18 + Math.random() * 64, y: 60 + Math.random() * 16 }]);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() =>
        setThermals([
          { x: 30, y: 70 },
          { x: 62, y: 68 },
        ])
      }
      allowFullscreen={false}
      caption={
        <span className="text-teal">
          {t("altitude")}: {altitude.toFixed(0)} m
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
          <line x1="8" y1="82" x2="92" y2="82" stroke="var(--border-strong)" strokeWidth="0.7" />
          {thermals.map((th, i) => (
            <g key={i}>
              <ellipse cx={th.x} cy={th.y} rx="8" ry="3" fill="var(--amber)" opacity="0.25" />
              <path
                d={`M${th.x} ${th.y} q -6 -14 0 -28 q 6 14 0 28`}
                fill="none"
                stroke="var(--amber)"
                strokeWidth="0.7"
                opacity="0.7"
              />
              {/* circling ikran */}
              <circle cx={th.x + 5} cy={th.y - 14 - i * 4} r="2.2" fill="var(--cyan)" />
            </g>
          ))}
          {/* altitude bar */}
          <rect
            x="90"
            y="20"
            width="4"
            height="55"
            rx="1"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          <rect
            x="90"
            y={75 - Math.min(55, altitude * 0.35)}
            width="4"
            height={Math.min(55, altitude * 0.35)}
            rx="1"
            fill="var(--teal)"
          />
        </svg>

        <div className="absolute right-3 top-14">
          <Readout label={t("altitude")} value={`${altitude.toFixed(0)} m`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center gap-1.5">
          <button
            type="button"
            onClick={addThermal}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: "var(--amber)",
              color: "var(--amber)",
              background: "var(--void)",
            }}
          >
            {t("place")}
          </button>
          <button
            type="button"
            onClick={() => setThermals([])}
            className="rounded-lg border px-3 py-1 font-mono text-[10px] uppercase"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("clear")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}

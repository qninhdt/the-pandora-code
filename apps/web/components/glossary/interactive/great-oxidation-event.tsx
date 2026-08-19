"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Atmospheric composition across 2.4 Gyr as a stacked bar that morphs from a
// reducing haze (methane, CO₂, no free O₂) to the oxidizing air we breathe. As
// oxygen climbs past a threshold, a "rust horizon" appears in the rock column on
// the left — banded iron, the geological fingerprint of the moment cyanobacteria
// remade a planet's sky. Scrub time, or press play to run it.
export default function GreatOxidationEvent() {
  const t = useTranslations("viz.great-oxidation-event");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrub, setScrub] = useState(0.15); // 0 = 3 Gya, 1 = today
  const auto = useRef(0.15);
  const playing = useRef(true);
  playing.current = isPlaying;
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      if (playing.current) {
        auto.current = (auto.current + dt * 0.12) % 1;
        setScrub(auto.current);
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // gas fractions as a function of time (0..1). Before GOE (~t<0.35) no free O2.
  const goe = 0.38;
  const o2 = scrub < goe ? 0 : Math.min(0.23, ((scrub - goe) / (1 - goe)) * 0.23);
  const ch4 = Math.max(0.01, 0.18 * (1 - scrub / goe) * (scrub < goe ? 1 : 0.05));
  const co2 = Math.max(0.16, 0.55 - scrub * 0.4);
  const n2 = Math.max(0, 1 - o2 - ch4 - co2);
  const rustJustFormed = scrub >= goe && scrub < goe + 0.12;

  const gya = (3 - scrub * 3).toFixed(1);

  // stacked bar segments (bottom→top)
  const segs = [
    { key: "n2", v: n2, color: "#414855" },
    { key: "co2", v: co2, color: "var(--amber)" },
    { key: "ch4", v: ch4, color: "var(--magenta)" },
    { key: "o2", v: o2, color: "var(--cyan)" },
  ];

  let yCursor = 86;
  const BAR_H = 64;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        auto.current = 0.15;
        setScrub(0.15);
      }}
      caption={
        <span>
          {gya} <span className="text-muted">{t("gya")}</span> ·{" "}
          {scrub < goe ? (
            <span className="text-magenta">{t("reducing")}</span>
          ) : (
            <span className="text-cyan">{t("oxidizing")}</span>
          )}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* rock column with rust horizon (left) */}
          <rect
            x="10"
            y="22"
            width="16"
            height="64"
            fill="#1a1410"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          {/* strata */}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={i}
              x1="10"
              y1={24 + i * 6.2}
              x2="26"
              y2={24 + i * 6.2}
              stroke="#0a0806"
              strokeWidth="0.4"
            />
          ))}
          {/* rust horizon appears at GOE level */}
          {scrub >= goe && (
            <rect
              x="10"
              y={86 - ((scrub - goe) / (1 - goe)) * 40 - 3}
              width="16"
              height="3"
              fill="var(--amber)"
              opacity={rustJustFormed ? 0.95 : 0.6}
            />
          )}
          <text
            x="18"
            y="20"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("rockColumn")}
          </text>

          {/* the atmosphere stacked bar (right) */}
          {segs.map((s) => {
            const h = s.v * BAR_H;
            const y = yCursor - h;
            yCursor = y;
            if (h < 0.3) return null;
            return (
              <rect key={s.key} x="46" y={y} width="40" height={h} fill={s.color} opacity="0.85" />
            );
          })}
          <rect
            x="46"
            y="22"
            width="40"
            height="64"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />
          <text
            x="66"
            y="20"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("atmosphere")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Legend
            vertical
            items={[
              { color: "var(--cyan)", label: `${t("o2")} ${Math.round(o2 * 100)}%` },
              { color: "var(--magenta)", label: t("ch4") },
              { color: "var(--amber)", label: t("co2") },
            ]}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("time")}
            value={scrub}
            min={0}
            max={1}
            step={0.005}
            onChange={(v) => {
              setIsPlaying(false);
              auto.current = v;
              setScrub(v);
            }}
            display={`${gya} ${t("gya")}`}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

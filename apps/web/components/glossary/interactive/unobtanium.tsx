"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

export default function Unobtanium() {
  const t = useTranslations("viz.unobtanium");
  // 0 = free left, 1 = centered over track (pinned)
  const [pos, setPos] = useState(0.2);
  const [tick, setTick] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  useRafLoop(() => setTick((n) => (n + 1) % 1_000_000), { active: inView });

  const pinned = pos >= 0.78;
  // ore centre
  const ox = 22 + pos * 36;
  const oy = pinned ? 38 : 34 + Math.sin(tick * 0.08) * 1.2;
  const gap = pinned ? 10 : 16 + (1 - pos) * 4;

  // magnet track bar
  const t1 = { x: 38, y: 58 };
  const t2 = { x: 78, y: 58 };

  const threads = pinned
    ? [-1, 0, 1].map((o) => ({
        ax: 58 + o * 8,
        ay: 58,
        bx: ox + o * 5,
        by: oy + 6,
      }))
    : [];

  const corePulse = 0.55 + 0.35 * Math.sin(tick * 0.12);

  const reset = useCallback(() => setPos(0.2), []);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      caption={
        pinned ? (
          <span className="text-amber">{t("pinned")}</span>
        ) : (
          <span className="text-muted">{t("free")}</span>
        )
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
          <defs>
            <radialGradient id="uno-core" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity={String(0.95 * corePulse)} />
              <stop offset="45%" stopColor="var(--amber)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1a2a30" stopOpacity="0.95" />
            </radialGradient>
            <linearGradient id="uno-rock" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a3a42" />
              <stop offset="100%" stopColor="#121a1e" />
            </linearGradient>
            <filter id="uno-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="0.7" />
            </filter>
          </defs>

          {/* gravity cue */}
          <g transform="translate(90 12)" opacity="0.45">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--muted)" strokeWidth="0.4" />
            <path d="M-1.4 5.5 L0 8 L1.4 5.5" fill="none" stroke="var(--muted)" strokeWidth="0.4" />
            <text
              x="0"
              y="-1.5"
              textAnchor="middle"
              className="fill-muted"
              style={{ fontSize: 2.4, fontFamily: "monospace" }}
            >
              g
            </text>
          </g>

          {/* magnet track */}
          <line
            x1={t1.x}
            y1={t1.y}
            x2={t2.x}
            y2={t2.y}
            stroke="var(--magenta)"
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity="0.75"
          />
          <line
            x1={t1.x}
            y1={t1.y}
            x2={t2.x}
            y2={t2.y}
            stroke="var(--magenta)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          <text
            x="58"
            y="68"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.5, fontFamily: "monospace" }}
          >
            {t("track")}
          </text>

          {/* flux threads when pinned */}
          {threads.map((th, i) => (
            <g key={i}>
              <line
                x1={th.ax}
                y1={th.ay}
                x2={th.bx}
                y2={th.by}
                stroke="var(--cyan)"
                strokeWidth="0.75"
                opacity="0.7"
              />
              <circle cx={th.bx} cy={th.by} r="0.7" fill="var(--cyan)" opacity="0.8" />
            </g>
          ))}

          {/* field haze under ore when near track */}
          {pos > 0.5 && (
            <ellipse
              cx={ox}
              cy={oy + 10}
              rx="14"
              ry="4"
              fill="var(--cyan)"
              opacity={0.04 + (pinned ? 0.08 : 0.03)}
              filter="url(#uno-glow)"
            />
          )}

          {/* ore chunk */}
          <g transform={`translate(${ox} ${oy})`}>
            {/* outer rock */}
            <polygon
              points="-11,-5 -4,-9 8,-7 12,1 6,8 -7,7 -12,1"
              fill="url(#uno-rock)"
              stroke="var(--teal)"
              strokeWidth="0.45"
              opacity="0.95"
            />
            {/* fracture face */}
            <polygon
              points="-6,-3 2,-5 7,0 1,5 -5,3"
              fill="url(#uno-core)"
              stroke="var(--amber)"
              strokeWidth="0.35"
              opacity="0.95"
            />
            {/* bioluminescent veins */}
            <path
              d="M-4 -1 Q0 -3 4 0"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="0.35"
              opacity="0.55"
            />
            <path
              d="M-2 2 Q2 1 5 3"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="0.3"
              opacity="0.45"
            />
            {/* amber core bloom */}
            <circle
              cx="1"
              cy="0"
              r={2.2 + corePulse * 0.6}
              fill="var(--amber)"
              opacity={0.25 * corePulse}
              filter="url(#uno-glow)"
            />
          </g>

          <text
            x={ox}
            y={oy - 12}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.4, fontFamily: "monospace" }}
          >
            {t("ore")}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col items-end gap-1.5">
          <Readout
            label={t("lock")}
            value={pinned ? t("pinned") : t("free")}
            accent={pinned ? "amber" : "foreground"}
          />
          <Readout label={t("gap")} value={gap.toFixed(1)} unit="u" accent="cyan" />
          <Readout label={t("coreTemp")} value="RT" accent="amber" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("ore")}
            value={pos}
            min={0}
            max={1}
            step={0.01}
            onChange={setPos}
            display={pinned ? t("pinned") : t("free")}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

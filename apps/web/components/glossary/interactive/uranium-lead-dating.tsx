"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Two uranium isotopes decay to two lead isotopes at two very different rates,
// giving two independent clocks in one crystal. Plotted against each other they
// trace the "concordia" curve; an undisturbed zircon sits exactly on it. The
// agreement of the two clocks is the method's built-in lie detector.
const T238 = 4.468; // Gyr, half-life-ish decay constant scale for 238U→206Pb
const T235 = 0.704; // Gyr, for 235U→207Pb (decays far faster)
const MAX_GYR = 4.5;

const PLOT = { x0: 14, y0: 82, w: 74, h: 62 };

export default function UraniumLeadDating() {
  const t = useTranslations("viz.uranium-lead-dating");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [isPlaying, setIsPlaying] = useState(true);

  const ageRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      ageRef.current = (ageRef.current + dt * 0.4) % MAX_GYR;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const age = ageRef.current;
  // fraction of Pb produced by each chain (1 − 2^(−t/T))
  const pb206 = 1 - 2 ** (-age / T238);
  const pb207 = 1 - 2 ** (-age / T235);

  const sx = (v: number) => PLOT.x0 + v * PLOT.w;
  const sy = (v: number) => PLOT.y0 - v * PLOT.h;

  // concordia curve (both clocks agree) parameterised by time
  const concordia = Array.from({ length: 61 }, (_, k) => {
    const a = (k / 60) * MAX_GYR;
    const x = 1 - 2 ** (-a / T235);
    const y = 1 - 2 ** (-a / T238);
    return `${k === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
  }).join(" ");

  const zirconFill = 0.15 + ((pb206 + pb207) / 2) * 0.5;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        ageRef.current = 0;
      }}
      caption={
        <span>
          {t("age")}: <span className="text-amber">{age.toFixed(2)}</span> {t("gyr")} ·{" "}
          {t("concordant")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0 flex items-center gap-3 px-4 pt-14 pb-4">
        {/* zircon cross-section, lead accumulating as amber bloom */}
        <svg
          viewBox="0 0 44 100"
          className="h-full shrink-0"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("crystalAria")}
        >
          <defs>
            <radialGradient id="ul-core" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity={zirconFill} />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          {/* faceted zircon hull */}
          <polygon
            points="22,8 34,26 32,74 22,92 12,74 10,26"
            fill="url(#ul-core)"
            stroke="var(--teal)"
            strokeWidth="0.8"
          />
          {/* concentric growth zones */}
          {[0.75, 0.55, 0.35].map((s, i) => (
            <polygon
              key={i}
              points={`22,${8 + 40 * (1 - s)} ${22 + 12 * s},${26 + 24 * (1 - s)} ${22 + 10 * s},${74 - 18 * (1 - s)} 22,${92 - 40 * (1 - s)} ${22 - 10 * s},${74 - 18 * (1 - s)} ${22 - 12 * s},${26 + 24 * (1 - s)}`}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="0.3"
              opacity="0.3"
            />
          ))}
          {/* lead specks appear as decay proceeds */}
          {Array.from({ length: 20 }, (_, i) => {
            const show = i / 20 < (pb206 + pb207) / 2;
            const ang = i * 2.4;
            const rr = 4 + (i % 5) * 3;
            return (
              <circle
                key={i}
                cx={22 + Math.cos(ang) * rr}
                cy={50 + Math.sin(ang) * rr * 1.6}
                r="0.9"
                fill="var(--amber)"
                opacity={show ? 0.9 : 0}
              />
            );
          })}
        </svg>

        {/* concordia diagram: the two clocks cross-checking */}
        <div className="flex flex-1 flex-col gap-2">
          <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label={t("concordiaAria")}>
            <line
              x1={PLOT.x0}
              y1={PLOT.y0}
              x2={PLOT.x0 + PLOT.w}
              y2={PLOT.y0}
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />
            <line
              x1={PLOT.x0}
              y1={PLOT.y0}
              x2={PLOT.x0}
              y2={PLOT.y0 - PLOT.h}
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />
            <path d={concordia} fill="none" stroke="var(--teal)" strokeWidth="1" opacity="0.7" />
            {/* the grain's current position — rides exactly on concordia */}
            <circle cx={sx(pb207)} cy={sy(pb206)} r="2" fill="var(--amber)" />
            <circle cx={sx(pb207)} cy={sy(pb206)} r="3.4" fill="var(--amber)" opacity="0.2" />
            <text
              x={PLOT.x0 + PLOT.w / 2}
              y="96"
              textAnchor="middle"
              className="fill-muted"
              style={{ fontSize: 3.4, fontFamily: "monospace" }}
            >
              {t("xAxis")}
            </text>
            <text
              x="5"
              y={PLOT.y0 - PLOT.h / 2}
              textAnchor="middle"
              transform={`rotate(-90 5 ${PLOT.y0 - PLOT.h / 2})`}
              className="fill-muted"
              style={{ fontSize: 3.4, fontFamily: "monospace" }}
            >
              {t("yAxis")}
            </text>
          </svg>
          <div className="flex flex-wrap gap-1.5">
            <Readout label="²⁰⁷Pb/²³⁵U" value={`${(pb207 * 100).toFixed(0)}%`} accent="cyan" />
            <Readout label="²⁰⁶Pb/²³⁸U" value={`${(pb206 * 100).toFixed(0)}%`} accent="amber" />
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}

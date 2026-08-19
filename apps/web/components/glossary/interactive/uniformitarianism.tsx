"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// "The present is the key to the past." Watch a slow rate today, then run that
// same rate backward: a barely-perceptible millimetre per year stacks into
// kilometres of strata across deep time. Left = the observable now; right = the
// reconstruction. The slider is the single measured rate that ties them together.
const STRATA_COLORS = ["var(--cyan)", "var(--teal)", "#6c5ce7", "var(--amber)"];

export default function Uniformitarianism() {
  const t = useTranslations("viz.uniformitarianism");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [rate, setRate] = useState(1.0); // mm / yr, the observed present rate
  const [isPlaying, setIsPlaying] = useState(true);

  const depositRef = useRef(0); // accumulated "present" sediment (visual units)
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      depositRef.current = (depositRef.current + dt * rate * 6) % 40;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const present = depositRef.current;
  // Extrapolate: total thickness a constant rate builds over deep time.
  const yearsForKm = (1_000_000 / rate).toFixed(0); // yr to lay 1 km at this rate
  const kmPerGyr = ((rate * 1e9) / 1e6).toFixed(0); // km built per Gyr

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        depositRef.current = 0;
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("rate")} {rate.toFixed(1)} {t("mmYr")} → {kmPerGyr} {t("kmGyr")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0 grid grid-cols-2 gap-px pt-14">
        {/* LEFT — the observable present: a river laying a thin band */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#0b1120] to-[#070a14]">
          <span className="absolute left-2 top-2 z-10 font-mono text-[9px] uppercase tracking-wider text-cyan">
            {t("today")}
          </span>
          <svg
            viewBox="0 0 50 100"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={t("today")}
          >
            {/* river surface */}
            <rect x="0" y="0" width="50" height="46" fill="var(--cyan)" opacity="0.06" />
            {/* falling silt particles */}
            {Array.from({ length: 14 }, (_, i) => {
              const px = (i * 37) % 50;
              const py = (present * 2 + i * 13) % 46;
              return <circle key={i} cx={px} cy={py} r="0.5" fill="var(--teal)" opacity="0.5" />;
            })}
            {/* the single accreting present-day layer */}
            <rect
              x="0"
              y={92 - present}
              width="50"
              height={present + 8}
              fill="var(--teal)"
              opacity="0.4"
            />
            <line
              x1="0"
              y1={92 - present}
              x2="50"
              y2={92 - present}
              stroke="var(--teal)"
              strokeWidth="0.6"
            />
          </svg>
        </div>

        {/* RIGHT — the reconstruction: the same rate stacked over deep time */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#0b1120] to-[#05070f]">
          <span className="absolute left-2 top-2 z-10 font-mono text-[9px] uppercase tracking-wider text-amber">
            {t("deepPast")}
          </span>
          <svg
            viewBox="0 0 50 100"
            className="h-full w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={t("deepPast")}
          >
            {/* many stacked strata; more/thicker with higher rate */}
            {Array.from({ length: 22 }, (_, i) => {
              const h = 100 / 22;
              const y = i * h;
              const col = STRATA_COLORS[i % STRATA_COLORS.length];
              // higher rate → deeper visible layering (more opacity variance)
              const op = 0.12 + ((i * 7 + Math.round(rate * 10)) % 5) * 0.05;
              return (
                <rect key={i} x="0" y={y} width="50" height={h + 0.3} fill={col} opacity={op} />
              );
            })}
            {/* accumulation arrow */}
            <line
              x1="46"
              y1="6"
              x2="46"
              y2="94"
              stroke="var(--amber)"
              strokeWidth="0.4"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      <div className="absolute right-3 top-16">
        <Readout
          label={t("perKm")}
          value={Number(yearsForKm).toLocaleString()}
          unit={t("yr")}
          accent="amber"
        />
      </div>

      <div className="absolute inset-x-3 bottom-12">
        <ControlSlider
          label={t("depositRate")}
          value={rate}
          min={0.1}
          max={3}
          step={0.1}
          onChange={setRate}
          display={`${rate.toFixed(1)} ${t("mmYr")}`}
          thumb="teal"
        />
      </div>
    </GlossaryFrame>
  );
}

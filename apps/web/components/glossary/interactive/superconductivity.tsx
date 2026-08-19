"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The current that never stops. Start a current in a closed loop of ordinary
// metal and resistance bleeds it to nothing in a heartbeat. Start one in a
// superconducting ring below Tc and it runs — no battery, no voltage, no measured
// loss — as long as anyone has been able to watch. Cool the ring past Tc and the
// carriers stream forever; warm it above and resistance returns, the glow dims,
// the current decays away. Onnes found this in mercury in 1911; it is the first
// of the chapter's two miracles, the one that costs nothing to keep.
export default function Superconductivity() {
  const t = useTranslations("viz.superconductivity");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [temp, setTemp] = useState(0.3); // 0..1, Tc at 0.5
  const angle = useRef(0);
  const current = useRef(0.9);
  const force = useState(0)[1];

  const TC = 0.5;
  const superconducting = temp < TC;

  useRafLoop(
    (dt) => {
      // above Tc the current decays toward zero; below Tc it persists
      const target = superconducting ? 1 : 0;
      const rate = superconducting ? 2.5 : 0.6;
      current.current += (target - current.current) * Math.min(1, dt * rate);
      angle.current = (angle.current + dt * current.current * 1.8) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const I = current.current;
  const cx = 50;
  const cy = 46;
  const R = 26;
  const N = 14; // carriers around the ring

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setTemp(0.3);
        current.current = 0.9;
      }}
      allowFullscreen={false}
      caption={
        superconducting ? (
          <span className="text-teal">{t("persists")}</span>
        ) : (
          <span className="text-magenta">{t("decays")}</span>
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
          {/* glow halo scaling with current */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={2 + I * 6}
            opacity={I * 0.18}
          />
          {/* the ring conductor */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="3" />
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={superconducting ? "var(--teal)" : "var(--amber)"}
            strokeWidth="1.4"
            opacity={0.3 + I * 0.6}
          />

          {/* carriers streaming around */}
          {Array.from({ length: N }, (_, i) => {
            const a = angle.current + (i / N) * Math.PI * 2;
            const x = cx + Math.cos(a) * R;
            const y = cy + Math.sin(a) * R;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={1.3}
                fill={superconducting ? "var(--cyan)" : "var(--amber)"}
                opacity={0.25 + I * 0.65}
              />
            );
          })}

          {/* current-direction arrow */}
          {I > 0.1 && (
            <g transform={`translate(${cx + R} ${cy}) rotate(90)`}>
              <path
                d="M-2 0 L2 0 M0.4 -1.6 L2 0 L0.4 1.6"
                stroke={superconducting ? "var(--teal)" : "var(--amber)"}
                strokeWidth="0.7"
                fill="none"
                opacity={0.4 + I * 0.5}
              />
            </g>
          )}

          {/* no power source label at ring centre */}
          <text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("noSource")}
          </text>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("currentLabel")}
            value={`${Math.round(I * 100)}%`}
            accent={superconducting ? "teal" : "amber"}
          />
          <Readout
            label={t("resistanceLabel")}
            value={superconducting ? "0" : "R>0"}
            accent={superconducting ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("temperature")}
            value={temp}
            min={0}
            max={1}
            step={0.01}
            onChange={setTemp}
            display={superconducting ? t("belowTc") : t("aboveTc")}
            thumb={superconducting ? "teal" : "amber"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

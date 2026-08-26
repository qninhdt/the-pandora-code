"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 44;
const MOON_R = 22;

export default function Libration() {
  const t = useTranslations("viz.libration");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [librating, setLibrating] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const phaseRef = useRef(0);
  const [, force] = useState(0);

  useRafLoop(
    (_, elapsed) => {
      phaseRef.current = elapsed;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const phase = phaseRef.current;
  // longitude libration: rocking left-right; latitude: nodding up-down.
  const lon = librating ? Math.sin(phase * 0.9) * 7 : 0; // degrees
  const lat = librating ? Math.sin(phase * 0.62) * 5 : 0;

  // The near-side disc rotates by lon; we shift surface markings to reveal limb slivers.
  const shift = (lon / 7) * 6;
  const nod = (lat / 5) * 4;
  // % of surface revealed over a cycle: 50 locked, ~59 librating.
  const visible = librating ? 59 : 50;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        phaseRef.current = 0;
      }}
      caption={
        <span style={{ color: librating ? "var(--teal)" : "var(--muted)" }}>
          {librating ? t("on") : t("off")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 88"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="lib-moon" cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#3a597a" />
              <stop offset="70%" stopColor="#22364f" />
              <stop offset="100%" stopColor="#0e1828" />
            </radialGradient>
            <clipPath id="lib-disk">
              <circle cx={CX} cy={CY} r={MOON_R} />
            </clipPath>
          </defs>

          {/* fixed reference frame: the host direction marker (planet below) */}
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY + MOON_R + 14}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.5"
          />
          <circle
            cx={CX}
            cy={CY + MOON_R + 18}
            r="4"
            fill="var(--surface-raised)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />

          {/* libration envelope ring — area swept into view */}
          {librating && (
            <circle
              cx={CX}
              cy={CY}
              r={MOON_R + 2}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="0.6"
              strokeDasharray="1.5 2"
              opacity="0.4"
            />
          )}

          <circle cx={CX} cy={CY} r={MOON_R} fill="url(#lib-moon)" />

          {/* surface markings shift with libration to reveal limb slivers */}
          <g clipPath="url(#lib-disk)">
            {/* central marker = the point that faces the host on average */}
            <circle cx={CX + shift} cy={CY + nod} r="3" fill="var(--cyan)" opacity="0.8" />
            <circle cx={CX + shift - 9} cy={CY + nod - 6} r="2" fill="#3a5572" opacity="0.5" />
            <ellipse
              cx={CX + shift + 8}
              cy={CY + nod + 5}
              rx="4"
              ry="3"
              fill="#2c425f"
              opacity="0.7"
            />
            <circle cx={CX + shift + 11} cy={CY + nod - 7} r="1.6" fill="#34506f" opacity="0.6" />
            <ellipse
              cx={CX + shift - 7}
              cy={CY + nod + 8}
              rx="3"
              ry="2"
              fill="#34506f"
              opacity="0.55"
            />
          </g>

          {/* limb highlight */}
          <circle
            cx={CX}
            cy={CY}
            r={MOON_R}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.5"
            opacity="0.35"
          />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("visible")} value={`${visible}%`} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlButton
            variant={librating ? "active" : "default"}
            onClick={() => setLibrating((v) => !v)}
          >
            {t("wobble")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

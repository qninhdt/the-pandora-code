"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Two patches. Source: b > d. Sink: b < d, persists only via immigration m.
// dS/dt = (bS − dS) S − m S_out + …
export default function SourceSinkDynamics() {
  const t = useTranslations("viz.source-sink-dynamics");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [migration, setMigration] = useState(0.25);
  const [isPlaying, setIsPlaying] = useState(true);

  const srcRef = useRef(40);
  const snkRef = useRef(8);
  const [, force] = useState(0);

  // fixed vital rates
  const bSrc = 0.55;
  const dSrc = 0.25;
  const bSnk = 0.2;
  const dSnk = 0.45;
  const Ksrc = 60;
  const Ksnk = 40;

  useRafLoop(
    (dt) => {
      let S = srcRef.current;
      let K = snkRef.current;
      const m = migration;
      // density-dependent local growth + migration source → sink (net)
      const gS = (bSrc - dSrc) * S * (1 - S / Ksrc);
      const gK = (bSnk - dSnk) * K * (1 - K / Math.max(Ksnk, 1));
      // migrants leave source proportional to m·S, arrive in sink
      const flow = m * S * 0.35;
      S = Math.max(0.5, S + (gS - flow) * dt * 1.8);
      K = Math.max(0.2, K + (gK + flow * 0.85) * dt * 1.8);
      srcRef.current = S;
      snkRef.current = K;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const S = srcRef.current;
  const K = snkRef.current;
  const sinkAlive = K > 2;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        srcRef.current = 40;
        snkRef.current = 8;
        setMigration(0.25);
        setIsPlaying(true);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("source")} <span className="text-teal">{S.toFixed(0)}</span> → {t("sink")}{" "}
          <span className={sinkAlive ? "text-cyan" : "text-magenta"}>{K.toFixed(0)}</span>
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
          {/* source patch */}
          <rect
            x="10"
            y="22"
            width="32"
            height="40"
            rx="3"
            fill="var(--teal)"
            opacity="0.12"
            stroke="var(--teal)"
            strokeWidth="0.7"
          />
          <text
            x="26"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            {t("source")}
          </text>
          {/* pop bars inside */}
          <rect
            x="18"
            y={54 - (S / 60) * 26}
            width="16"
            height={(S / 60) * 26}
            rx="1"
            fill="var(--teal)"
            opacity="0.8"
          />

          {/* sink patch */}
          <rect
            x="58"
            y="22"
            width="32"
            height="40"
            rx="3"
            fill="var(--magenta)"
            opacity="0.1"
            stroke="var(--magenta)"
            strokeWidth="0.7"
          />
          <text
            x="74"
            y="18"
            textAnchor="middle"
            style={{ fontSize: 2.5, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            {t("sink")}
          </text>
          <rect
            x="66"
            y={54 - (K / 40) * 26}
            width="16"
            height={(K / 40) * 26}
            rx="1"
            fill="var(--cyan)"
            opacity={sinkAlive ? 0.8 : 0.35}
          />

          {/* migration arrow */}
          <defs>
            <marker id="arrow-ss" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
              <path d="M0 0 L4 2 L0 4 Z" fill="var(--amber)" />
            </marker>
          </defs>
          <line
            x1="44"
            y1="42"
            x2="56"
            y2="42"
            stroke="var(--amber)"
            strokeWidth={0.6 + migration * 1.4}
            markerEnd="url(#arrow-ss)"
            opacity={0.5 + migration * 0.5}
          />
          <text
            x="50"
            y="38"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            m
          </text>

          {/* net growth signs */}
          <text
            x="26"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            b&gt;d
          </text>
          <text
            x="74"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            b&lt;d
          </text>
        </svg>

        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("source")} value={S.toFixed(0)} accent="teal" />
          <Readout label={t("sink")} value={K.toFixed(0)} accent={sinkAlive ? "cyan" : "magenta"} />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("migration")}
            value={migration}
            min={0}
            max={0.8}
            step={0.02}
            display={migration.toFixed(2)}
            onChange={setMigration}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

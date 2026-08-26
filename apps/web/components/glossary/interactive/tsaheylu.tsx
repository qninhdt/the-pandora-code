"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Particle = { id: number; lane: number; t: number; dir: 1 | -1; kind: 0 | 1 | 2 };

const KINDS = ["motor", "sensation", "emotion"] as const;
const KIND_COLOR = ["var(--cyan)", "var(--teal)", "var(--magenta)"] as const;

function tendrilPath(
  side: "L" | "R",
  i: number,
  pull: number, // 0 apart .. 1 laced
): string {
  const baseX = side === "L" ? 22 : 78;
  const tipTarget = 50;
  const spread = 10 - pull * 6;
  const y0 = 22 + i * 7.5;
  const midY = 48 + (i - 3) * 1.2;
  const tipY = 52 + Math.sin(i * 1.1) * (2.5 - pull * 1.5);
  const curl = (side === "L" ? 1 : -1) * (8 - pull * 7);
  const c1x = baseX + curl * 0.4;
  const c2x = baseX + (tipTarget - baseX) * 0.55 + curl;
  const tipX =
    baseX +
    (tipTarget - baseX) * (0.35 + pull * 0.62) +
    (i - 3) * spread * 0.15 * (side === "L" ? 1 : -1);
  // slight interlace offset when bonded
  const lace = pull > 0.85 ? Math.sin(i * 2.2) * 1.8 * (side === "L" ? 1 : -1) : 0;
  return `M ${baseX} ${y0} C ${c1x} ${y0 + 8}, ${c2x + lace} ${midY}, ${tipX + lace} ${tipY}`;
}

export default function Tsaheylu() {
  const t = useTranslations("viz.tsaheylu");
  const [pull, setPull] = useState(0.15);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tick, setTick] = useState(0);
  const pid = useRef(0);
  const spawnAcc = useRef(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  const bonded = pull >= 0.88;

  useRafLoop(
    (dt) => {
      setTick((n) => (n + 1) % 1_000_000);
      if (!bonded) {
        setParticles([]);
        spawnAcc.current = 0;
        return;
      }
      spawnAcc.current += dt;
      setParticles((prev) => {
        const next = prev
          .map((p) => ({ ...p, t: p.t + dt * 0.55 * p.dir }))
          .filter((p) => p.t > -0.05 && p.t < 1.05);
        while (spawnAcc.current > 0.14 && next.length < 28) {
          spawnAcc.current -= 0.14;
          const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
          const kind = (Math.floor(Math.random() * 3) % 3) as 0 | 1 | 2;
          next.push({
            id: ++pid.current,
            lane: Math.floor(Math.random() * 7),
            t: dir === 1 ? 0 : 1,
            dir,
            kind,
          });
        }
        return next;
      });
    },
    { active: inView },
  );

  const reset = useCallback(() => {
    setPull(0.15);
    setParticles([]);
  }, []);

  const tips = useMemo(() => {
    // approximate tip positions for particle placement along bond zone
    return Array.from({ length: 7 }, (_, i) => {
      const y = 52 + Math.sin(i * 1.1) * (2.5 - pull * 1.5) + (i - 3) * 0.4;
      return { x: 50 + Math.sin(i * 2.2) * (bonded ? 1.2 : 0), y };
    });
  }, [pull, bonded]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={reset}
      caption={
        bonded ? (
          <span className="text-magenta">{t("bonded")}</span>
        ) : (
          <span className="text-muted">{t("apart")}</span>
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
            <linearGradient id="tsa-L" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--magenta)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="tsa-R" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--magenta)" stopOpacity="0.85" />
            </linearGradient>
            <filter id="tsa-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.55" />
            </filter>
          </defs>

          {/* soft bond aura when laced */}
          {bonded && (
            <ellipse
              cx="50"
              cy="52"
              rx="14"
              ry="18"
              fill="var(--magenta)"
              opacity="0.08"
              filter="url(#tsa-glow)"
            />
          )}

          {/* left bundle (rider) */}
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={`L${i}`}
              d={tendrilPath("L", i, pull)}
              fill="none"
              stroke="url(#tsa-L)"
              strokeWidth={0.7 + (i % 3) * 0.12}
              strokeLinecap="round"
              opacity={0.55 + (i % 2) * 0.2}
            />
          ))}

          {/* right bundle (mount) */}
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={`R${i}`}
              d={tendrilPath("R", i, pull)}
              fill="none"
              stroke="url(#tsa-R)"
              strokeWidth={0.7 + ((i + 1) % 3) * 0.12}
              strokeLinecap="round"
              opacity={0.55 + (i % 2) * 0.2}
            />
          ))}

          {/* queue roots */}
          <ellipse cx="18" cy="48" rx="5" ry="22" fill="var(--teal)" opacity="0.12" />
          <ellipse cx="82" cy="48" rx="5" ry="22" fill="var(--cyan)" opacity="0.12" />
          <text
            x="18"
            y="90"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.6, fontFamily: "monospace" }}
          >
            {t("rider")}
          </text>
          <text
            x="82"
            y="90"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.6, fontFamily: "monospace" }}
          >
            {t("mount")}
          </text>

          {/* bidirectional particles along mid channel */}
          {particles.map((p) => {
            const tip = tips[p.lane] ?? tips[0];
            // lerp across bond zone with slight lane vertical
            const x = 28 + p.t * 44;
            const y = tip.y + Math.sin(p.t * Math.PI + p.lane) * 2.5;
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={0.85}
                fill={KIND_COLOR[p.kind]}
                opacity={0.75 + 0.2 * Math.sin(p.t * 6)}
                filter="url(#tsa-glow)"
              />
            );
          })}
        </svg>

        <div className="absolute right-3 top-14 flex flex-col items-end gap-1.5">
          <Readout
            label={t("flow")}
            value={bonded ? t("bonded") : t("apart")}
            accent={bonded ? "magenta" : "foreground"}
          />
          {bonded && (
            <>
              <Readout label={t("motor")} value="→" accent="cyan" />
              <Readout label={t("sensation")} value="←" accent="teal" />
              <Readout label={t("emotion")} value="↔" accent="magenta" />
            </>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("draw")}
            value={pull}
            min={0}
            max={1}
            step={0.01}
            onChange={setPull}
            display={bonded ? t("bonded") : `${Math.round(pull * 100)}%`}
            thumb="magenta"
          />
        </div>
        <span className="sr-only" aria-hidden>
          {tick}
        </span>
      </div>
    </GlossaryFrame>
  );
}

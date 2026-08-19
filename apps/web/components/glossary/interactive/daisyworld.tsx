"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Lovelock & Watson's toy planet. Two flowers: black (absorbs → warms its patch)
// and white (reflects → cools its patch). Slide the sun from dim to blazing.
// Black daisies seize the cold early world and warm it; white daisies take the
// hot late world and cool it — and across a huge range of luminosity the planet's
// temperature stays nearly flat. Regulation with no regulator: the decisive
// answer to the "Gaia needs a purpose" objection. Grey line = the same world dead.
const IDEAL_TEMP = 22.5; // °C daisies prefer

// steady-state daisy cover + temperature for a given luminosity (solved by
// relaxation each frame so the populations visibly chase equilibrium)
function step(lum: number, black: number, white: number, dt: number) {
  // local temperatures under each daisy type vs bare ground
  const bareTemp = -10 + lum * 42;
  const tBlack = bareTemp + 18;
  const tWhite = bareTemp - 18;
  // growth peaks at IDEAL_TEMP, zero outside ±16°C
  const g = (temp: number) => Math.max(0, 1 - ((temp - IDEAL_TEMP) / 16) ** 2);
  const bare = Math.max(0, 1 - black - white);
  const dBlack = black * (bare * g(tBlack) - 0.3);
  const dWhite = white * (bare * g(tWhite) - 0.3);
  let nb = Math.max(0.001, Math.min(1, black + dBlack * dt * 3));
  let nw = Math.max(0.001, Math.min(1, white + dWhite * dt * 3));
  if (nb + nw > 1) {
    const s = 1 / (nb + nw);
    nb *= s;
    nw *= s;
  }
  // planetary temp from area-weighted albedo
  const albedo = 0.5 + nw * 0.3 - nb * 0.3;
  const planetTemp = -10 + lum * 42 * (1 - (albedo - 0.5));
  return { nb, nw, planetTemp };
}

export default function Daisyworld() {
  const t = useTranslations("viz.daisyworld");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [lum, setLum] = useState(1.0);
  const black = useRef(0.2);
  const white = useRef(0.2);
  const temp = useRef(IDEAL_TEMP);
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      const r = step(lum, black.current, white.current, dt);
      black.current = r.nb;
      white.current = r.nw;
      temp.current = r.planetTemp;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const deadTemp = -10 + lum * 42; // no daisies, fixed albedo 0.5 baseline
  const bPct = Math.round(black.current * 100);
  const wPct = Math.round(white.current * 100);

  // map temp (−10..32) to y
  const ty = (c: number) => 78 - ((c + 10) / 42) * 56;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        black.current = 0.2;
        white.current = 0.2;
        setLum(1.0);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("planetTemp")}: <span className="text-teal">{temp.current.toFixed(1)}°C</span> ·{" "}
          {t("regulated")}
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
          {/* the daisy planet — a disk split by current cover */}
          <g transform="translate(24 30)">
            <circle
              cx="0"
              cy="0"
              r="16"
              fill="#1a1408"
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />
            {/* black daisies (lower arc) + white daisies (upper arc), area ~ cover */}
            {Array.from({ length: 40 }, (_, i) => {
              const a = (i / 40) * Math.PI * 2;
              const isBlack = i / 40 < black.current;
              const isWhite = !isBlack && i / 40 < black.current + white.current;
              if (!isBlack && !isWhite) return null;
              return (
                <circle
                  key={i}
                  cx={Math.cos(a) * 11}
                  cy={Math.sin(a) * 11}
                  r="2.1"
                  fill={isBlack ? "#20242c" : "#e8f0f8"}
                  stroke={isBlack ? "var(--cyan)" : "var(--foreground)"}
                  strokeWidth="0.2"
                  opacity="0.9"
                />
              );
            })}
          </g>

          {/* temperature vs luminosity plot */}
          <g>
            <line x1="48" y1="78" x2="94" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />
            <line x1="48" y1="22" x2="48" y2="78" stroke="var(--border-strong)" strokeWidth="0.4" />
            {/* ideal temp line */}
            <line
              x1="48"
              y1={ty(IDEAL_TEMP)}
              x2="94"
              y2={ty(IDEAL_TEMP)}
              stroke="var(--teal)"
              strokeWidth="0.3"
              strokeDasharray="1.5 1.5"
              opacity="0.5"
            />
            {/* dead-world diagonal (no life) */}
            <line
              x1="48"
              y1={ty(-10 + 0.4 * 42)}
              x2="94"
              y2={ty(-10 + 1.6 * 42)}
              stroke="var(--muted)"
              strokeWidth="0.6"
              opacity="0.5"
            />
            {/* current dead point */}
            <circle
              cx={48 + ((lum - 0.4) / 1.2) * 46}
              cy={ty(deadTemp)}
              r="1.4"
              fill="var(--muted)"
            />
            {/* current regulated point */}
            <circle
              cx={48 + ((lum - 0.4) / 1.2) * 46}
              cy={ty(temp.current)}
              r="2"
              fill="var(--teal)"
            />
            <text
              x="48"
              y="20"
              className="fill-muted"
              style={{ fontSize: 2.8, fontFamily: "monospace" }}
            >
              {t("tempAxis")}
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-16">
          <Legend
            vertical
            items={[
              { color: "#e8f0f8", label: `${t("white")} ${wPct}%` },
              { color: "#20242c", label: `${t("black")} ${bPct}%` },
              { color: "var(--muted)", label: t("dead") },
            ]}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("luminosity")}
            value={lum}
            min={0.4}
            max={1.6}
            step={0.01}
            onChange={setLum}
            display={`${lum.toFixed(2)} ${t("suns")}`}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

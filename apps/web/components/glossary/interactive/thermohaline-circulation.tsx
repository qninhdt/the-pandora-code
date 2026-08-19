"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The ocean's great conveyor, in cross-section, driven by water density — which
// temperature and salinity together set. Cold, salty water is heavy and sinks;
// warm, fresh water is light and floats. Adjust the two surface dials and watch
// the loop speed up, stall, or reverse. On Pandora tidal heat warms the
// seafloor, so the flow leans toward nutrient-rich local upwelling rather than
// Earth's sink-at-the-poles pattern.
export default function ThermohalineCirculation() {
  const t = useTranslations("viz.thermohaline-circulation");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [temp, setTemp] = useState(0.35); // 0 cold .. 1 warm (surface)
  const [salt, setSalt] = useState(0.6); // 0 fresh .. 1 salty (surface)
  const flow = useRef(0);
  const force = useState(0)[1];

  // density anomaly of the sinking (polar) water: high salt + low temp → sinks
  // fast (positive), warm+fresh → stalls or reverses (negative)
  const density = salt * 1.1 - temp * 1.2; // -ish .. +ish
  const rate = density; // drive rate; sign flips the loop

  useRafLoop(
    (dt) => {
      flow.current = (flow.current + dt * rate * 0.4 + 1) % 1;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const stalled = Math.abs(rate) < 0.12;
  const reversed = rate < -0.12;

  // conveyor loop rectangle in the sea box
  const L = 14;
  const R = 86;
  const TOP = 44;
  const BOT = 84;
  const perim = [
    { x: R, y: TOP },
    { x: L, y: TOP },
    { x: L, y: BOT },
    { x: R, y: BOT },
  ];
  const segLen = [R - L, BOT - TOP, R - L, BOT - TOP];
  const total = segLen.reduce((a, b) => a + b, 0);
  function ptAt(frac: number): [number, number] {
    let d = ((frac % 1) + 1) % 1;
    d *= total;
    for (let i = 0; i < 4; i++) {
      if (d <= segLen[i]) {
        const a = perim[i];
        const b = perim[(i + 1) % 4];
        const f = d / segLen[i];
        return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f];
      }
      d -= segLen[i];
    }
    return [L, TOP];
  }

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setTemp(0.35);
        setSalt(0.6);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("conveyor")}:{" "}
          <span className={stalled ? "text-magenta" : reversed ? "text-amber" : "text-cyan"}>
            {stalled ? t("stalled") : reversed ? t("reversed") : t("flowing")}
          </span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          {/* sky + sea */}
          <rect x="0" y="0" width="100" height="34" fill="#070c16" />
          <defs>
            <linearGradient id="thc-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#123a52" />
              <stop offset="100%" stopColor="#05121e" />
            </linearGradient>
          </defs>
          <rect x="0" y="34" width="100" height="66" fill="url(#thc-sea)" />
          {/* warm/cold surface tint */}
          <rect x="0" y="34" width="100" height="10" fill="var(--amber)" opacity={temp * 0.22} />
          <line x1="0" y1="34" x2="100" y2="34" stroke="var(--border-strong)" strokeWidth="0.4" />

          {/* Pandoran tidal-heated seafloor glow */}
          <rect x="0" y="90" width="100" height="10" fill="var(--magenta)" opacity="0.14" />
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={i}
              x1={10 + i * 16}
              y1="99"
              x2={10 + i * 16}
              y2="92"
              stroke="var(--magenta)"
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}

          {/* conveyor path */}
          <path
            d={`M${perim[0].x} ${perim[0].y} L${perim[1].x} ${perim[1].y} L${perim[2].x} ${perim[2].y} L${perim[3].x} ${perim[3].y} Z`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.4"
            opacity="0.5"
          />

          {/* flowing water parcels, colored by depth (cold deep / warm shallow) */}
          {!stalled &&
            Array.from({ length: 14 }, (_, i) => {
              const [x, y] = ptAt(i / 14 + flow.current);
              const deep = y > (TOP + BOT) / 2;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.3"
                  fill={deep ? "var(--cyan)" : "var(--amber)"}
                  opacity="0.8"
                />
              );
            })}

          {/* sink column marker (right = pole) */}
          <text
            x={R}
            y="40"
            textAnchor="middle"
            className="fill-cyan"
            style={{ fontSize: 2.7, fontFamily: "monospace" }}
          >
            {t("cold")}
          </text>
          <text
            x={L}
            y="40"
            textAnchor="middle"
            className="fill-amber"
            style={{ fontSize: 2.7, fontFamily: "monospace" }}
          >
            {t("warm")}
          </text>

          {/* upwelling plankton where deep water rises (left) */}
          {!stalled &&
            rate > 0 &&
            Array.from({ length: 5 }, (_, i) => {
              const y = BOT - ((i * 8 + flow.current * 30) % 36);
              return (
                <circle
                  key={i}
                  cx={L + 2 + (i % 2) * 3}
                  cy={y}
                  r="0.9"
                  fill="var(--teal)"
                  opacity="0.6"
                />
              );
            })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("density")}
            value={density > 0.12 ? t("heavy") : density < -0.12 ? t("light") : t("neutral")}
            accent={density > 0.12 ? "cyan" : "amber"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-11 flex flex-col gap-2">
          <ControlSlider
            label={t("surfaceTemp")}
            value={temp}
            min={0}
            max={1}
            step={0.01}
            onChange={setTemp}
            display={temp < 0.35 ? t("cold") : temp > 0.65 ? t("warm") : t("mild")}
            thumb="amber"
          />
          <ControlSlider
            label={t("salinity")}
            value={salt}
            min={0}
            max={1}
            step={0.01}
            onChange={setSalt}
            display={salt < 0.35 ? t("fresh") : salt > 0.65 ? t("salty") : t("brackish")}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

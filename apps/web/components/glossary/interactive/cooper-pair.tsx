"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// BCS pairing made visible. Two electrons — which by rights repel — are bound at
// a distance by a wake in the ion lattice: the first drags the heavy positive
// ions inward, and the second rides the fleeting pocket of positive charge left
// behind. Below Tc the pair orbits locked as one zero-spin boson; warm past Tc
// and thermal jitter shakes the lattice hard enough to break the bond, and the
// two electrons fly apart into ordinary, resistive solitude.
export default function CooperPair() {
  const t = useTranslations("viz.cooper-pair");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [temp, setTemp] = useState(0.26); // 0..1, Tc at 0.5
  const phase = useRef(0);
  const force = useState(0)[1];

  const TC = 0.5;
  const bound = temp < TC;

  useRafLoop(
    (dt) => {
      phase.current = (phase.current + dt * (bound ? 0.9 : 1.7)) % (Math.PI * 2);
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const jit = temp * 2.6;
  const ph = phase.current;
  const sep = bound ? 12 : 26 + temp * 22;
  const cx = 50;
  const cy = 46;
  const e1x = cx - Math.cos(ph) * sep;
  const e1y = cy - Math.sin(ph) * sep * 0.5;
  const e2x = cx + Math.cos(ph) * sep;
  const e2y = cy + Math.sin(ph) * sep * 0.5;

  // ion lattice — 6 cols × 4 rows, jittering with heat and pulled toward the
  // pair centre by the phonon distortion when the electrons are bound
  const ions: { x: number; y: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const bx = 12 + c * 15.2;
      const by = 20 + r * 17;
      const dx = Math.sin(ph * 2 + c + r) * jit * 0.4;
      const dy = Math.cos(ph * 2 + c * 1.3) * jit * 0.4;
      let px = 0;
      let py = 0;
      if (bound) {
        const ddx = cx - bx;
        const ddy = cy - by;
        const d = Math.hypot(ddx, ddy) || 1;
        const pull = Math.max(0, 1 - d / 34) * 2.4;
        px = (ddx / d) * pull;
        py = (ddy / d) * pull;
      }
      ions.push({ x: bx + dx + px, y: by + dy + py });
    }
  }

  // phonon wake: a sinusoid stretched between the two electrons
  let wake = "";
  for (let i = 0; i <= 12; i++) {
    const f = i / 12;
    const x = e1x + (e2x - e1x) * f;
    const y = e1y + (e2y - e1y) * f + Math.sin(f * Math.PI * 4 + ph * 3) * 2.2;
    wake += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  const electrons = [
    { x: e1x, y: e1y },
    { x: e2x, y: e2y },
  ];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setTemp(0.26)}
      allowFullscreen={false}
      caption={
        bound ? (
          <span className="text-teal">{t("bound")}</span>
        ) : (
          <span className="text-magenta">{t("broken")}</span>
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
          {ions.map((io, i) => (
            <g key={i}>
              <circle cx={io.x} cy={io.y} r="2.1" fill="var(--amber)" opacity="0.5" />
              <text
                x={io.x}
                y={io.y + 1}
                textAnchor="middle"
                className="fill-void"
                style={{ fontSize: 2.4, fontFamily: "monospace" }}
              >
                +
              </text>
            </g>
          ))}

          {bound && (
            <path d={wake} fill="none" stroke="var(--teal)" strokeWidth="0.8" opacity="0.7" />
          )}

          {electrons.map((e, i) => (
            <g key={i}>
              <circle cx={e.x} cy={e.y} r="3.2" fill="var(--cyan)" opacity="0.25" />
              <circle cx={e.x} cy={e.y} r="1.8" fill="var(--cyan)" />
              <text
                x={e.x}
                y={e.y + 1}
                textAnchor="middle"
                className="fill-void"
                style={{ fontSize: 2.2, fontFamily: "monospace" }}
              >
                −
              </text>
            </g>
          ))}

          {!bound &&
            Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={e1x}
                y1={e1y}
                x2={e1x - 6 - i * 2}
                y2={e1y - 4 + i * 3}
                stroke="var(--magenta)"
                strokeWidth="0.4"
                opacity="0.4"
              />
            ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("state")}
            value={bound ? t("paired") : t("free")}
            accent={bound ? "teal" : "magenta"}
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
            display={bound ? t("belowTc") : t("aboveTc")}
            thumb={bound ? "cyan" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

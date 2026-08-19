"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A ball resting in a double-well landscape. Tilt the landscape with the slider:
// stabilising feedbacks hold the ball in its basin — until you cross the crest.
// Past the tipping point the ball rolls into the far, deeper basin and won't
// come back when you un-tilt: an abrupt, hysteretic flip to a new stable state
// the system then defends just as stubbornly. Ice-albedo, permafrost, the whole
// grammar of irreversible planetary change.
export default function TippingPoint() {
  const t = useTranslations("viz.tipping-point");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [tilt, setTilt] = useState(0); // -1 .. +1 control (forcing)
  const ballX = useRef(28); // start in left basin (viewBox x)
  const vel = useRef(0);
  const tipped = useRef(false);
  const force = useState(0)[1];

  // landscape height at x (two wells at ~28 and ~72, crest at 50), tilted
  const heightAt = (x: number, tl: number) => {
    const w = (x - 50) / 22;
    const base = (w * w - 1) ** 2 * 14; // double well
    return base + tl * (x - 50) * 0.5; // tilt term
  };
  const slopeAt = (x: number, tl: number) => {
    const h = 0.5;
    return (heightAt(x + h, tl) - heightAt(x - h, tl)) / (2 * h);
  };

  useRafLoop(
    (dt) => {
      const s = slopeAt(ballX.current, tilt);
      vel.current += -s * 2.4 * dt - vel.current * 2.2 * dt; // gravity + damping
      ballX.current += vel.current * dt * 10;
      ballX.current = Math.max(10, Math.min(90, ballX.current));
      tipped.current = ballX.current > 50;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // landscape curve as a path
  const curve = Array.from({ length: 41 }, (_, i) => {
    const x = 10 + (i / 40) * 80;
    const y = 78 - heightAt(x, tilt);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${Math.max(20, Math.min(86, y)).toFixed(1)}`;
  }).join(" ");

  const bx = ballX.current;
  const by = 78 - heightAt(bx, tilt) - 3;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        ballX.current = 28;
        vel.current = 0;
        setTilt(0);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("state")}:{" "}
          <span className={tipped.current ? "text-magenta" : "text-teal"}>
            {tipped.current ? t("newState") : t("originalState")}
          </span>
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
          {/* the two basins shaded */}
          <path d={`${curve} L90 92 L10 92 Z`} fill="#0a1420" opacity="0.6" />
          {/* basin labels */}
          <text
            x="28"
            y="90"
            textAnchor="middle"
            className="fill-teal"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("stableA")}
          </text>
          <text
            x="72"
            y="90"
            textAnchor="middle"
            className="fill-magenta"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("stableB")}
          </text>

          {/* the landscape */}
          <path d={curve} fill="none" stroke="var(--border-strong)" strokeWidth="1" />
          {/* crest / tipping point marker */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2={78 - heightAt(50, tilt)}
            stroke="var(--amber)"
            strokeWidth="0.3"
            strokeDasharray="1.5 1.5"
            opacity="0.5"
          />
          <circle cx="50" cy={78 - heightAt(50, tilt)} r="1" fill="var(--amber)" opacity="0.7" />

          {/* the ball */}
          <circle
            cx={bx}
            cy={by}
            r="3.2"
            fill={tipped.current ? "var(--magenta)" : "var(--teal)"}
          />
          <circle
            cx={bx}
            cy={by}
            r="4.6"
            fill="none"
            stroke={tipped.current ? "var(--magenta)" : "var(--teal)"}
            strokeWidth="0.3"
            opacity="0.5"
          />
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("crest")}
            value={Math.abs(bx - 50) < 6 ? t("atEdge") : t("inBasin")}
            accent={Math.abs(bx - 50) < 6 ? "amber" : "teal"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("forcing")}
            value={tilt}
            min={-1}
            max={1}
            step={0.02}
            onChange={setTilt}
            display={tilt > 0.15 ? t("pushing") : tilt < -0.15 ? t("pullingBack") : t("neutral")}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

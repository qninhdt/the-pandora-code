"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A spinning disk seen top-down. Fire a ball radially outward from the centre;
// in the rotating frame its straight path looks bent — right on a
// counter-clockwise (northern) spin, left on a clockwise (southern) one. Faster
// spin, tighter curl. This is why planet-scale winds and currents deflect — and
// why it never touches your bathtub drain.
type Hemi = "north" | "south";
interface Trail {
  x: number;
  y: number;
}

export default function CoriolisEffect() {
  const t = useTranslations("viz.coriolis-effect");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [hemi, setHemi] = useState<Hemi>("north");
  const [spin, setSpin] = useState(1.0); // rotation rate
  const angle = useRef(0);

  // ball state in the INERTIAL (non-rotating) frame
  const ball = useRef<{ x: number; y: number; vx: number; vy: number; t: number } | null>(null);
  const groundTrail = useRef<Trail[]>([]); // path as seen in rotating frame
  const force = useState(0)[1];

  const CENTER = 50;

  const fire = () => {
    // launch straight "up" in inertial frame from centre
    ball.current = { x: CENTER, y: CENTER, vx: 0, vy: -26, t: 0 };
    groundTrail.current = [];
  };

  useRafLoop(
    (dt) => {
      const dir = hemi === "north" ? 1 : -1;
      angle.current += dt * spin * 1.2 * dir;
      const b = ball.current;
      if (b) {
        b.t += dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // convert inertial position → rotating-frame (what a disk-dweller sees)
        const dx = b.x - CENTER;
        const dy = b.y - CENTER;
        const ca = Math.cos(-angle.current);
        const sa = Math.sin(-angle.current);
        const rx = CENTER + dx * ca - dy * sa;
        const ry = CENTER + dx * sa + dy * ca;
        groundTrail.current.push({ x: rx, y: ry });
        if (groundTrail.current.length > 120) groundTrail.current.shift();
        const dist = Math.hypot(dx, dy);
        if (dist > 46) ball.current = null;
      }
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  // current ball position in rotating frame (for the dot)
  let bx = CENTER;
  let by = CENTER;
  if (ball.current) {
    const last = groundTrail.current[groundTrail.current.length - 1];
    if (last) {
      bx = last.x;
      by = last.y;
    }
  }

  const trailPath =
    groundTrail.current.length > 1
      ? groundTrail.current
          .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ")
      : "";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        ball.current = null;
        groundTrail.current = [];
        angle.current = 0;
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("deflects")}:{" "}
          <span className={hemi === "north" ? "text-cyan" : "text-magenta"}>
            {t(hemi === "north" ? "toRight" : "toLeft")}
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
          {/* the rotating disk */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="#0a1420"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={hemi === "north" ? "var(--cyan)" : "var(--magenta)"}
            strokeWidth="0.3"
            opacity="0.4"
          />

          {/* rotation reference spokes so the spin is visible */}
          {Array.from({ length: 6 }, (_, i) => {
            const a = angle.current + (i / 6) * Math.PI * 2;
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + Math.cos(a) * 46}
                y2={50 + Math.sin(a) * 46}
                stroke="var(--border-strong)"
                strokeWidth="0.3"
                opacity="0.25"
              />
            );
          })}
          {/* spin direction arc */}
          <circle
            cx="50"
            cy="50"
            r="1.6"
            fill={hemi === "north" ? "var(--cyan)" : "var(--magenta)"}
          />

          {/* curved trail as seen on the disk */}
          {trailPath && (
            <path
              d={trailPath}
              fill="none"
              stroke="var(--amber)"
              strokeWidth="1"
              opacity="0.85"
              strokeLinecap="round"
            />
          )}
          {ball.current && <circle cx={bx} cy={by} r="2.2" fill="var(--amber)" />}
        </svg>

        <div className="absolute left-3 top-16">
          <button
            type="button"
            onClick={fire}
            className="rounded-lg border border-amber/50 bg-void/75 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-amber backdrop-blur-md transition-colors hover:bg-void hover:border-amber"
          >
            {t("fire")}
          </button>
        </div>

        <div className="absolute right-3 top-16">
          <ControlTabs
            ariaLabel={t("hemisphere")}
            options={[
              { value: "north", label: t("north") },
              { value: "south", label: t("south") },
            ]}
            value={hemi}
            onChange={(v) => setHemi(v as Hemi)}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("spinRate")}
            value={spin}
            min={0.3}
            max={2.5}
            step={0.1}
            onChange={setSpin}
            display={`${spin.toFixed(1)}×`}
            thumb={hemi === "north" ? "cyan" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

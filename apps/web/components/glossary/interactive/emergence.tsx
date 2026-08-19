"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Boid = { x: number; y: number; vx: number; vy: number };

function seed(n = 28): Boid[] {
  return Array.from({ length: n }, () => ({
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 55,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.5) * 12,
  }));
}

export default function Emergence() {
  const t = useTranslations("viz.emergence");
  const { ref, inView } = useInView<HTMLDivElement>();
  const boids = useRef(seed());
  const [, bump] = useState(0);
  const [sep, setSep] = useState(0.7);
  const [ali, setAli] = useState(0.6);
  const [coh, setCoh] = useState(0.55);
  const [playing, setPlaying] = useState(true);

  useRafLoop(
    (dt) => {
      const bs = boids.current;
      const next = bs.map((b) => ({ ...b }));
      for (let i = 0; i < bs.length; i++) {
        let sx = 0, sy = 0, sc = 0;
        let ax = 0, ay = 0, ac = 0;
        let cx = 0, cy = 0, cc = 0;
        const me = bs[i];
        for (let j = 0; j < bs.length; j++) {
          if (i === j) continue;
          const o = bs[j];
          const dx = me.x - o.x;
          const dy = me.y - o.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 8 * 8 && d2 > 0) {
            sx += dx / d2;
            sy += dy / d2;
            sc++;
          }
          if (d2 < 16 * 16) {
            ax += o.vx;
            ay += o.vy;
            ac++;
            cx += o.x;
            cy += o.y;
            cc++;
          }
        }
        let vx = me.vx;
        let vy = me.vy;
        if (sc > 0) {
          vx += (sx / sc) * sep * 40;
          vy += (sy / sc) * sep * 40;
        }
        if (ac > 0) {
          vx += ((ax / ac) - me.vx) * ali * 0.08;
          vy += ((ay / ac) - me.vy) * ali * 0.08;
        }
        if (cc > 0) {
          vx += ((cx / cc) - me.x) * coh * 0.015;
          vy += ((cy / cc) - me.y) * coh * 0.015;
        }
        // soft bounds
        if (me.x < 8) vx += 8;
        if (me.x > 92) vx -= 8;
        if (me.y < 12) vy += 8;
        if (me.y > 78) vy -= 8;
        const sp = Math.hypot(vx, vy) || 1;
        const maxSp = 22;
        if (sp > maxSp) {
          vx = (vx / sp) * maxSp;
          vy = (vy / sp) * maxSp;
        }
        next[i].vx = vx;
        next[i].vy = vy;
        next[i].x = me.x + vx * dt;
        next[i].y = me.y + vy * dt;
      }
      boids.current = next;
      bump((n) => (n + 1) % 1_000_000);
    },
    { active: inView && playing },
  );

  const list = boids.current;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        boids.current = seed();
        setSep(0.7);
        setAli(0.6);
        setCoh(0.55);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={<span className="text-teal">{t("flock")}</span>}
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {list.map((b, i) => {
            const ang = Math.atan2(b.vy, b.vx);
            const s = 2.4;
            const x1 = b.x + Math.cos(ang) * s;
            const y1 = b.y + Math.sin(ang) * s;
            const x2 = b.x + Math.cos(ang + 2.5) * s * 0.7;
            const y2 = b.y + Math.sin(ang + 2.5) * s * 0.7;
            const x3 = b.x + Math.cos(ang - 2.5) * s * 0.7;
            const y3 = b.y + Math.sin(ang - 2.5) * s * 0.7;
            return (
              <polygon
                key={i}
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                fill="var(--cyan)"
                opacity={0.85}
              />
            );
          })}
        </svg>
        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1">
          <ControlSlider label={t("separation")} value={sep} min={0} max={1.5} step={0.05} display={sep.toFixed(2)} onChange={setSep} thumb="magenta" />
          <ControlSlider label={t("alignment")} value={ali} min={0} max={1.5} step={0.05} display={ali.toFixed(2)} onChange={setAli} thumb="cyan" />
          <ControlSlider label={t("cohesion")} value={coh} min={0} max={1.5} step={0.05} display={coh.toFixed(2)} onChange={setCoh} thumb="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Albedo = the fraction of starlight a surface bounces instead of absorbing.
// Click a surface; incoming photons rain down and each one either reflects (goes
// back up, tinted by the surface) or is absorbed (dims out and warms the ground).
// The reflected fraction is the albedo; the rest sets how warm the world runs.
type Surface = "ice" | "ocean" | "forest" | "desert" | "city";
const SURFACES: Record<Surface, { albedo: number; color: string; warm: number }> = {
  ice: { albedo: 0.85, color: "#dfeffb", warm: 0.15 },
  ocean: { albedo: 0.06, color: "#123048", warm: 0.94 },
  forest: { albedo: 0.14, color: "#123a2a", warm: 0.86 },
  desert: { albedo: 0.4, color: "#c8a25c", warm: 0.6 },
  city: { albedo: 0.2, color: "#3a3f4a", warm: 0.8 },
};

interface Photon {
  x: number;
  y: number;
  vy: number;
  reflected: boolean;
  vx: number;
  life: number;
}

const GROUND_Y = 68;

export default function Albedo() {
  const t = useTranslations("viz.albedo");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [surface, setSurface] = useState<Surface>("ice");
  const [isPlaying, setIsPlaying] = useState(true);
  const photons = useRef<Photon[]>([]);
  const spawn = useRef(0);
  const surfRef = useRef(surface);
  surfRef.current = surface;
  const [, force] = useState(0);

  useRafLoop(
    (dt) => {
      spawn.current += dt;
      const rate = 0.05;
      while (spawn.current > rate) {
        spawn.current -= rate;
        const a = SURFACES[surfRef.current].albedo;
        photons.current.push({
          x: 8 + Math.abs(Math.sin(photons.current.length * 12.9) * 84),
          y: 2,
          vy: 34 + (photons.current.length % 5) * 3,
          vx: 0,
          reflected: false,
          life: 0,
        });
        void a;
      }
      const a = SURFACES[surfRef.current].albedo;
      for (const p of photons.current) {
        p.life += dt;
        if (!p.reflected && p.y < GROUND_Y) {
          p.y += p.vy * dt;
          if (p.y >= GROUND_Y) {
            p.y = GROUND_Y;
            // deterministic reflect decision keyed to spawn position
            const roll = Math.abs(Math.sin(p.x * 7.1));
            if (roll < a) {
              p.reflected = true;
              p.vx = (p.x > 50 ? 1 : -1) * (6 + roll * 20);
            } else {
              p.vy = 0; // absorbed: fade in place
            }
          }
        } else if (p.reflected) {
          p.y -= p.vy * dt;
          p.x += p.vx * dt;
        }
      }
      photons.current = photons.current.filter(
        (p) => p.y > -4 && p.life < 6 && !(p.vy === 0 && p.life > 1.2),
      );
      force((n) => (n + 1) % 1_000_000);
    },
    { active: isPlaying && inView },
  );

  const s = SURFACES[surface];
  const albedoPct = Math.round(s.albedo * 100);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        photons.current = [];
        setSurface("ice");
      }}
      caption={
        <span>
          {t("albedo")}: <span className="text-cyan">{albedoPct}%</span> {t("reflected")} ·{" "}
          {100 - albedoPct}% {t("absorbed")}
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
          {/* space */}
          <rect x="0" y="0" width="100" height={GROUND_Y} fill="#070a14" />
          {/* the surface, warmth-tinted by how much it absorbs */}
          <rect x="0" y={GROUND_Y} width="100" height={100 - GROUND_Y} fill={s.color} />
          <rect
            x="0"
            y={GROUND_Y}
            width="100"
            height={100 - GROUND_Y}
            fill="var(--amber)"
            opacity={s.warm * 0.28}
          />
          <line
            x1="0"
            y1={GROUND_Y}
            x2="100"
            y2={GROUND_Y}
            stroke="var(--border-strong)"
            strokeWidth="0.4"
          />

          {photons.current.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.reflected ? 0.9 : 1.1}
              fill={p.reflected ? s.color : "var(--amber)"}
              opacity={p.vy === 0 ? Math.max(0, 0.7 - p.life * 0.5) : p.reflected ? 0.9 : 0.85}
              stroke={p.reflected ? "var(--foreground)" : "none"}
              strokeWidth={p.reflected ? 0.2 : 0}
            />
          ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("warmth")}
            value={s.warm > 0.7 ? t("warm") : s.warm > 0.4 ? t("mild") : t("cool")}
            accent={s.warm > 0.7 ? "amber" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlTabs
            ariaLabel={t("surface")}
            options={[
              { value: "ice", label: t("ice") },
              { value: "ocean", label: t("ocean") },
              { value: "forest", label: t("forest") },
              { value: "desert", label: t("desert") },
              { value: "city", label: t("city") },
            ]}
            value={surface}
            onChange={(v) => setSurface(v as Surface)}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ReplayTheTapeProps {
  caption?: string;
  className?: string;
}

// Scientific data stays in code. One "run" of the tape: the ROLE is fixed — an
// ambush predator, low and fast and forward-eyed — but the SUBSTRATE (limbs,
// eyes, tail, origin) is contingency's call and comes out different on every
// replay. Gould's accidents wearing Conway Morris's roles: the silhouette
// converges, the inheritance never repeats.
interface Variant {
  id: string;
  limbs: number; // limb pairs drawn under the body
  eyes: number; // hunting eyes at the head
}

const VARIANTS: Variant[] = [
  { id: "cat", limbs: 2, eyes: 1 },
  { id: "hexapod", limbs: 3, eyes: 2 },
  { id: "sabre", limbs: 2, eyes: 1 },
  { id: "unvisited", limbs: 4, eyes: 2 },
];

const W = 320;
const H = 170;
const SPINE_Y = 92;
const BODY_X0 = 96;
const BODY_X1 = 224;

// Evenly space `n` limb pairs along the body span; each pair is an up/down stroke.
function limbXs(n: number) {
  if (n <= 1) return [(BODY_X0 + BODY_X1) / 2];
  const step = (BODY_X1 - BODY_X0) / (n + 1);
  return Array.from({ length: n }, (_, i) => BODY_X0 + step * (i + 1));
}

export function ReplayTheTape({ caption, className }: ReplayTheTapeProps) {
  const uid = useId();
  const reduced = useReducedMotionSafe();
  const t = useTranslations("viz.replayTape");
  // Deterministic initial render (no Math.random in state) → SSR-safe.
  const [index, setIndex] = useState(0);
  const v = VARIANTS[index];
  const tr = reduced ? undefined : "all 0.3s ease";

  const headX = BODY_X1 + 16;
  const eyeYs = v.eyes === 1 ? [SPINE_Y] : [SPINE_Y - 5, SPINE_Y + 5];

  return (
    <VizFigure
      title={t("title")}
      caption={caption}
      className={className}
      tone="teal"
      hint={t("hint")}
      controls={
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % VARIANTS.length)}
          className="group/replay flex items-center gap-2 rounded-lg border px-3 py-1.5 font-sans transition-all"
          style={{
            borderColor: "color-mix(in oklab, var(--cyan) 45%, transparent)",
            background: "color-mix(in oklab, var(--cyan) 12%, transparent)",
            boxShadow:
              "inset 0 1px 0 0 color-mix(in oklab, var(--cyan) 22%, transparent), 0 0 18px -8px color-mix(in oklab, var(--cyan) 80%, transparent)",
          }}
        >
          <svg
            viewBox="0 0 16 16"
            width={13}
            height={13}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="transition-transform duration-300 group-hover/replay:rotate-180"
          >
            <title>{t("button")}</title>
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
            <path d="M13.5 2v3h-3" />
          </svg>
          <span className="text-xs font-600 text-cyan">{t("button")}</span>
          <span className="text-xs uppercase tracking-wider text-subtle tabular-nums">
            {t("run", { n: index + 1, total: VARIANTS.length })}
          </span>
        </button>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="w-full rounded-xl border border-border bg-void/30 p-2 sm:w-1/2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`${t("roleValue")} — ${t(`variants.${v.id}.substrate`)}`}
          >
            <GlowDefs idBase={uid} tones={["teal", "amber"]} />
            {/* the pounce: a low spring-loaded body — the role, held constant */}
            <path
              d={`M ${BODY_X0} ${SPINE_Y + 4} Q ${(BODY_X0 + BODY_X1) / 2} ${SPINE_Y - 26} ${BODY_X1} ${SPINE_Y}`}
              fill="none"
              stroke="var(--teal)"
              strokeWidth={10}
              strokeLinecap="round"
              filter={glowUrl(uid, "bloom")}
            />
            {/* haunch — the spring */}
            <circle
              cx={BODY_X0 + 6}
              cy={SPINE_Y + 6}
              r={14}
              fill="color-mix(in oklab, var(--teal) 22%, transparent)"
              stroke="var(--teal)"
              strokeWidth={2}
            />
            {/* head + forward hunting eyes (role-defining, in teal) */}
            <circle
              cx={headX}
              cy={SPINE_Y - 4}
              r={14}
              fill="var(--surface-overlay)"
              stroke="var(--teal)"
              strokeWidth={2}
            />
            {eyeYs.map((ey) => (
              <circle
                key={ey}
                cx={headX + 6}
                cy={ey - 4}
                r={2.4}
                fill="var(--amber)"
                style={{ transition: tr }}
              />
            ))}

            {/* substrate limbs (contingency, in amber) — the changing element glows */}
            <g filter={glowUrl(uid, "bloom")}>
              {limbXs(v.limbs).map((x) => (
                <line
                  key={`${index}-${x}`}
                  x1={x}
                  y1={SPINE_Y - 8}
                  x2={x - 8}
                  y2={SPINE_Y + 40}
                  stroke="var(--amber)"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeOpacity={0.95}
                  style={{ transition: tr }}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="flex flex-col gap-2 sm:w-1/2">
          <div className="rounded-lg border border-[color-mix(in_oklab,var(--teal)_40%,transparent)] bg-[color-mix(in_oklab,var(--teal)_10%,transparent)] px-3 py-2">
            <p className="font-sans text-xs uppercase tracking-wider text-subtle">{t("role")}</p>
            <p className="font-display text-sm font-700 text-teal">{t("roleValue")}</p>
          </div>

          <div className="rounded-lg border border-border bg-void/30 px-3 py-2">
            <p className="font-sans text-xs uppercase tracking-wider text-subtle">
              {t("originLabel")}
            </p>
            <p className="font-display text-sm font-700 text-foreground" style={{ transition: tr }}>
              {t(`variants.${v.id}.origin`)}
            </p>
            <p className="mt-1 font-sans text-xs uppercase tracking-wider text-subtle">
              {t("substrateLabel")}
            </p>
            <p className="font-sans text-xs text-amber" style={{ transition: tr }}>
              {t(`variants.${v.id}.substrate`)}
            </p>
          </div>
        </div>
      </div>
    </VizFigure>
  );
}

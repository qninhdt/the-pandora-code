"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface DetectionMethodScopeProps {
  caption?: string;
  locale?: "vi" | "en";
  className?: string;
}

type Method = "rv" | "transit" | "imaging";

const VIEW_W = 460;
const VIEW_H = 230;
const CX = 150; // scene centre x (star)
const CY = 96; // scene centre y
const ORBIT_RX = 70;
const ORBIT_RY = 26;

const STRINGS = {
  vi: {
    methods: {
      rv: "Vận tốc xuyên tâm",
      transit: "Quá cảnh",
      imaging: "Chụp ảnh trực tiếp",
    },
    tablist: "Phương pháp săn tìm thế giới",
    desc: {
      rv: "Hành tinh kéo ngôi sao lắc lư quanh khối tâm chung. Ngôi sao lúc tiến lại, lúc lùi xa khiến ánh sáng dịch xanh rồi dịch đỏ — một sóng tuần hoàn để lộ một thế giới ta chưa hề thấy.",
      transit:
        "Khi hành tinh đi ngang trước mặt sao, nó che bớt một mẩu ánh sáng. Độ sáng tụt xuống rồi hồi phục theo nhịp — độ sâu của vết lõm cho biết kích thước hành tinh.",
      imaging:
        "Che khuất ánh sáng chói của sao bằng một tấm chắn, ta có thể chụp thẳng đốm sáng mờ của hành tinh bên cạnh — khó nhất, nhưng là cách 'nhìn tận mắt' một thế giới.",
    },
    starlight: "Độ sáng / dịch chuyển",
    play: "Chạy",
    pause: "Dừng",
  },
  en: {
    methods: {
      rv: "Radial velocity",
      transit: "Transit",
      imaging: "Direct imaging",
    },
    tablist: "Methods for hunting a world",
    desc: {
      rv: "The planet tugs the star into a small wobble about their shared centre. As the star swings toward us then away, its light blue-shifts then red-shifts — a periodic wave that betrays a world we never see.",
      transit:
        "When the planet crosses in front of the star, it blocks a sliver of light. The brightness dips and recovers on a clock — and the depth of the dip reveals the planet's size.",
      imaging:
        "Hide the star's glare behind a mask and you can photograph the faint dot of the planet beside it — the hardest method, but the one that truly sees a world.",
    },
    starlight: "Brightness / shift",
    play: "Play",
    pause: "Pause",
  },
} as const;

// An interactive, tabbed explainer for the three ways astronomers detect a
// world they cannot resolve by eye. A single orbital phase drives every view —
// the star's wobble, the transit dip, the imaged dot — so the methods read as
// three windows onto the same orbiting planet. SVG-only and deterministic for
// SSR; the optional animation is gated on reduced-motion.
export function DetectionMethodScope({
  caption,
  locale = "en",
  className,
}: DetectionMethodScopeProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const uid = useId();
  const [method, setMethod] = useState<Method>("rv");
  const [phase, setPhase] = useState(0.18); // deterministic default for SSR
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      last.current = null;
      return;
    }
    const step = (now: number) => {
      if (last.current !== null) {
        const dt = (now - last.current) / 1000;
        setPhase((p) => (p + dt * 0.18) % 1); // ~5.5s per orbit
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const ang = phase * Math.PI * 2;
  // Planet position on a tilted ellipse around the star.
  const px = CX + ORBIT_RX * Math.cos(ang);
  const py = CY + ORBIT_RY * Math.sin(ang);
  const inFront = Math.sin(ang) > 0; // near the viewer → can transit
  // Transit happens when the planet is between us and the star (front, centred).
  const transitDepth =
    inFront && Math.abs(Math.cos(ang)) < 0.32 ? 1 - Math.abs(Math.cos(ang)) / 0.32 : 0;
  const starShiftX = 10 * Math.cos(ang); // RV wobble, exaggerated

  const methods: Method[] = ["rv", "transit", "imaging"];

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        {/* tabs */}
        <div role="tablist" aria-label={t.tablist} className="mb-3 flex gap-1.5">
          {methods.map((m) => {
            const active = m === method;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                id={`${uid}-tab-${m}`}
                aria-selected={active}
                aria-controls={`${uid}-panel`}
                onClick={() => setMethod(m)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 font-sans text-[0.72rem] font-600 transition-colors",
                  active
                    ? "border-cyan/60 bg-cyan/15 text-cyan"
                    : "border-border bg-void/30 text-muted hover:bg-void/60",
                )}
              >
                {t.methods[m]}
              </button>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label={t.methods[method]}
        >
          {/* orbit guide */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={ORBIT_RX}
            ry={ORBIT_RY}
            fill="none"
            style={{ stroke: "var(--border)" }}
            strokeWidth={1}
            strokeDasharray="3 4"
          />

          {/* planet behind the star is drawn first */}
          {!inFront && <circle cx={px} cy={py} r={5} style={{ fill: "var(--muted)" }} />}

          {/* the star (wobbles in the RV view) */}
          <circle
            cx={method === "rv" ? CX + starShiftX : CX}
            cy={CY}
            r={18}
            style={{
              fill:
                method === "rv"
                  ? starShiftX < 0
                    ? "var(--cyan)"
                    : "var(--magenta)"
                  : "var(--amber)",
              filter: `drop-shadow(0 0 12px ${
                method === "rv"
                  ? starShiftX < 0
                    ? "var(--cyan)"
                    : "var(--magenta)"
                  : "var(--amber)"
              })`,
              transition: reduced ? undefined : "fill 0.2s",
            }}
            opacity={method === "transit" && transitDepth > 0 ? 0.92 : 1}
          />

          {/* coronagraph mask for the imaging view */}
          {method === "imaging" && (
            <circle
              cx={CX}
              cy={CY}
              r={22}
              style={{ fill: "var(--void)", stroke: "var(--border-strong)" }}
              strokeWidth={1.5}
            />
          )}

          {/* planet in front of the star */}
          {inFront && (
            <circle
              cx={px}
              cy={py}
              r={method === "transit" ? 6 : 5}
              style={{
                fill: method === "imaging" ? "var(--teal)" : "var(--surface-overlay)",
                filter: method === "imaging" ? "drop-shadow(0 0 6px var(--teal))" : undefined,
                stroke: method === "imaging" ? "var(--teal)" : "var(--border-strong)",
              }}
              strokeWidth={1}
            />
          )}

          {/* RV wobble arrows */}
          {method === "rv" && (
            <text
              x={CX}
              y={CY + 44}
              textAnchor="middle"
              style={{
                fill: starShiftX < 0 ? "var(--cyan)" : "var(--magenta)",
                fontSize: 10,
              }}
              className="font-sans"
            >
              {starShiftX < 0 ? "← blue-shift" : "red-shift →"}
            </text>
          )}

          {/* readout panel on the right: a small graph that fits the method */}
          <g transform={`translate(${260} ${36})`}>
            <text
              x={0}
              y={-10}
              style={{ fill: "var(--subtle)", fontSize: 9 }}
              className="font-sans"
            >
              {t.starlight}
            </text>
            <rect
              x={0}
              y={0}
              width={170}
              height={120}
              rx={8}
              fill="var(--void)"
              style={{ stroke: "var(--border)" }}
              strokeWidth={1}
            />
            {method === "rv" && <RvCurve uid={uid} phase={phase} />}
            {method === "transit" && <TransitCurve phase={phase} />}
            {method === "imaging" && <ImagingPanel />}
          </g>
        </svg>

        {/* description */}
        <p
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${method}`}
          className="mt-2 font-serif text-sm leading-relaxed text-muted"
        >
          {t.desc[method]}
        </p>

        {/* controls */}
        {!reduced && (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t.pause : t.play}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-cyan transition-colors hover:bg-void/70"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={0.999}
              step={0.001}
              value={phase}
              onChange={(e) => {
                setPlaying(false);
                setPhase(Number(e.target.value));
              }}
              aria-label={locale === "vi" ? "Pha quỹ đạo" : "Orbital phase"}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, var(--cyan) ${phase * 100}%, var(--border) ${phase * 100}%)`,
              }}
            />
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// A sine wave with a marker at the current phase — the radial-velocity curve.
function RvCurve({ uid, phase }: { uid: string; phase: number }) {
  const W = 170;
  const H = 120;
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * W;
    const y = H / 2 - Math.cos((i / 40) * Math.PI * 2) * 34;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mx = phase * W;
  const my = H / 2 - Math.cos(phase * Math.PI * 2) * 34;
  return (
    <>
      <line
        x1={0}
        y1={H / 2}
        x2={W}
        y2={H / 2}
        style={{ stroke: "var(--border)" }}
        strokeWidth={1}
      />
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: "var(--cyan)", filter: "drop-shadow(0 0 3px var(--cyan))" }}
        strokeWidth={2}
      />
      <circle cx={mx} cy={my} r={4} style={{ fill: "var(--magenta)" }} />
      <title id={`${uid}-rv`}>radial velocity curve</title>
    </>
  );
}

// A flat line with a periodic dip — the transit light curve.
function TransitCurve({ phase }: { phase: number }) {
  const W = 170;
  const H = 120;
  const base = 36;
  const pts = Array.from({ length: 61 }, (_, i) => {
    const p = i / 60;
    const x = p * W;
    // dip centred at phase 0.25 (front-centre crossing)
    const d = Math.abs(((p - 0.25 + 1) % 1) - 0) < 0.08 ? 1 : 0;
    const dip = Math.max(0, 1 - Math.abs(((p - 0.25 + 1) % 1) / 0.08)) * 28;
    void d;
    const y = base + dip;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mx = phase * W;
  const dipNow = Math.max(0, 1 - Math.abs(((phase - 0.25 + 1) % 1) / 0.08)) * 28;
  return (
    <>
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: "var(--amber)", filter: "drop-shadow(0 0 3px var(--amber))" }}
        strokeWidth={2}
      />
      <circle cx={mx} cy={base + dipNow} r={4} style={{ fill: "var(--teal)" }} />
    </>
  );
}

// A static "before / after starlight removed" pair for direct imaging.
function ImagingPanel() {
  return (
    <>
      <circle
        cx={55}
        cy={60}
        r={14}
        style={{ fill: "var(--void)", stroke: "var(--border-strong)" }}
        strokeWidth={1.5}
      />
      <circle
        cx={92}
        cy={48}
        r={4}
        style={{ fill: "var(--teal)", filter: "drop-shadow(0 0 5px var(--teal))" }}
      />
      <text
        x={92}
        y={36}
        textAnchor="middle"
        style={{ fill: "var(--teal)", fontSize: 9 }}
        className="font-sans"
      >
        planet
      </text>
      <text
        x={55}
        y={86}
        textAnchor="middle"
        style={{ fill: "var(--subtle)", fontSize: 9 }}
        className="font-sans"
      >
        masked star
      </text>
    </>
  );
}

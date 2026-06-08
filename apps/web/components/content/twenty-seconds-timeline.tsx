"use client";

import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface TwentySecondsTimelineProps {
  caption?: string;
  locale?: "vi" | "en";
  className?: string;
}

const MAX_T = 20; // seconds of consciousness after the mask comes off
const DEFAULT_T = 8; // deterministic SSR default: mid-crisis, the paradox is visible

interface Stage {
  at: number;
  title: { vi: string; en: string };
  body: { vi: string; en: string };
}

// The physiological sequence, paced to the chapter's "about twenty seconds".
const STAGES: Stage[] = [
  {
    at: 0,
    title: { vi: "Tháo mặt nạ", en: "Mask off" },
    body: {
      vi: "Không khí thừa oxy để thở — phổi đầy, máu đỏ tươi. Chưa có gì sai.",
      en: "The air has oxygen to spare — lungs fill, blood runs bright red. Nothing feels wrong yet.",
    },
  },
  {
    at: 3,
    title: { vi: "H₂S tràn vào", en: "H₂S floods in" },
    body: {
      vi: "Hydro sulfua khuếch tán vào máu và bám lấy enzyme hô hấp trong ty thể.",
      en: "Hydrogen sulfide diffuses into the blood and latches onto the respiratory enzyme in your mitochondria.",
    },
  },
  {
    at: 8,
    title: { vi: "Ngạt độc tế bào", en: "Histotoxic hypoxia" },
    body: {
      vi: "Máu vẫn đầy oxy, nhưng tế bào không còn ĐỐT được nó. Đây là nghịch lý: ngạt giữa biển oxy.",
      en: "The blood is still full of oxygen, but the cells can no longer BURN it. This is the paradox: suffocating in a sea of oxygen.",
    },
  },
  {
    at: 14,
    title: { vi: "Sụp đổ", en: "Collapse" },
    body: {
      vi: "Não thiếu năng lượng: tầm nhìn thu hẹp, chân khuỵu, ý thức trượt dần.",
      en: "Starved of energy, the brain falters: vision narrows, legs give way, awareness slips.",
    },
  },
  {
    at: 18,
    title: { vi: "Bất tỉnh", en: "Unconscious" },
    body: {
      vi: "Khoảng hai mươi giây sau khi tháo mặt nạ, bạn ngã gục. Không phải vì thiếu oxy — mà vì hóa học.",
      en: "About twenty seconds after the mask came off, you are down. Not from a lack of oxygen — from chemistry.",
    },
  },
];

const STRINGS = {
  vi: {
    bloodO2: "Oxy trong máu",
    usableO2: "Oxy tế bào dùng được",
    seconds: "giây",
    play: "Chạy",
    pause: "Dừng",
    reset: "Đặt lại",
    timeline: "Dòng thời gian (giây)",
    hint: "Kéo dòng thời gian: oxy trong máu vẫn đầy, nhưng oxy mà tế bào dùng được thì sụp đổ.",
  },
  en: {
    bloodO2: "Oxygen in blood",
    usableO2: "Oxygen cells can use",
    seconds: "seconds",
    play: "Play",
    pause: "Pause",
    reset: "Reset",
    timeline: "Timeline (seconds)",
    hint: "Drag the timeline: oxygen in the blood stays full, but the oxygen cells can actually use collapses.",
  },
} as const;

function currentStage(t: number): Stage {
  let s = STAGES[0];
  for (const stage of STAGES) if (t >= stage.at) s = stage;
  return s;
}

// An interactive timeline of the "twenty seconds" the chapter opens on. The
// reader scrubs from mask-off to collapse and watches the central paradox: blood
// oxygen stays full while the oxygen cells can use crashes, because hydrogen
// sulfide jams the mitochondrial enzyme. SVG bars + a range input, deterministic
// for SSR, with an optional reduced-motion-gated play loop.
export function TwentySecondsTimeline({
  caption,
  locale = "en",
  className,
}: TwentySecondsTimelineProps) {
  const reduced = useReducedMotionSafe();
  const t = STRINGS[locale];
  const uid = useId();
  const [time, setTime] = useState(DEFAULT_T);
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
        setTime((p) => {
          const next = p + dt * 2.2; // ~9s to play out the 20s
          if (next >= MAX_T) {
            setPlaying(false);
            return MAX_T;
          }
          return next;
        });
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  // Blood stays oxygen-rich; usable oxygen decays once H₂S takes hold (~after 2s).
  const bloodO2 = 100;
  const usableO2 = Math.round(100 * Math.exp(-Math.max(0, time - 2) / 6));
  const stage = currentStage(time);

  const BAR_X = 168;
  const BAR_W = 240;
  const bar = (value: number) => (value / 100) * BAR_W;

  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
        <svg
          viewBox="0 0 460 168"
          className="w-full"
          role="img"
          aria-label={`${time.toFixed(0)} ${t.seconds}: ${stage.title[locale]}`}
        >
          {/* big countdown */}
          <text
            x={20}
            y={52}
            style={{ fill: "var(--magenta)", fontSize: 46 }}
            className="font-display font-800 tabular-nums"
          >
            {time.toFixed(0)}
          </text>
          <text x={22} y={70} style={{ fill: "var(--subtle)", fontSize: 11 }} className="font-sans">
            {t.seconds}
          </text>

          {/* blood O2 bar — stays full */}
          <text
            x={BAR_X}
            y={36}
            style={{ fill: "var(--teal)", fontSize: 10 }}
            className="font-sans"
          >
            {t.bloodO2}
          </text>
          <rect
            x={BAR_X}
            y={42}
            width={BAR_W}
            height={16}
            rx={5}
            fill="var(--void)"
            stroke="var(--border)"
            strokeWidth={1}
          />
          <rect
            x={BAR_X}
            y={42}
            width={bar(bloodO2)}
            height={16}
            rx={5}
            style={{ fill: "var(--teal)", filter: "drop-shadow(0 0 5px var(--teal))" }}
          />
          <text
            x={BAR_X + BAR_W + 6}
            y={54}
            style={{ fill: "var(--teal)", fontSize: 11 }}
            className="font-display tabular-nums"
          >
            {bloodO2}%
          </text>

          {/* usable O2 bar — collapses */}
          <text
            x={BAR_X}
            y={92}
            style={{ fill: "var(--amber)", fontSize: 10 }}
            className="font-sans"
          >
            {t.usableO2}
          </text>
          <rect
            x={BAR_X}
            y={98}
            width={BAR_W}
            height={16}
            rx={5}
            fill="var(--void)"
            stroke="var(--border)"
            strokeWidth={1}
          />
          <rect
            x={BAR_X}
            y={98}
            width={bar(usableO2)}
            height={16}
            rx={5}
            style={{ fill: "var(--amber)", filter: "drop-shadow(0 0 5px var(--amber))" }}
          />
          <text
            x={BAR_X + BAR_W + 6}
            y={110}
            style={{ fill: "var(--amber)", fontSize: 11 }}
            className="font-display tabular-nums"
          >
            {usableO2}%
          </text>

          {/* stage markers along a mini timeline */}
          <line
            x1={BAR_X}
            y1={140}
            x2={BAR_X + BAR_W}
            y2={140}
            style={{ stroke: "var(--border)" }}
            strokeWidth={1.5}
          />
          {STAGES.map((s) => {
            const x = BAR_X + (s.at / MAX_T) * BAR_W;
            const active = time >= s.at;
            return (
              <circle
                key={s.at}
                cx={x}
                cy={140}
                r={active ? 4 : 3}
                style={{ fill: active ? "var(--magenta)" : "var(--border-strong)" }}
              />
            );
          })}
          <line
            x1={BAR_X + (Math.min(time, MAX_T) / MAX_T) * BAR_W}
            y1={132}
            x2={BAR_X + (Math.min(time, MAX_T) / MAX_T) * BAR_W}
            y2={148}
            style={{ stroke: "var(--magenta)" }}
            strokeWidth={2}
          />
        </svg>

        {/* stage text */}
        <div className="mt-1 rounded-lg border border-border bg-void/30 px-3 py-2">
          <p className="font-display text-sm font-700" style={{ color: "var(--magenta)" }}>
            {stage.title[locale]}
          </p>
          <p className="mt-0.5 font-serif text-sm leading-relaxed text-muted">
            {stage.body[locale]}
          </p>
        </div>

        {/* controls */}
        <div className="mt-3 flex items-center gap-3">
          {!reduced && (
            <button
              type="button"
              onClick={() => {
                if (time >= MAX_T) setTime(0);
                setPlaying((p) => !p);
              }}
              aria-label={playing ? t.pause : t.play}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-magenta transition-colors hover:bg-void/70"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <input
            id={`${uid}-t`}
            type="range"
            min={0}
            max={MAX_T}
            step={0.1}
            value={time}
            onChange={(e) => {
              setPlaying(false);
              setTime(Number(e.target.value));
            }}
            aria-label={t.timeline}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--magenta) ${(time / MAX_T) * 100}%, var(--border) ${(time / MAX_T) * 100}%)`,
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setTime(0);
            }}
            aria-label={t.reset}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-muted transition-colors hover:bg-void/70"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {!reduced && <p className="mt-3 font-sans text-xs text-subtle">{t.hint}</p>}
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic leading-relaxed text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

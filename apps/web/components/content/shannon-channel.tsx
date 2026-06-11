"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ShannonChannelProps {
  caption?: string;
  className?: string;
}

// Shannon-Hartley made playable. The reader sets a channel's bandwidth (B, Hz)
// and signal-to-noise ratio (S/N), picks a payload, and watches the capacity
// C = B·log2(1 + S/N) and the resulting transfer time. The two physical lessons
// are meant to be felt in the hands: capacity moves linearly with bandwidth but
// only logarithmically with signal power, so the S/N slider barely budges the
// answer while the B slider sweeps it across orders of magnitude. Slider-driven
// and fully deterministic — no animation loop, SSR-safe.

// Bandwidth slider runs in log space: value is the base-10 exponent of Hz.
const B_MIN_EXP = 0; // 1 Hz
const B_MAX_EXP = 9; // 1 GHz
const B_DEFAULT_EXP = 7; // ~the queue ceiling, ~10 MHz-class link

// Signal-to-noise slider, also log space: value is the base-10 exponent of the
// raw power ratio.
const SNR_MIN_EXP = 0; // ratio 1 (0 dB)
const SNR_MAX_EXP = 6; // ratio 1,000,000 (~60 dB)
const SNR_DEFAULT_EXP = 3; // ratio 1000 (~30 dB)

// Payload sizes in bits. Scientific constants stay in code per the viz contract;
// the human-facing names come from i18n.
const PAYLOADS: { key: string; bits: number; tone: string }[] = [
  { key: "word", bits: 10, tone: "var(--teal)" },
  { key: "photo", bits: 4e7, tone: "var(--cyan)" },
  { key: "stream", bits: 4.7e10, tone: "var(--amber)" },
  { key: "connectome", bits: 2e16, tone: "var(--magenta)" },
];

function formatHz(hz: number): string {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(2)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(2)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

function formatBitsPerSec(c: number): string {
  if (c >= 1e12) return `${(c / 1e12).toFixed(2)} Tb/s`;
  if (c >= 1e9) return `${(c / 1e9).toFixed(2)} Gb/s`;
  if (c >= 1e6) return `${(c / 1e6).toFixed(2)} Mb/s`;
  if (c >= 1e3) return `${(c / 1e3).toFixed(2)} kb/s`;
  return `${c.toFixed(1)} b/s`;
}

function formatBits(bits: number): string {
  if (bits >= 1e15) return `${(bits / 1e15).toFixed(1)} Pb`;
  if (bits >= 1e12) return `${(bits / 1e12).toFixed(1)} Tb`;
  if (bits >= 1e9) return `${(bits / 1e9).toFixed(1)} Gb`;
  if (bits >= 1e6) return `${(bits / 1e6).toFixed(1)} Mb`;
  if (bits >= 1e3) return `${(bits / 1e3).toFixed(1)} kb`;
  return `${bits.toFixed(0)} b`;
}

// Render seconds in the largest sensible unit, via the i18n unit strings.
function formatTime(
  seconds: number,
  unit: (key: string, vals: Record<string, string>) => string,
): string {
  if (seconds < 1e-3) return unit("instant", {});
  if (seconds < 1) return unit("seconds", { n: seconds.toFixed(2) });
  if (seconds < 60) return unit("seconds", { n: seconds.toFixed(1) });
  if (seconds < 3600) return unit("minutes", { n: (seconds / 60).toFixed(1) });
  if (seconds < 86400) return unit("hours", { n: (seconds / 3600).toFixed(1) });
  if (seconds < 31557600) return unit("days", { n: (seconds / 86400).toFixed(1) });
  return unit("years", { n: (seconds / 31557600).toFixed(1) });
}

export function ShannonChannel({ caption, className }: ShannonChannelProps) {
  const t = useTranslations("viz.shannonChannel");
  const uid = useId();
  const [bExp, setBExp] = useState(B_DEFAULT_EXP);
  const [snrExp, setSnrExp] = useState(SNR_DEFAULT_EXP);
  const [payloadKey, setPayloadKey] = useState(PAYLOADS[1].key);

  const bandwidth = 10 ** bExp; // Hz
  const snr = 10 ** snrExp; // raw power ratio
  const snrDb = 10 * Math.log10(snr);
  const capacity = bandwidth * Math.log2(1 + snr); // bits per second

  const payload = PAYLOADS.find((p) => p.key === payloadKey) ?? PAYLOADS[1];
  const transferSeconds = payload.bits / capacity;

  // A simple "pipe filling" gauge: how much of the payload the channel clears in
  // one second, on a log scale so the full dynamic range stays legible.
  const clearedInOneSec = Math.min(capacity, payload.bits);
  const fillPct =
    payload.bits <= 0
      ? 0
      : Math.max(
          2,
          Math.min(100, (Math.log10(clearedInOneSec + 1) / Math.log10(payload.bits + 1)) * 100),
        );

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone="cyan"
      className={className}
      hint={t("hint")}
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:w-1/2">
          <VizSlider
            label={t("bandwidth")}
            display={formatHz(bandwidth)}
            min={B_MIN_EXP}
            max={B_MAX_EXP}
            step={0.1}
            value={bExp}
            onChange={setBExp}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("snr")}
            display={`${snr.toLocaleString(undefined, { maximumFractionDigits: 0 })}× · ${snrDb.toFixed(0)} dB`}
            min={SNR_MIN_EXP}
            max={SNR_MAX_EXP}
            step={0.1}
            value={snrExp}
            onChange={setSnrExp}
            tone="var(--amber)"
          />

          <div>
            <p className="mb-1.5 font-sans text-xs text-muted">{t("payload")}</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYLOADS.map((p) => {
                const active = p.key === payloadKey;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPayloadKey(p.key)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-left font-sans text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan",
                      active
                        ? "text-foreground"
                        : "border-border bg-void/30 text-muted hover:border-cyan/40 hover:text-foreground",
                    )}
                    style={
                      active
                        ? {
                            borderColor: `color-mix(in oklab, ${p.tone} 55%, transparent)`,
                            background: `color-mix(in oklab, ${p.tone} 12%, var(--void))`,
                            boxShadow: `inset 0 1px 0 0 color-mix(in oklab, ${p.tone} 25%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    <span className="block font-700">{t(`payloads.${p.key}`)}</span>
                    <span className="block text-[0.7rem] text-subtle tabular-nums">
                      {formatBits(p.bits)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Readouts */}
        <div className="flex flex-col gap-2 sm:w-1/2">
          <svg
            viewBox="0 0 240 64"
            className="w-full"
            role="img"
            aria-label={t("aria", {
              capacity: formatBitsPerSec(capacity),
              time: formatTime(transferSeconds, (k, v) => t(`units.${k}`, v)),
            })}
          >
            <GlowDefs idBase={uid} tones={["cyan"]} />
            <rect x={4} y={22} width={232} height={20} rx={10} fill="var(--void)" stroke="var(--border)" />
            <rect
              x={4}
              y={22}
              width={(232 * fillPct) / 100}
              height={20}
              rx={10}
              fill="var(--cyan)"
              filter={glowUrl(uid, "bloom")}
              style={{ transition: "width 0.25s" }}
            />
            <text
              x={120}
              y={14}
              textAnchor="middle"
              className="font-sans"
              fontSize={9}
              fill="var(--subtle)"
            >
              {t("clearedPerSecond")}
            </text>
          </svg>

          <VizReadout label={t("capacity")} value={formatBitsPerSec(capacity)} tone="var(--cyan)" />
          <VizReadout
            label={t("transferTime")}
            value={formatTime(transferSeconds, (k, v) => t(`units.${k}`, v))}
            tone={payload.tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}

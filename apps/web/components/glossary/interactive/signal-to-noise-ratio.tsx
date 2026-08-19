"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Clean sine under a rising noise floor. Past threshold the waveform drowns.
export default function SignalToNoiseRatio() {
  const t = useTranslations("viz.signal-to-noise-ratio");
  const [noise, setNoise] = useState(0.3);

  const signalAmp = 0.85;
  const snrLinear = signalAmp / Math.max(0.04, noise);
  const snrDb = 10 * Math.log10(snrLinear);
  const recoverable = snrDb >= 3;

  const points = useMemo(() => {
    const pts: string[] = [];
    const noisy: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const x = 10 + (i / 40) * 80;
      const pure = Math.sin((i / 40) * Math.PI * 4) * 16 * signalAmp;
      const n =
        (Math.sin(i * 2.7) * 0.4 + Math.sin(i * 5.1) * 0.35 + Math.sin(i * 11.3) * 0.25) *
        noise *
        22;
      pts.push(`${x},${50 - pure}`);
      noisy.push(`${x},${50 - pure - n}`);
    }
    return { pure: pts.join(" "), noisy: noisy.join(" ") };
  }, [noise, signalAmp]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setNoise(0.3)}
      allowFullscreen={false}
      caption={
        <span className={recoverable ? "text-teal" : "text-magenta"}>
          {recoverable ? t("clean") : t("drowned")} · {snrDb.toFixed(1)} dB
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <line x1="10" y1="50" x2="90" y2="50" stroke="var(--border-strong)" strokeWidth="0.3" />

          {/* noise band */}
          <rect
            x="10"
            y={50 - noise * 22}
            width="80"
            height={noise * 44}
            fill="var(--magenta)"
            opacity={0.12 + noise * 0.2}
          />

          {/* pure signal ghost */}
          <polyline
            points={points.pure}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.6"
            opacity={0.3}
            strokeDasharray="1.5 1.5"
          />

          {/* observed */}
          <polyline
            points={points.noisy}
            fill="none"
            stroke={recoverable ? "var(--teal)" : "var(--magenta)"}
            strokeWidth="1.1"
            opacity={0.9}
          />

          {/* threshold mark */}
          <line
            x1="10"
            y1="50"
            x2="10"
            y2={50 - 16 * signalAmp}
            stroke="var(--amber)"
            strokeWidth="0.5"
          />
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("snr")}
            value={snrDb.toFixed(1)}
            unit="dB"
            accent={recoverable ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("noise")}
            value={noise}
            min={0.05}
            max={1}
            step={0.02}
            display={`${Math.round(noise * 100)}%`}
            onChange={setNoise}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

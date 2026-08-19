"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const COLORS = ["var(--cyan)", "var(--teal)", "var(--amber)", "var(--magenta)"];

// Parallel streams funnel into a narrow serial conscious gate.
export default function ConsciousBottleneck() {
  const t = useTranslations("viz.conscious-bottleneck");
  const [streams, setStreams] = useState(6);
  const [slots, setSlots] = useState(2);

  const items = useMemo(
    () =>
      Array.from({ length: streams }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        pass: i < slots,
      })),
    [streams, slots],
  );

  const queued = Math.max(0, streams - slots);
  const broadcast = Math.min(streams, slots);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setStreams(6);
        setSlots(2);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("broadcast")}: {broadcast} · {t("queued")}: {queued}
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
          {/* funnel walls */}
          <path
            d="M12 22 L42 52 L42 70 L58 70 L58 52 L88 22"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          {/* gate */}
          <rect
            x="40"
            y="52"
            width="20"
            height="4"
            rx="1"
            fill="var(--void)"
            stroke="var(--cyan)"
            strokeWidth="0.7"
          />

          {/* input streams */}
          {items.map((it, i) => {
            const x = 14 + (i / Math.max(streams - 1, 1)) * 72;
            return (
              <g key={it.id}>
                <circle cx={x} cy="18" r="2.4" fill={it.color} opacity={0.85} />
                <line
                  x1={x}
                  y1="21"
                  x2={it.pass ? 44 + (i % slots) * 6 : 50}
                  y2={it.pass ? 54 : 48}
                  stroke={it.color}
                  strokeWidth="0.7"
                  opacity={it.pass ? 0.85 : 0.3}
                  strokeDasharray={it.pass ? undefined : "1.5 1.5"}
                />
              </g>
            );
          })}

          {/* spotlight stage */}
          <ellipse
            cx="50"
            cy="82"
            rx="18"
            ry="6"
            fill="var(--cyan)"
            opacity={0.12 + broadcast * 0.06}
          />
          {items
            .filter((it) => it.pass)
            .map((it, i) => (
              <circle
                key={`b${it.id}`}
                cx={42 + i * 8}
                cy="82"
                r="3"
                fill={it.color}
                opacity={0.9}
              />
            ))}

          {/* queue pile */}
          {queued > 0 &&
            Array.from({ length: Math.min(queued, 6) }).map((_, i) => (
              <circle
                key={`q${i}`}
                cx={50 + (i % 3) * 3 - 3}
                cy={46 - Math.floor(i / 3) * 3}
                r="1.4"
                fill="var(--magenta)"
                opacity={0.5}
              />
            ))}
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("broadcast")} value={broadcast} accent="cyan" />
          <Readout label={t("queued")} value={queued} accent="magenta" />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          <ControlButton
            onClick={() => setStreams((s) => Math.min(12, s + 1))}
            className="px-2 py-1"
          >
            {t("add")}
          </ControlButton>
          <ControlButton
            onClick={() => {
              setStreams(3);
              setSlots(2);
            }}
            className="px-2 py-1"
          >
            {t("clear")}
          </ControlButton>
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("capacity")}
            value={slots}
            min={1}
            max={5}
            step={1}
            display={String(slots)}
            onChange={setSlots}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

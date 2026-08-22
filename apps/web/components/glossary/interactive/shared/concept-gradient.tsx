"use client";

import { useState } from "react";
import { ControlSlider } from "./control-slider";
import { GlossaryFrame } from "./frame";
import { Readout } from "./readout";

interface ConceptGradientProps {
  title: string;
  category: string;
  info: string;
  left: string;
  middle: string;
  right: string;
  control: string;
  low: string;
  high: string;
  caption: string;
}

export function ConceptGradient({
  title,
  category,
  info,
  left,
  middle,
  right,
  control,
  low,
  high,
  caption,
}: ConceptGradientProps) {
  const [position, setPosition] = useState(50);
  const x = 18 + position * 0.64;

  return (
    <GlossaryFrame
      title={title}
      category={category}
      infoText={info}
      onReset={() => setPosition(50)}
      allowFullscreen={false}
      caption={caption}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 76"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id={`concept-gradient-${title}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.22" />
              <stop offset="50%" stopColor="var(--teal)" stopOpacity="0.34" />
              <stop offset="100%" stopColor="var(--magenta)" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          <rect
            x="10"
            y="22"
            width="80"
            height="23"
            rx="11.5"
            fill={`url(#concept-gradient-${title})`}
          />
          <path
            d="M18 34 H82"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
          {[18, 50, 82].map((cx, index) => (
            <circle
              key={cx}
              cx={cx}
              cy="34"
              r={index === 1 ? 5.2 : 4.2}
              fill={index === 1 ? "var(--teal)" : index === 0 ? "var(--cyan)" : "var(--magenta)"}
              opacity={0.65}
            />
          ))}
          <circle cx={x} cy="34" r="7" fill="none" stroke="var(--amber)" strokeWidth="1.2" />
          <circle cx={x} cy="34" r="2" fill="var(--amber)" />
          <text x="18" y="51" textAnchor="middle" className="fill-muted font-mono text-[3px]">
            {left}
          </text>
          <text x="50" y="51" textAnchor="middle" className="fill-muted font-mono text-[3px]">
            {middle}
          </text>
          <text x="82" y="51" textAnchor="middle" className="fill-muted font-mono text-[3px]">
            {right}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={control} value={`${Math.round(position)}%`} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-9">
          <ControlSlider
            label={control}
            value={position}
            min={0}
            max={100}
            step={1}
            onChange={setPosition}
            display={position < 34 ? low : position > 66 ? high : middle}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

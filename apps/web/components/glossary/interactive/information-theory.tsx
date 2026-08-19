"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

function entropyOf(s: string): number {
  if (!s.length) return 0;
  const freq = new Map<string, number>();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  let h = 0;
  for (const c of freq.values()) {
    const p = c / s.length;
    h -= p * Math.log2(p);
  }
  return h;
}

function corrupt(s: string, noise: number): string {
  if (!s) return "";
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 ";
  return s
    .split("")
    .map((ch) => {
      if (Math.random() < noise * 0.55) {
        return alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return ch;
    })
    .join("");
}

// Pipeline: type → encode → noisy channel → decode. Entropy & redundancy live.
export default function InformationTheory() {
  const t = useTranslations("viz.information-theory");
  const [text, setText] = useState("eywa");
  const [noise, setNoise] = useState(0.25);
  const [received, setReceived] = useState("eywa");
  const [sent, setSent] = useState(0);

  const H = useMemo(() => entropyOf(text.toLowerCase()), [text]);
  const redundancy = useMemo(() => {
    if (!text.length) return 0;
    const maxH = Math.log2(Math.min(27, Math.max(2, text.length)));
    return Math.max(0, 1 - H / maxH);
  }, [text, H]);

  const send = () => {
    const r = corrupt(text.toLowerCase(), noise);
    setReceived(r);
    setSent((n) => n + 1);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setText("eywa");
        setNoise(0.25);
        setReceived("eywa");
        setSent(0);
      }}
      allowFullscreen={false}
      caption={
        <span className="text-cyan">
          {t("received")}: {received || "—"}
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
          {/* pipeline boxes */}
          {[
            { x: 10, label: "msg" },
            { x: 32, label: "enc" },
            { x: 54, label: "ch" },
            { x: 76, label: "dec" },
          ].map((b) => (
            <g key={b.x}>
              <rect
                x={b.x}
                y="36"
                width="16"
                height="14"
                rx="1.5"
                fill="var(--surface)"
                stroke="var(--cyan)"
                strokeWidth="0.6"
              />
              <text
                x={b.x + 8}
                y="45"
                textAnchor="middle"
                style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--cyan)" }}
              >
                {b.label}
              </text>
            </g>
          ))}
          {[26, 48, 70].map((x) => (
            <path
              key={x}
              d={`M${x} 43 L${x + 5} 43`}
              stroke="var(--teal)"
              strokeWidth="0.8"
              markerEnd="url(#a)"
            />
          ))}

          {/* noise cloud over channel */}
          {Array.from({ length: Math.round(4 + noise * 16) }).map((_, i) => (
            <circle
              key={i}
              cx={58 + (i % 5) * 2.2}
              cy={30 + Math.floor(i / 5) * 3}
              r="1"
              fill="var(--magenta)"
              opacity={0.35 + noise * 0.4}
            />
          ))}

          {/* meters */}
          <rect x="12" y="62" width="36" height="4" rx="1" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.3" />
          <rect x="12" y="62" width={Math.min(36, H * 12)} height="4" rx="1" fill="var(--amber)" opacity={0.8} />
          <text x="12" y="72" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--amber)" }}>
            H={H.toFixed(2)}
          </text>

          <rect x="52" y="62" width="36" height="4" rx="1" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.3" />
          <rect x="52" y="62" width={Math.min(36, redundancy * 36)} height="4" rx="1" fill="var(--teal)" opacity={0.8} />
          <text x="52" y="72" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--teal)" }}>
            R={redundancy.toFixed(2)}
          </text>
        </svg>

        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("entropy")} value={H.toFixed(2)} accent="amber" />
          <Readout
            label={t("redundancy")}
            value={redundancy.toFixed(2)}
            accent="teal"
          />
        </div>

        <div className="absolute left-3 top-12 flex items-center gap-1">
          <input
            type="text"
            value={text}
            maxLength={12}
            placeholder={t("placeholder")}
            onChange={(e) => setText(e.target.value)}
            className="w-28 rounded-md border border-border/40 bg-void/80 px-2 py-1 font-mono text-[11px] text-foreground outline-none focus:border-cyan"
          />
          <ControlButton onClick={send} className="px-2 py-1" variant="accent">
            {t("send")}
          </ControlButton>
          <ControlButton
            onClick={() => {
              setText("");
              setReceived("");
            }}
            className="px-2 py-1"
          >
            {t("clear")}
          </ControlButton>
        </div>

        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label="noise"
            value={noise}
            min={0}
            max={0.9}
            step={0.02}
            display={`${Math.round(noise * 100)}% · #${sent}`}
            onChange={setNoise}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

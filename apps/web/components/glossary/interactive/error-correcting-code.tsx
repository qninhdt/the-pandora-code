"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Mode = "raw" | "parity" | "hamming";

const DATA = [1, 0, 1, 1]; // 4 data bits

function parityBit(bits: number[]) {
  return bits.reduce((a, b) => a ^ b, 0);
}

// Hamming(7,4) encode
function hammingEncode(d: number[]) {
  const p1 = d[0] ^ d[1] ^ d[3];
  const p2 = d[0] ^ d[2] ^ d[3];
  const p4 = d[1] ^ d[2] ^ d[3];
  return [p1, p2, d[0], p4, d[1], d[2], d[3]];
}

function hammingCorrect(recv: number[]) {
  const r = [...recv];
  const s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
  const s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
  const s4 = r[3] ^ r[4] ^ r[5] ^ r[6];
  const syndrome = s1 + s2 * 2 + s4 * 4;
  if (syndrome > 0 && syndrome <= 7) r[syndrome - 1] ^= 1;
  return { fixed: r, syndrome };
}

function flipNoise(bits: number[], p: number, rng: () => number) {
  return bits.map((b) => (rng() < p ? b ^ 1 : b));
}

export default function ErrorCorrectingCode() {
  const t = useTranslations("viz.error-correcting-code");
  const [mode, setMode] = useState<Mode>("hamming");
  const [noise, setNoise] = useState(0.18);
  const [seed, setSeed] = useState(1);

  const result = useMemo(() => {
    let s = seed * 999_91;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return (s & 0x7fffffff) / 0x7fffffff;
    };
    let sent: number[];
    if (mode === "raw") sent = [...DATA];
    else if (mode === "parity") sent = [...DATA, parityBit(DATA)];
    else sent = hammingEncode(DATA);

    const recv = flipNoise(sent, noise, rng);
    const flips = sent.reduce((n, b, i) => n + (b !== recv[i] ? 1 : 0), 0);

    let decoded: number[];
    let corrected = false;
    if (mode === "raw") {
      decoded = recv;
    } else if (mode === "parity") {
      const data = recv.slice(0, 4);
      const ok = parityBit(data) === recv[4];
      decoded = data;
      corrected = ok;
    } else {
      const { fixed, syndrome } = hammingCorrect(recv);
      decoded = [fixed[2], fixed[4], fixed[5], fixed[6]];
      corrected = syndrome === 0 || syndrome > 0;
    }
    const match = decoded.every((b, i) => b === DATA[i]);
    return { sent, recv, decoded, flips, match, corrected };
  }, [mode, noise, seed]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setMode("hamming");
        setNoise(0.18);
        setSeed(1);
      }}
      allowFullscreen={false}
      caption={
        <span className={result.match ? "text-teal" : "text-magenta"}>
          {result.match ? t("fixed") : t("errors")} · flips={result.flips}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {/* source */}
          {DATA.map((b, i) => (
            <g key={`s${i}`}>
              <rect
                x={8 + i * 8}
                y={22}
                width={6.5}
                height={10}
                rx={0.8}
                fill={b ? "var(--cyan)" : "var(--surface)"}
                stroke="var(--cyan)"
                strokeWidth={0.5}
                opacity={0.9}
              />
              <text
                x={11.25 + i * 8}
                y={29}
                textAnchor="middle"
                style={{
                  fontSize: 3.5,
                  fontFamily: "monospace",
                  fill: b ? "var(--void)" : "var(--cyan)",
                }}
              >
                {b}
              </text>
            </g>
          ))}
          <text
            x={22}
            y={18}
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            SRC
          </text>
          {/* channel noise arc */}
          <path
            d="M40 27 C55 10, 55 10, 70 27"
            fill="none"
            stroke="var(--amber)"
            strokeWidth={0.6}
            strokeDasharray="1.5 1.2"
            opacity={0.7}
          />
          <text
            x={55}
            y={14}
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            noise
          </text>
          {/* received */}
          {result.recv.slice(0, 7).map((b, i) => {
            const bad = result.sent[i] !== b;
            return (
              <g key={`r${i}`}>
                <rect
                  x={8 + i * 8}
                  y={42}
                  width={6.5}
                  height={10}
                  rx={0.8}
                  fill={bad ? "var(--magenta)" : b ? "var(--teal)" : "var(--surface)"}
                  stroke={bad ? "var(--magenta)" : "var(--teal)"}
                  strokeWidth={0.5}
                  opacity={0.9}
                />
                <text
                  x={11.25 + i * 8}
                  y={49}
                  textAnchor="middle"
                  style={{
                    fontSize: 3.5,
                    fontFamily: "monospace",
                    fill: bad || b ? "var(--void)" : "var(--teal)",
                  }}
                >
                  {b}
                </text>
              </g>
            );
          })}
          {/* decoded */}
          {result.decoded.map((b, i) => {
            const ok = b === DATA[i];
            return (
              <g key={`d${i}`}>
                <rect
                  x={8 + i * 8}
                  y={64}
                  width={6.5}
                  height={10}
                  rx={0.8}
                  fill={ok ? (b ? "var(--cyan)" : "var(--surface)") : "var(--magenta)"}
                  stroke={ok ? "var(--cyan)" : "var(--magenta)"}
                  strokeWidth={0.5}
                />
                <text
                  x={11.25 + i * 8}
                  y={71}
                  textAnchor="middle"
                  style={{
                    fontSize: 3.5,
                    fontFamily: "monospace",
                    fill: ok && b ? "var(--void)" : ok ? "var(--cyan)" : "var(--void)",
                  }}
                >
                  {b}
                </text>
              </g>
            );
          })}
          <text
            x={22}
            y={82}
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            OUT
          </text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5 items-end">
          <ControlTabs
            value={mode}
            onChange={setMode}
            options={[
              { value: "raw", label: t("raw") },
              { value: "parity", label: t("parity") },
              { value: "hamming", label: t("hamming") },
            ]}
          />
          <Readout
            label={t("errors")}
            value={result.flips}
            accent={result.match ? "teal" : "magenta"}
          />
          <ControlButton onClick={() => setSeed((s) => s + 1)} className="px-2.5">
            ↻
          </ControlButton>
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("noise")}
            value={noise}
            min={0}
            max={0.5}
            step={0.02}
            display={`${Math.round(noise * 100)}%`}
            onChange={setNoise}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

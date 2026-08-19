"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The magnetic mirror switching on. Above its critical temperature a disc is an
// ordinary conductor and a magnet's field threads straight through it. Cool it
// past Tc and lossless surface currents spring up, holding exactly the pattern
// needed to cancel the field inside the bulk: every line is thrown out, the
// interior falls to zero, and the expelled field shoves the magnet up into a
// hover. This is the lift — pure repulsion — the twitchy half Earnshaw forbids.
const LINE_XS = [26, 34, 42, 50, 58, 66, 74];

export default function MeissnerEffect() {
  const t = useTranslations("viz.meissner-effect");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [temp, setTemp] = useState(0.72); // 0..1, Tc at 0.5
  const flow = useState(0)[1];

  useRafLoop(() => flow((n) => (n + 1) % 1_000_000), { active: inView });

  const TC = 0.5;
  const expel = Math.max(0, Math.min(1, (TC - temp) / TC)); // 0 normal → 1 full
  const superconducting = temp < TC;

  const discY = 76;
  const magY = discY - 15 - expel * 22; // magnet climbs as the field is thrown out
  const interiorField = Math.round((1 - expel) * 100);
  const dashPhase = -(Date.now() / 1000) * 6; // flowing field lines

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setTemp(0.72)}
      allowFullscreen={false}
      caption={
        superconducting ? (
          <span className="text-teal">{t("levitating")}</span>
        ) : (
          <span className="text-muted">{t("fieldPenetrates")}</span>
        )
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
          <defs>
            <radialGradient id="mei-bg" cx="50%" cy="34%" r="70%">
              <stop
                offset="0%"
                stopColor={superconducting ? "#0e2438" : "#141024"}
              />
              <stop offset="100%" stopColor="#070912" />
            </radialGradient>
            <linearGradient id="mei-mag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7db8" />
              <stop offset="50%" stopColor="#ff5da8" />
              <stop offset="100%" stopColor="#c23c78" />
            </linearGradient>
            <linearGradient id="mei-mag-n" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b93a5" />
              <stop offset="100%" stopColor="#3a4150" />
            </linearGradient>
            <radialGradient id="mei-disc" cx="50%" cy="30%" r="80%">
              <stop
                offset="0%"
                stopColor={superconducting ? "#1c4a52" : "#232a3a"}
              />
              <stop offset="100%" stopColor="#0b1220" />
            </radialGradient>
            <radialGradient id="mei-cushion" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.55" />
              <stop offset="70%" stopColor="var(--cyan)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
            </radialGradient>
            <filter id="mei-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.1" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#mei-bg)" />

          {/* drifting cryo vapour once the disc goes cold */}
          {superconducting &&
            Array.from({ length: 7 }, (_, i) => {
              const t0 = (Date.now() / 1000) * 0.12 + i * 0.9;
              const dx = ((t0 % 1) * 120 - 10 + i * 4) % 110;
              return (
                <ellipse
                  key={i}
                  cx={dx}
                  cy={discY + 7 + Math.sin(t0 * 2) * 1.4 + (i % 2) * 2}
                  rx={9 + (i % 3) * 2}
                  ry="1.6"
                  fill="#bfe4f5"
                  opacity={expel * 0.09}
                />
              );
            })}

          {/* field lines: penetrate straight when normal, arc around when cold */}
          <g filter="url(#mei-glow)">
            {LINE_XS.map((x, i) => {
              const off = x - 50;
              if (!superconducting) {
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={magY + 9}
                    x2={x}
                    y2={discY + 14}
                    stroke="var(--cyan)"
                    strokeWidth="0.6"
                    strokeDasharray="3 2"
                    strokeDashoffset={dashPhase}
                    opacity="0.5"
                  />
                );
              }
              const bend = expel * (12 + Math.abs(off) * 0.32);
              const dir = Math.sign(off || 1);
              const sideX = x + dir * bend;
              return (
                <path
                  key={i}
                  d={`M${x} ${magY + 9} Q ${sideX} ${(magY + discY) / 2} ${sideX} ${discY} Q ${sideX} ${discY + 9} ${x + dir * bend * 0.3} ${discY + 12}`}
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="0.6"
                  strokeDasharray="3 2"
                  strokeDashoffset={dashPhase}
                  opacity={0.3 + expel * 0.5}
                />
              );
            })}
          </g>

          {/* levitation cushion glow under the floating magnet */}
          {superconducting && (
            <ellipse
              cx="50"
              cy={magY + 12}
              rx={16 + expel * 5}
              ry={5 + expel * 2}
              fill="url(#mei-cushion)"
              opacity={expel}
            />
          )}

          {/* the bar magnet — N pole steel, S pole magenta */}
          <g filter={superconducting ? "url(#mei-glow)" : undefined}>
            <rect
              x="38"
              y={magY}
              width="24"
              height="9"
              rx="1.4"
              fill="url(#mei-mag)"
            />
            <rect
              x="38"
              y={magY}
              width="12"
              height="9"
              rx="1.4"
              fill="url(#mei-mag-n)"
            />
            <rect
              x="38"
              y={magY}
              width="24"
              height="3"
              rx="1.4"
              fill="#ffffff"
              opacity="0.18"
            />
          </g>

          {/* superconducting disc with real thickness */}
          <path
            d={`M30 ${discY} A20 5.5 0 0 0 70 ${discY} L70 ${discY + 9} A20 5.5 0 0 1 30 ${discY + 9} Z`}
            fill="url(#mei-disc)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <ellipse
            cx="50"
            cy={discY}
            rx="20"
            ry="5.5"
            fill="url(#mei-disc)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          {/* surface current ring — the source of the expelling field */}
          {superconducting && (
            <ellipse
              cx="50"
              cy={discY}
              rx={17}
              ry={4.4}
              fill="none"
              stroke="var(--teal)"
              strokeWidth={0.5 + expel}
              strokeDasharray="4 2.5"
              strokeDashoffset={dashPhase * 1.5}
              opacity={expel * 0.9}
              filter="url(#mei-glow)"
            />
          )}
          {/* frost sheen on the cold face */}
          {superconducting && (
            <ellipse
              cx="45"
              cy={discY - 1.6}
              rx="9"
              ry="2.2"
              fill="#cfeafd"
              opacity={expel * 0.22}
            />
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("interior")}
            value={`${interiorField}%`}
            accent={interiorField < 10 ? "teal" : "foreground"}
          />
          <Readout
            label={t("state")}
            value={superconducting ? t("superconducting") : t("normal")}
            accent={superconducting ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("temperature")}
            value={temp}
            min={0}
            max={1}
            step={0.01}
            onChange={setTemp}
            display={superconducting ? t("belowTc") : t("aboveTc")}
            thumb={superconducting ? "teal" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

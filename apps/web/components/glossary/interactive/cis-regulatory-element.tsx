"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// Where evolution does most of its real work. Around every gene sit stretches
// of non-coding DNA that act as switches — deciding when, where and how
// strongly the gene fires. Rather than risk redesigning a precious master gene
// (which breaks everything at once), evolution retunes a switch: add a spot of
// colour here, suppress a limb on one segment there, leaving the coding
// sequence itself untouched. Flip a switch and RNA polymerase, once it can
// dock, rides the strand and lights the tissue that switch governs — the gene
// never changes, only who gets to read it.
const SWITCHES = [
  { key: "eyeSpot", tissue: "head", x: 18 },
  { key: "limbBud", tissue: "thorax", x: 33 },
  { key: "pigment", tissue: "flank", x: 48 },
];
const GENE_X0 = 62;
const GENE_X1 = 84;

export default function CisRegulatoryElement() {
  const t = useTranslations("viz.cis-regulatory-element");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [on, setOn] = useState<boolean[]>([true, false, true]);

  const clock = useRef(0);
  const force = useState(0)[1];
  useRafLoop(
    (_dt, elapsed) => {
      clock.current = elapsed;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const activeCount = on.filter(Boolean).length;
  const anyActive = activeCount > 0;
  // polymerase rides the strand only while at least one switch is docked
  const rideT = anyActive ? (clock.current * 0.35) % 1 : 0;
  const polyX = GENE_X0 - 4 + rideT * (GENE_X1 - GENE_X0 + 4);
  const transcribing = anyActive && polyX > GENE_X0;
  const pulse = 0.5 + 0.5 * Math.sin(clock.current * 3);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOn([true, false, true])}
      allowFullscreen={false}
      caption={
        <span>
          {t("geneIntact")} ·{" "}
          <span className="text-cyan">{activeCount}</span> / {SWITCHES.length}{" "}
          {t("switchesOn")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="cre-bg" cx="50%" cy="26%" r="80%">
              <stop offset="0%" stopColor="#101a2c" />
              <stop offset="100%" stopColor="#070912" />
            </radialGradient>
            <linearGradient id="cre-gene" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#cfe6f5" />
              <stop offset="100%" stopColor="#8fa6c0" />
            </linearGradient>
            <radialGradient id="cre-switch-on" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#8fe9f5" />
              <stop offset="100%" stopColor="var(--cyan)" />
            </radialGradient>
            <radialGradient id="cre-tissue-on" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.15" />
            </radialGradient>
            <filter id="cre-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#cre-bg)" />

          {/* the DNA backbone — a subtle twin-rail helix run */}
          <path
            d="M10 28 Q30 24 50 28 T90 28"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            opacity="0.5"
          />
          <path
            d="M10 32 Q30 28 50 32 T90 32"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            opacity="0.3"
          />
          {Array.from({ length: 17 }, (_, i) => {
            const x = 10 + i * 4.6;
            return (
              <line
                key={i}
                x1={x}
                y1={28 + Math.sin(i * 0.9) * 1.6}
                x2={x}
                y2={32 + Math.sin(i * 0.9) * 1.4}
                stroke="var(--border-strong)"
                strokeWidth="0.4"
                opacity="0.35"
              />
            );
          })}

          {/* the master coding gene block — always intact, downstream */}
          <rect
            x={GENE_X0}
            y="24"
            width={GENE_X1 - GENE_X0}
            height="10"
            rx="2"
            fill="url(#cre-gene)"
            opacity="0.92"
          />
          <text
            x={(GENE_X0 + GENE_X1) / 2}
            y="19"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.9, fontFamily: "monospace" }}
          >
            {t("codingGene")}
          </text>

          {/* travelling RNA polymerase, only once a switch has docked */}
          {anyActive && (
            <g filter="url(#cre-glow)">
              <circle cx={polyX} cy="29" r="2.1" fill="var(--amber)" opacity={transcribing ? 1 : 0.65} />
              {transcribing && (
                <path
                  d={`M${GENE_X0} 29 L${polyX} 29`}
                  stroke="var(--amber)"
                  strokeWidth="0.9"
                  opacity="0.55"
                  strokeDasharray="1.2 1.2"
                  strokeDashoffset={-clock.current * 20}
                />
              )}
            </g>
          )}

          {/* the cis switches upstream of the gene */}
          {SWITCHES.map((s, i) => {
            const active = on[i];
            return (
              <g key={s.key}>
                {active && (
                  <circle cx={s.x} cy={30} r={5.5 + pulse * 1.2} fill="var(--cyan)" opacity="0.16" />
                )}
                <rect
                  x={s.x - 4}
                  y={26}
                  width={8}
                  height={8}
                  rx="1.6"
                  fill={active ? "url(#cre-switch-on)" : "var(--surface)"}
                  stroke={active ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.6"
                  opacity={active ? 1 : 0.55}
                  filter={active ? "url(#cre-glow)" : undefined}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(s.key)}
                  aria-pressed={active}
                  onClick={() => setOn((p) => p.map((v, j) => (j === i ? !v : v)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOn((p) => p.map((v, j) => (j === i ? !v : v)));
                    }
                  }}
                />
                {active && (
                  <path
                    d={`M${s.x} 34 Q${s.x + (GENE_X0 - s.x) * 0.4} 46 ${30 + i * 20} 60`}
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="0.4"
                    opacity="0.4"
                    strokeDasharray="1.4 1.6"
                    strokeDashoffset={-clock.current * 8}
                  />
                )}
              </g>
            );
          })}

          {/* the developing body with its reporter tissues */}
          <ellipse
            cx="50"
            cy="76"
            rx="34"
            ry="13"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            opacity="0.5"
          />
          {SWITCHES.map((s, i) => {
            const tx = 26 + i * 24;
            const active = on[i];
            return (
              <g key={s.key}>
                {active && (
                  <circle cx={tx} cy={76} r={7 + pulse * 1.4} fill="var(--cyan)" opacity="0.18" />
                )}
                <circle
                  cx={tx}
                  cy={76}
                  r={active ? 5 : 3}
                  fill={active ? "url(#cre-tissue-on)" : "var(--void)"}
                  opacity={active ? 1 : 0.35}
                  filter={active ? "url(#cre-glow)" : undefined}
                  stroke={active ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.4"
                />
                <text
                  x={tx}
                  y={92}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.7,
                    fontFamily: "monospace",
                    fill: active ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {t(s.tissue)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout label={t("expressed")} value={`${activeCount}/${SWITCHES.length}`} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-12 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
          {t("tapSwitches")}
        </div>
      </div>
    </GlossaryFrame>
  );
}

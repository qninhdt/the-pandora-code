"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Agent = { x: number; y: number; role: number };

function seedAgents(n = 36): Agent[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {
      x: 50 + Math.cos(a) * (8 + (i % 5) * 4),
      y: 48 + Math.sin(a) * (8 + (i % 5) * 3.5),
      role: i % 3,
    };
  });
}

export default function Superorganism() {
  const t = useTranslations("viz.superorganism");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [zoom, setZoom] = useState(0.2); // 0 = agents, 1 = colony
  const [playing, setPlaying] = useState(true);
  const agents = useRef(seedAgents());
  const phase = useRef(0);
  const [, bump] = useState(0);

  // colony decision: vote of local roles oscillating
  const vote = (() => {
    const scores = [0, 0, 0];
    for (const a of agents.current) scores[a.role]++;
    const max = Math.max(...scores);
    return scores.indexOf(max);
  })();
  const choiceLabel = ["FORAGE", "DEFEND", "BUILD"][vote];

  useRafLoop(
    (dt) => {
      phase.current += dt;
      const z = zoom;
      agents.current = agents.current.map((a, i) => {
        const a0 = (i / agents.current.length) * Math.PI * 2 + phase.current * 0.4;
        // agent-scale wander
        const wanderR = 18 + Math.sin(phase.current + i) * 4;
        const ax = 50 + Math.cos(a0) * wanderR;
        const ay = 48 + Math.sin(a0 * 1.1) * wanderR * 0.75;
        // colony-scale: collapse toward center rings by role
        const cr = 6 + a.role * 5;
        const cx = 50 + Math.cos(a0 * 0.3 + a.role) * cr;
        const cy = 48 + Math.sin(a0 * 0.3 + a.role) * cr;
        return {
          ...a,
          x: ax * (1 - z) + cx * z,
          y: ay * (1 - z) + cy * z,
        };
      });
      // occasionally flip roles when zoomed out (colony "decision")
      if (z > 0.6 && Math.random() < dt * 0.3) {
        const i = Math.floor(Math.random() * agents.current.length);
        agents.current[i] = {
          ...agents.current[i],
          role: vote,
        };
      }
      bump((n) => (n + 1) % 1_000_000);
    },
    { active: inView && playing },
  );

  const colors = ["var(--cyan)", "var(--teal)", "var(--amber)"];
  const colonyMode = zoom > 0.55;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        agents.current = seedAgents();
        setZoom(0.2);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={
        <span className={colonyMode ? "text-amber" : "text-cyan"}>
          {colonyMode ? t("colony") : t("agents")}: {choiceLabel}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {colonyMode && (
            <circle
              cx="50"
              cy="48"
              r={16 + zoom * 8}
              fill="var(--amber)"
              opacity={0.08 + zoom * 0.12}
              stroke="var(--amber)"
              strokeWidth={0.6}
            />
          )}
          {agents.current.map((a, i) => (
            <circle
              key={i}
              cx={a.x}
              cy={a.y}
              r={colonyMode ? 1.2 : 2}
              fill={colors[a.role]}
              opacity={colonyMode ? 0.55 : 0.9}
            />
          ))}
          {colonyMode && (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              style={{ fontSize: 4, fontFamily: "monospace", fill: "var(--amber)", fontWeight: 700 }}
            >
              {choiceLabel}
            </text>
          )}
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("colony")} value={choiceLabel} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("zoom")}
            value={zoom}
            min={0}
            max={1}
            step={0.02}
            display={zoom.toFixed(2)}
            onChange={setZoom}
            thumb="amber"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

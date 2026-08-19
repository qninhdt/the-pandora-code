"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Layer = "power" | "comms";
type N = { id: number; layer: Layer; x: number; y: number; dead: boolean };

const INTRA: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 3], [1, 3],
  [4, 5], [5, 6], [6, 7], [4, 7], [5, 7],
];
// interdependent couples: power i ↔ comms i
const COUPLE: [number, number][] = [
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function seed(): N[] {
  return [
    { id: 0, layer: "power", x: 22, y: 30, dead: false },
    { id: 1, layer: "power", x: 40, y: 22, dead: false },
    { id: 2, layer: "power", x: 40, y: 40, dead: false },
    { id: 3, layer: "power", x: 58, y: 30, dead: false },
    { id: 4, layer: "comms", x: 42, y: 68, dead: false },
    { id: 5, layer: "comms", x: 60, y: 60, dead: false },
    { id: 6, layer: "comms", x: 60, y: 78, dead: false },
    { id: 7, layer: "comms", x: 78, y: 68, dead: false },
  ];
}

export default function InterdependentNetworks() {
  const t = useTranslations("viz.interdependent-networks");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [nodes, setNodes] = useState(seed);
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState(0);

  const powerAlive = nodes.filter((n) => n.layer === "power" && !n.dead).length;
  const commsAlive = nodes.filter((n) => n.layer === "comms" && !n.dead).length;

  const fail = useCallback((id: number) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, dead: true } : n)));
    setPlaying(true);
    setSteps(0);
  }, []);

  useRafLoop(
    () => {
      if (!playing) return;
      setNodes((prev) => {
        const dead = new Set(prev.filter((n) => n.dead).map((n) => n.id));
        const nextDead = new Set(dead);
        // node dies if its couple is dead OR it has no live intra-neighbor while couple needs it
        for (const [a, b] of COUPLE) {
          if (dead.has(a) && !dead.has(b)) nextDead.add(b);
          if (dead.has(b) && !dead.has(a)) nextDead.add(a);
        }
        // isolated in own layer also dies (needs support)
        for (const n of prev) {
          if (nextDead.has(n.id)) continue;
          const neighbors = INTRA.filter(([x, y]) => x === n.id || y === n.id).map(
            ([x, y]) => (x === n.id ? y : x),
          );
          const liveN = neighbors.filter((id) => !nextDead.has(id));
          if (neighbors.length > 0 && liveN.length === 0) nextDead.add(n.id);
        }
        if (nextDead.size === dead.size) {
          setPlaying(false);
          return prev;
        }
        setSteps((s) => s + 1);
        return prev.map((n) => (nextDead.has(n.id) ? { ...n, dead: true } : n));
      });
    },
    { active: inView && playing },
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setNodes(seed());
        setPlaying(false);
        setSteps(0);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={
        <span>
          {t("cascade")}: {steps} · {t("power")} {powerAlive} · {t("comms")} {commsAlive}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          <text x="40" y="14" textAnchor="middle" style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--amber)" }}>{t("power")}</text>
          <text x="60" y="92" textAnchor="middle" style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--cyan)" }}>{t("comms")}</text>
          {COUPLE.map(([a, b]) => {
            const na = nodes[a];
            const nb = nodes[b];
            const dead = na.dead || nb.dead;
            return (
              <line key={`c${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={dead ? "var(--magenta)" : "var(--teal)"} strokeWidth={0.7}
                strokeDasharray="1.5 1" opacity={dead ? 0.25 : 0.7} />
            );
          })}
          {INTRA.map(([a, b]) => {
            const na = nodes[a];
            const nb = nodes[b];
            const col = na.layer === "power" ? "var(--amber)" : "var(--cyan)";
            return (
              <line key={`i${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={col} strokeWidth={0.6} opacity={na.dead || nb.dead ? 0.15 : 0.55} />
            );
          })}
          {nodes.map((n) => (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={4.5}
              fill={n.dead ? "var(--void)" : "var(--surface)"}
              stroke={n.dead ? "var(--magenta)" : n.layer === "power" ? "var(--amber)" : "var(--cyan)"}
              strokeWidth={1.1}
              opacity={n.dead ? 0.4 : 0.95}
              className="cursor-pointer"
              onClick={() => !n.dead && fail(n.id)}
            />
          ))}
        </svg>
        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <ControlButton
            onClick={() => {
              const live = nodes.filter((n) => !n.dead);
              if (live.length) fail(live[0].id);
            }}
            className="px-2.5"
          >
            {t("fail")}
          </ControlButton>
          <Readout label={t("power")} value={powerAlive} accent="amber" />
          <Readout label={t("comms")} value={commsAlive} accent="cyan" />
        </div>
      </div>
    </GlossaryFrame>
  );
}

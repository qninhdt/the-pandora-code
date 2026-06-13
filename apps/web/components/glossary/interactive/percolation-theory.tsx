"use client";

import { useTranslations } from "next-intl";
import React, { useState, useMemo } from "react";
import { GlossaryFrame } from "./shared/frame";

interface Node {
  id: number;
  x: number;
  y: number;
  isHub: boolean;
  degree: number;
}

interface Edge {
  u: number;
  v: number;
}

export default function PercolationTheory() {
  const t = useTranslations("viz.percolationNetwork");

  const [mode, setMode] = useState<"random" | "targeted">("random");
  const [removedFraction, setRemovedFraction] = useState(0); // 0 to 100

  // 1. Define nodes and connections for a small scale-free network (18 nodes)
  const nodes: Node[] = useMemo(
    () => [
      { id: 0, x: 200, y: 70, isHub: true, degree: 8 }, // Central Mother Tree Hub
      { id: 1, x: 100, y: 50, isHub: true, degree: 5 }, // Left Hub
      { id: 2, x: 300, y: 55, isHub: true, degree: 5 }, // Right Hub
      { id: 3, x: 140, y: 95, isHub: false, degree: 3 },
      { id: 4, x: 260, y: 95, isHub: false, degree: 3 },
      { id: 5, x: 60, y: 80, isHub: false, degree: 2 },
      { id: 6, x: 340, y: 85, isHub: false, degree: 2 },
      { id: 7, x: 200, y: 25, isHub: false, degree: 2 },
      { id: 8, x: 50, y: 35, isHub: false, degree: 1 },
      { id: 9, x: 90, y: 15, isHub: false, degree: 1 },
      { id: 10, x: 120, y: 20, isHub: false, degree: 1 },
      { id: 11, x: 280, y: 20, isHub: false, degree: 1 },
      { id: 12, x: 310, y: 18, isHub: false, degree: 1 },
      { id: 13, x: 360, y: 40, isHub: false, degree: 1 },
      { id: 14, x: 90, y: 100, isHub: false, degree: 1 },
      { id: 15, x: 170, y: 115, isHub: false, degree: 1 },
      { id: 16, x: 230, y: 115, isHub: false, degree: 1 },
      { id: 17, x: 310, y: 105, isHub: false, degree: 1 },
    ],
    [],
  );

  const edges: Edge[] = useMemo(
    () => [
      { u: 0, v: 1 },
      { u: 0, v: 2 },
      { u: 0, v: 3 },
      { u: 0, v: 4 },
      { u: 0, v: 7 },
      { u: 0, v: 15 },
      { u: 0, v: 16 },
      { u: 1, v: 3 },
      { u: 1, v: 5 },
      { u: 1, v: 8 },
      { u: 1, v: 9 },
      { u: 1, v: 10 },
      { u: 2, v: 4 },
      { u: 2, v: 6 },
      { u: 2, v: 11 },
      { u: 2, v: 12 },
      { u: 2, v: 13 },
      { u: 3, v: 5 },
      { u: 3, v: 14 },
      { u: 4, v: 6 },
      { u: 4, v: 17 },
      { u: 5, v: 8 },
      { u: 6, v: 13 },
      { u: 7, v: 10 },
    ],
    [],
  );

  // Predetermined removal orders to ensure slider movement is deterministic
  // Random mode: pseudo-random sequence of node ids
  const randomOrder = useMemo(
    () => [13, 5, 8, 11, 15, 3, 10, 7, 14, 1, 9, 16, 6, 17, 2, 4, 12, 0],
    [],
  );

  // Targeted mode: hub-first, then in descending order of degree/importance
  const targetedOrder = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    [],
  );

  const numToRemove = Math.round((removedFraction / 100) * nodes.length);
  const activeRemovedList =
    mode === "random" ? randomOrder.slice(0, numToRemove) : targetedOrder.slice(0, numToRemove);

  // Compute active nodes
  const activeNodesSet = useMemo(() => {
    const active = new Set(nodes.map((n) => n.id));
    for (const id of activeRemovedList) {
      active.delete(id);
    }
    return active;
  }, [nodes, activeRemovedList]);

  // Compute largest connected component size using Breadth-First Search (BFS)
  const largestClusterSize = useMemo(() => {
    if (activeNodesSet.size === 0) return 0;

    // Build adjacency list for active nodes
    const adj: Record<number, number[]> = {};
    for (const id of activeNodesSet) {
      adj[id] = [];
    }
    for (const edge of edges) {
      if (activeNodesSet.has(edge.u) && activeNodesSet.has(edge.v)) {
        adj[edge.u].push(edge.v);
        adj[edge.v].push(edge.u);
      }
    }

    const visited = new Set<number>();
    let maxCluster = 0;

    for (const startNode of activeNodesSet) {
      if (visited.has(startNode)) continue;

      // Start BFS
      const queue = [startNode];
      visited.add(startNode);
      let currentClusterSize = 0;

      while (queue.length > 0) {
        const curr = queue.shift()!;
        currentClusterSize++;

        for (const neighbor of adj[curr] || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      maxCluster = Math.max(maxCluster, currentClusterSize);
    }

    return maxCluster;
  }, [activeNodesSet, edges]);

  // Percentage of the whole that remains connected in one piece
  const giantComponentPercent =
    nodes.length > 0 ? Math.round((largestClusterSize / nodes.length) * 100) : 0;

  const isShattered = giantComponentPercent < 25;

  const handleReset = () => {
    setMode("random");
    setRemovedFraction(0);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      infoText={t("prompt")}
      onReset={handleReset}
      aspectRatio="aspect-[16/10]"
    >
      <div className="relative w-full h-full flex flex-col justify-between p-4">
        {/* Network Viewport */}
        <div className="w-full flex-1 flex flex-col justify-start pb-32 pt-2">
          <div className="relative w-full h-full bg-void/50 border border-border/20 rounded-xl overflow-hidden">
            <svg viewBox="0 0 400 130" className="w-full h-full select-none">
              <title>Network percolation grid map</title>

              {/* 1. Draw Edges */}
              <g className="transition-all duration-300">
                {edges.map((edge, index) => {
                  const uNode = nodes[edge.u];
                  const vNode = nodes[edge.v];
                  const isActive = activeNodesSet.has(edge.u) && activeNodesSet.has(edge.v);

                  return (
                    <line
                      key={index}
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      className={`transition-all duration-300 ${
                        isActive ? "stroke-cyan/30 stroke-1" : "stroke-border/5 stroke-[0.5]"
                      }`}
                    />
                  );
                })}
              </g>

              {/* 2. Draw Nodes */}
              <g className="transition-all duration-300">
                {nodes.map((node) => {
                  const isActive = activeNodesSet.has(node.id);
                  const isRemoved = activeRemovedList.includes(node.id);

                  let fillClass = "fill-cyan";
                  let glowColor = "rgba(54, 197, 217, 0.4)";

                  if (!isActive) {
                    fillClass = "fill-border/10";
                  } else if (node.isHub) {
                    fillClass = "fill-teal";
                    glowColor = "rgba(43, 212, 168, 0.6)";
                  }

                  return (
                    <circle
                      key={node.id}
                      cx={node.x}
                      cy={node.y}
                      r={node.isHub ? 6 : 3.5}
                      className={`transition-all duration-300 ${fillClass}`}
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 0 ${node.isHub ? 5 : 3}px ${glowColor})`
                          : "none",
                      }}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Readout stats overlay */}
            <div className="absolute top-2 left-2 flex gap-3 text-[8.5px] font-mono pointer-events-none">
              <div>
                <span className="text-muted mr-1">{t("removedLabel") || "Removed"}:</span>
                <span className="text-cyan font-bold">{removedFraction}%</span>
              </div>
              <div>
                <span className="text-muted mr-1">{t("giantLabel") || "Largest component"}:</span>
                <span
                  className={
                    isShattered ? "text-magenta font-bold animate-pulse" : "text-teal font-bold"
                  }
                >
                  {giantComponentPercent}%
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute top-2 right-2 text-[8.5px] font-mono pointer-events-none">
              <span className="text-muted mr-1">{t("verdictLabel") || "Network State"}:</span>
              <span className={isShattered ? "text-magenta font-bold" : "text-teal font-bold"}>
                {isShattered ? t("shattered") || "SHATTERED" : t("intact") || "CONNECTED"}
              </span>
            </div>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-void/85 backdrop-blur-md p-3 border border-border/30 rounded-xl flex flex-col gap-2.5 z-10 text-[9.5px] font-mono">
          {/* Mode selectors */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("random");
                setRemovedFraction(0);
              }}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: mode === "random" ? "var(--muted)" : "transparent",
                color: mode === "random" ? "var(--background)" : "var(--foreground)",
                borderColor: mode === "random" ? "var(--muted)" : "var(--border)",
              }}
            >
              {t("modeRandom") || "Random Removal"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("targeted");
                setRemovedFraction(0);
              }}
              className="flex-1 py-1 px-1 rounded border font-mono text-[9px] text-center transition-all duration-200 select-none hover:bg-surface-overlay"
              style={{
                backgroundColor: mode === "targeted" ? "var(--magenta)" : "transparent",
                color: mode === "targeted" ? "var(--background)" : "var(--foreground)",
                borderColor: mode === "targeted" ? "var(--magenta)" : "var(--border)",
                boxShadow: mode === "targeted" ? "0 0 6px rgba(255, 93, 168, 0.3)" : "none",
              }}
            >
              {t("modeTargeted") || "Targeted Attack (Hubs)"}
            </button>
          </div>

          {/* Removal Fraction Slider */}
          <div className="flex items-center gap-3 border-t border-border/15 pt-2">
            <span className="text-[9px] font-mono text-muted w-24 truncate uppercase">
              {t("removeSlider") || "Fraction Removed"}:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={removedFraction}
              onChange={(e) => setRemovedFraction(Number.parseInt(e.target.value))}
              className="flex-1 h-1 rounded bg-surface appearance-none cursor-pointer accent-cyan"
            />
            <span className="text-foreground w-8 text-right">{removedFraction}%</span>
          </div>
        </div>
      </div>
    </GlossaryFrame>
  );
}

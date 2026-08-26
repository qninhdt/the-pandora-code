"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type GNode = { id: number; x: number; y: number };
type Edge = [number, number];

export default function NodeGraphTheory() {
  const t = useTranslations("viz.node-graph-theory");
  const [nodes, setNodes] = useState<GNode[]>([{ id: 0, x: 50, y: 48 }]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nextId, setNextId] = useState(1);
  const [linkFrom, setLinkFrom] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 50, y: 50 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(6, Math.min(94, x)), y: Math.max(12, Math.min(86, y)) };
  };

  const onBgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (
      (e.target as Element).tagName !== "svg" &&
      (e.target as Element).getAttribute("data-bg") == null
    )
      return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    // too close to existing?
    if (nodes.some((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < 64)) return;
    const id = nextId;
    setNextId((n) => n + 1);
    setNodes((ns) => [...ns, { id, x, y }]);
    if (linkFrom != null) {
      setEdges((es) => [...es, [linkFrom, id]]);
      setLinkFrom(null);
    }
  };

  const onNodeClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkFrom == null) {
      setLinkFrom(id);
      return;
    }
    if (linkFrom === id) {
      setLinkFrom(null);
      return;
    }
    const lo = Math.min(linkFrom, id);
    const hi = Math.max(linkFrom, id);
    setEdges((es) => (es.some(([a, b]) => a === lo && b === hi) ? es : [...es, [lo, hi]]));
    setLinkFrom(null);
  };

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setNodes([{ id: 0, x: 50, y: 48 }]);
        setEdges([]);
        setNextId(1);
        setLinkFrom(null);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("nodes")}: <span className="text-cyan">{nodes.length}</span> · {t("links")}:{" "}
          <span className="text-teal">{edges.length}</span>
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full cursor-crosshair"
          role="img"
          aria-label={t("title")}
          onClick={onBgClick}
        >
          <rect data-bg="1" x="0" y="0" width="100" height="100" fill="transparent" />
          {edges.map(([a, b]) => {
            const na = nodes.find((n) => n.id === a)!;
            const nb = nodes.find((n) => n.id === b)!;
            if (!na || !nb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="var(--teal)"
                strokeWidth={0.8}
                opacity={0.7}
              />
            );
          })}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={linkFrom === n.id ? 5.5 : 4.5}
                fill={linkFrom === n.id ? "var(--cyan)" : "var(--surface)"}
                stroke="var(--cyan)"
                strokeWidth={1.2}
                className="cursor-pointer"
                onClick={(e) => onNodeClick(n.id, e)}
                opacity={0.95}
              />
            </g>
          ))}
          <text
            x="50"
            y="96"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("spawn")}
          </text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("nodes")} value={nodes.length} accent="cyan" />
          <Readout label={t("links")} value={edges.length} accent="teal" />
        </div>
      </div>
    </GlossaryFrame>
  );
}

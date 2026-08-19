"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

export default function EdgeGraphTheory() {
  const t = useTranslations("viz.edge-graph-theory");
  const [directed, setDirected] = useState(false);
  const [weighted, setWeighted] = useState(false);
  const [weight, setWeight] = useState(0.6);

  const ax = 28;
  const ay = 48;
  const bx = 72;
  const by = 48;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const strokeW = weighted ? 0.6 + weight * 2.4 : 1.2;

  // arrow tip near B
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const tipX = bx - ux * 7;
  const tipY = by - uy * 7;
  const orthoX = -uy;
  const orthoY = ux;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setDirected(false);
        setWeighted(false);
        setWeight(0.6);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {directed ? t("directed") : t("undirected")}
          {" · "}
          {weighted ? `${t("weighted")} ${weight.toFixed(2)}` : t("plain")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          <line
            x1={ax + ux * 6}
            y1={ay + uy * 6}
            x2={bx - ux * 6}
            y2={by - uy * 6}
            stroke={weighted ? "var(--amber)" : "var(--cyan)"}
            strokeWidth={strokeW}
            opacity={0.85}
          />
          {directed && (
            <polygon
              points={`${tipX + ux * 3},${tipY + uy * 3} ${tipX - orthoX * 3.2},${tipY - orthoY * 3.2} ${tipX + orthoX * 3.2},${tipY + orthoY * 3.2}`}
              fill={weighted ? "var(--amber)" : "var(--cyan)"}
            />
          )}
          {!directed && (
            <>
              {/* double-ended soft ticks for undirected */}
              <circle cx={mx} cy={my} r={1.4} fill={weighted ? "var(--amber)" : "var(--cyan)"} opacity={0.7} />
            </>
          )}
          <circle cx={ax} cy={ay} r={6.5} fill="var(--surface)" stroke="var(--teal)" strokeWidth={1.2} />
          <circle cx={bx} cy={by} r={6.5} fill="var(--surface)" stroke="var(--teal)" strokeWidth={1.2} />
          <text x={ax} y={ay + 1.5} textAnchor="middle" style={{ fontSize: 4, fontFamily: "monospace", fill: "var(--teal)" }}>
            A
          </text>
          <text x={bx} y={by + 1.5} textAnchor="middle" style={{ fontSize: 4, fontFamily: "monospace", fill: "var(--teal)" }}>
            B
          </text>
          {weighted && (
            <text
              x={mx}
              y={my - 6}
              textAnchor="middle"
              style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--amber)" }}
            >
              w={weight.toFixed(2)}
            </text>
          )}
        </svg>
        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <ControlButton
            variant={directed ? "active" : "default"}
            onClick={() => setDirected((d) => !d)}
            className="px-2.5"
          >
            {directed ? t("directed") : t("undirected")}
          </ControlButton>
          <ControlButton
            variant={weighted ? "active" : "default"}
            onClick={() => setWeighted((w) => !w)}
            className="px-2.5"
          >
            {weighted ? t("weighted") : t("plain")}
          </ControlButton>
          <Readout
            label={t("weight")}
            value={weighted ? weight.toFixed(2) : "—"}
            accent="amber"
          />
        </div>
        {weighted && (
          <div className="absolute inset-x-3 bottom-10">
            <ControlSlider
              label={t("weight")}
              value={weight}
              min={0.1}
              max={1}
              step={0.05}
              display={weight.toFixed(2)}
              onChange={setWeight}
              thumb="amber"
            />
          </div>
        )}
      </div>
    </GlossaryFrame>
  );
}

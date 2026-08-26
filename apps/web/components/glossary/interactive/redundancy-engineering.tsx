"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type Mod = { id: number; value: 0 | 1; faulted: boolean };

export default function RedundancyEngineering() {
  const t = useTranslations("viz.redundancy-engineering");
  const [mods, setMods] = useState<Mod[]>([
    { id: 0, value: 1, faulted: false },
    { id: 1, value: 1, faulted: false },
    { id: 2, value: 1, faulted: false },
  ]);

  const outputs = mods.map((m) => (m.faulted ? ((m.value ^ 1) as 0 | 1) : m.value));
  const votes1 = outputs.filter((v) => v === 1).length;
  const voter: 0 | 1 = votes1 >= 2 ? 1 : 0;
  const good = mods.filter((m) => !m.faulted).length;
  const trueVal = 1;
  const masked = voter === trueVal;

  const inject = (id: number) => {
    setMods((ms) => ms.map((m) => (m.id === id ? { ...m, faulted: !m.faulted } : m)));
  };

  const positions = useMemo(
    () => [
      { x: 28, y: 36 },
      { x: 50, y: 28 },
      { x: 72, y: 36 },
    ],
    [],
  );

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() =>
        setMods([
          { id: 0, value: 1, faulted: false },
          { id: 1, value: 1, faulted: false },
          { id: 2, value: 1, faulted: false },
        ])
      }
      allowFullscreen={false}
      caption={
        <span className={masked ? "text-teal" : "text-magenta"}>
          {masked ? t("masked") : t("corrupt")} · out={voter}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {/* voter box */}
          <rect
            x="38"
            y="58"
            width="24"
            height="16"
            rx="2"
            fill="var(--surface)"
            stroke="var(--cyan)"
            strokeWidth={1}
          />
          <text
            x="50"
            y="68"
            textAnchor="middle"
            style={{ fontSize: 3.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            VOTE
          </text>
          {/* output */}
          <circle
            cx="50"
            cy="86"
            r="5"
            fill={masked ? "var(--teal)" : "var(--magenta)"}
            opacity={0.85}
          />
          <text
            x="50"
            y="87.5"
            textAnchor="middle"
            style={{ fontSize: 3.5, fontFamily: "monospace", fill: "var(--void)" }}
          >
            {voter}
          </text>
          <line x1="50" y1="74" x2="50" y2="81" stroke="var(--cyan)" strokeWidth={0.8} />
          {mods.map((m, i) => {
            const p = positions[i];
            const out = outputs[i];
            return (
              <g key={m.id}>
                <line
                  x1={p.x}
                  y1={p.y + 6}
                  x2={50}
                  y2={58}
                  stroke={m.faulted ? "var(--magenta)" : "var(--teal)"}
                  strokeWidth={0.8}
                  opacity={0.7}
                />
                <rect
                  x={p.x - 8}
                  y={p.y - 8}
                  width={16}
                  height={14}
                  rx={1.5}
                  fill="var(--surface)"
                  stroke={m.faulted ? "var(--magenta)" : "var(--amber)"}
                  strokeWidth={1.1}
                  className="cursor-pointer"
                  onClick={() => inject(m.id)}
                />
                <text
                  x={p.x}
                  y={p.y + 1}
                  textAnchor="middle"
                  style={{
                    fontSize: 4,
                    fontFamily: "monospace",
                    fill: m.faulted ? "var(--magenta)" : "var(--amber)",
                    pointerEvents: "none",
                  }}
                >
                  {out}
                </text>
                {m.faulted && (
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
                  >
                    fault
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute left-3 top-14 flex flex-col gap-1.5">
          <Readout
            label={t("modules")}
            value={`${good}/3`}
            accent={good >= 2 ? "teal" : "magenta"}
          />
          <Readout label={t("voter")} value={voter} accent={masked ? "teal" : "magenta"} />
          <ControlButton
            onClick={() => {
              const ok = mods.find((m) => !m.faulted);
              if (ok) inject(ok.id);
            }}
            className="px-2.5"
          >
            {t("fault")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}

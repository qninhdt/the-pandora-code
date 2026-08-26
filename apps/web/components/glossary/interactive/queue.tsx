"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

type Item = { id: number; x: number };

export default function QueueViz() {
  const t = useTranslations("viz.queue");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [lambda, setLambda] = useState(1.2);
  const [mu, setMu] = useState(1.5);
  const [playing, setPlaying] = useState(true);
  const items = useRef<Item[]>([]);
  const nextId = useRef(0);
  const accIn = useRef(0);
  const accOut = useRef(0);
  const served = useRef(0);
  const waitSum = useRef(0);
  const [, bump] = useState(0);

  useRafLoop(
    (dt) => {
      accIn.current += lambda * dt;
      while (accIn.current >= 1) {
        accIn.current -= 1;
        items.current.push({ id: nextId.current++, x: 88 });
      }
      // serve head
      if (items.current.length > 0) {
        accOut.current += mu * dt;
        if (accOut.current >= 1) {
          accOut.current -= 1;
          items.current.shift();
          served.current++;
        }
      }
      // layout positions along the buffer
      const n = items.current.length;
      items.current = items.current.map((it, i) => ({
        ...it,
        x: 18 + (i / Math.max(1, n)) * 60,
      }));
      // Little's law estimate W ≈ L/λ
      waitSum.current = lambda > 0.05 ? n / lambda : 0;
      bump((x) => (x + 1) % 1_000_000);
    },
    { active: inView && playing },
  );

  const L = items.current.length;
  const W = waitSum.current;
  const overloaded = lambda > mu;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        items.current = [];
        nextId.current = 0;
        accIn.current = 0;
        accOut.current = 0;
        setLambda(1.2);
        setMu(1.5);
      }}
      onPlayPause={() => setPlaying((p) => !p)}
      isPlaying={playing}
      allowFullscreen={false}
      caption={
        <span className={overloaded ? "text-magenta" : "text-teal"}>
          L=λW · L={L} · W≈{W.toFixed(2)}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={t("title")}>
          {/* buffer trough */}
          <rect
            x="14"
            y="36"
            width="72"
            height="18"
            rx="2"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth={0.5}
            opacity={0.6}
          />
          {/* server */}
          <rect
            x="8"
            y="38"
            width="8"
            height="14"
            rx="1"
            fill="var(--surface)"
            stroke="var(--teal)"
            strokeWidth={0.9}
          />
          <text
            x="12"
            y="47"
            textAnchor="middle"
            style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--teal)" }}
          >
            μ
          </text>
          {/* arrival */}
          <polygon points="90,40 96,45 90,50" fill="var(--amber)" opacity={0.85} />
          <text
            x="93"
            y="56"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            λ
          </text>
          {items.current.map((it) => (
            <rect
              key={it.id}
              x={it.x}
              y={40}
              width={4.5}
              height={10}
              rx={0.6}
              fill={overloaded ? "var(--magenta)" : "var(--cyan)"}
              opacity={0.9}
            />
          ))}
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("length")} value={L} accent={overloaded ? "magenta" : "cyan"} />
          <Readout label={t("wait")} value={W.toFixed(2)} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 flex flex-col gap-1">
          <ControlSlider
            label={t("arrival")}
            value={lambda}
            min={0.2}
            max={4}
            step={0.1}
            display={lambda.toFixed(1)}
            onChange={setLambda}
            thumb="amber"
          />
          <ControlSlider
            label={t("service")}
            value={mu}
            min={0.2}
            max={4}
            step={0.1}
            display={mu.toFixed(1)}
            onChange={setMu}
            thumb="teal"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

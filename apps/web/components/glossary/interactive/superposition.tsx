"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Stratigraphy's founding rule, obvious once said and quietly powerful: in an
// undisturbed sequence of sedimentary rock, the layer beneath is always older
// than the one above it, because it had to be laid down first. Scrub deposition
// time and the column builds from the floor up; click any bed to see its place in
// the order. No absolute dates required — superposition alone lets you read the
// before-and-after of a planet's history straight off the cliff face, the first
// tool anyone has for putting deep time in sequence.
const LAYERS = [
  { key: "basement", hue: "#3a3550" },
  { key: "sandstone", hue: "#6b5a44" },
  { key: "shale", hue: "#2f4a52" },
  { key: "limestone", hue: "#516170" },
  { key: "coal", hue: "#1c2230" },
  { key: "mudstone", hue: "#4a4038" },
  { key: "siltstone", hue: "#5a6472" },
  { key: "topsoil", hue: "#3d5240" },
];

export default function Superposition() {
  const t = useTranslations("viz.superposition");
  const [deposited, setDeposited] = useState(LAYERS.length); // how many beds laid down
  const [picked, setPicked] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = Math.max(1, Math.round(deposited));
  const visible = LAYERS.slice(0, n);

  // geometry: stack upward from a fixed floor
  const FLOOR = 84;
  const TOP = 16;
  const bandH = (FLOOR - TOP) / LAYERS.length;

  const sel = picked != null && picked < n ? picked : null;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setDeposited(LAYERS.length);
        setPicked(null);
      }}
      allowFullscreen={false}
      caption={
        sel != null ? (
          <span>
            {t(LAYERS[sel].key)}:{" "}
            <span className="text-cyan">{t("depositedNth", { n: sel + 1, total: n })}</span>
          </span>
        ) : (
          <span className="text-teal">{t("lowerIsOlder")}</span>
        )
      }
    >
      <div className="absolute inset-0">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* age axis on the left: older at the bottom */}
          <line
            x1="12"
            y1={TOP}
            x2="12"
            y2={FLOOR}
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <text
            x="7"
            y={TOP + 4}
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("younger")}
          </text>
          <text
            x="7"
            y={FLOOR - 1}
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("older")}
          </text>
          <path d={`M12 ${FLOOR} l -1.4 -3 l 2.8 0 Z`} fill="var(--border-strong)" />

          {/* the rock column, drawn bottom-up */}
          {visible.map((layer, i) => {
            const y = FLOOR - (i + 1) * bandH;
            const isSel = sel === i;
            const older = sel != null && i < sel;
            const younger = sel != null && i > sel;
            return (
              <g key={layer.key}>
                <rect
                  x="16"
                  y={y}
                  width="66"
                  height={bandH - 0.6}
                  fill={layer.hue}
                  opacity={sel == null ? 0.92 : isSel ? 1 : 0.4}
                  stroke={isSel ? "var(--cyan)" : "var(--void)"}
                  strokeWidth={isSel ? 0.9 : 0.3}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t(layer.key)} — ${t("selectBed")}`}
                  aria-pressed={isSel}
                  onClick={() => setPicked(i === picked ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPicked(i === picked ? null : i);
                    }
                  }}
                />
                {/* bedding texture line */}
                <line
                  x1="16"
                  y1={y + bandH / 2}
                  x2="82"
                  y2={y + bandH / 2}
                  stroke="var(--void)"
                  strokeWidth="0.2"
                  opacity="0.3"
                />
                {/* order badge */}
                <text
                  x="19"
                  y={y + bandH / 2 + 1}
                  className="fill-foreground"
                  style={{
                    fontSize: 2.8,
                    fontFamily: "monospace",
                    opacity: sel == null || isSel ? 0.9 : 0.4,
                  }}
                >
                  {i + 1}
                </text>
                {/* older/younger tag relative to selection */}
                {(older || younger) && (
                  <text
                    x="80"
                    y={y + bandH / 2 + 1}
                    textAnchor="end"
                    style={{
                      fontSize: 2.6,
                      fontFamily: "monospace",
                      fill: older ? "var(--teal)" : "var(--amber)",
                    }}
                  >
                    {older ? t("olderTag") : t("youngerTag")}
                  </text>
                )}
              </g>
            );
          })}

          {/* deposition front marker */}
          {n < LAYERS.length && (
            <line
              x1="16"
              y1={FLOOR - n * bandH}
              x2="82"
              y2={FLOOR - n * bandH}
              stroke="var(--cyan)"
              strokeWidth="0.5"
              strokeDasharray="2 1.5"
              opacity="0.6"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("beds")} value={n} accent="foreground" />
          {sel != null && <Readout label={t("order")} value={`${sel + 1} / ${n}`} accent="cyan" />}
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("depositionTime")}
            value={deposited}
            min={1}
            max={LAYERS.length}
            step={1}
            onChange={(v) => {
              setDeposited(v);
              setPicked(null);
            }}
            display={t("layersN", { n })}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}

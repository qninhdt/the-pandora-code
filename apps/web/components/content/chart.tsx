"use client";

import { designTokens } from "@/lib/design-tokens";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartKind = "line" | "bar" | "area";

interface ChartSeries {
  key: string;
  label?: string;
  tone?: "cyan" | "teal" | "magenta" | "amber";
}

interface ChartProps {
  kind?: ChartKind;
  data: Record<string, number | string>[];
  xKey: string;
  series: ChartSeries[];
  /** Caption / title for the chart. */
  caption?: string;
  height?: number;
}

const toneHex: Record<string, string> = {
  cyan: designTokens.biolum.cyan,
  teal: designTokens.biolum.teal,
  magenta: designTokens.biolum.magenta,
  amber: designTokens.biolum.amber,
};

const axisStyle = { fill: designTokens.text.muted, fontSize: 12, fontFamily: "var(--font-sans)" };

// Recharts wrapped in one biolum-themed component: dark grid, token-colored
// series, glassy tooltip. All charts in the book route through here so they
// match the world. Hand-rolled SVG only when Recharts lacks the type.
export function Chart({ kind = "line", data, xKey, series, caption, height = 280 }: ChartProps) {
  const grid = (
    <CartesianGrid stroke={designTokens.line.border} strokeDasharray="3 3" vertical={false} />
  );
  const axes = (
    <>
      <XAxis
        dataKey={xKey}
        tick={axisStyle}
        stroke={designTokens.line.borderStrong}
        tickLine={false}
      />
      <YAxis tick={axisStyle} stroke={designTokens.line.borderStrong} tickLine={false} width={40} />
    </>
  );
  const tooltip = (
    <Tooltip
      cursor={{ stroke: designTokens.biolum.cyan, strokeOpacity: 0.3 }}
      contentStyle={{
        background: designTokens.depth.surfaceRaised,
        border: `1px solid ${designTokens.line.borderStrong}`,
        borderRadius: 10,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        color: designTokens.text.foreground,
      }}
    />
  );

  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-border bg-surface/50 p-4 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={height}>
          {kind === "bar" ? (
            <BarChart data={data}>
              {grid}
              {axes}
              {tooltip}
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={toneHex[s.tone ?? "cyan"]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : kind === "area" ? (
            <AreaChart data={data}>
              {grid}
              {axes}
              {tooltip}
              {series.map((s) => {
                const c = toneHex[s.tone ?? "cyan"];
                return (
                  <Area
                    key={s.key}
                    dataKey={s.key}
                    stroke={c}
                    fill={c}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                );
              })}
            </AreaChart>
          ) : (
            <LineChart data={data}>
              {grid}
              {axes}
              {tooltip}
              {series.map((s) => (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  stroke={toneHex[s.tone ?? "cyan"]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

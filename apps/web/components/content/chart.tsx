"use client";

import { designTokens } from "@/lib/design-tokens";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  xLabel?: string;
  yLabel?: string;
  /** Caption / title for the chart. */
  caption?: string;
  height?: number;
  showLegend?: boolean;
}

const toneHex: Record<string, string> = {
  cyan: designTokens.biolum.cyan,
  teal: designTokens.biolum.teal,
  magenta: designTokens.biolum.magenta,
  amber: designTokens.biolum.amber,
};

const axisStyle = { fill: designTokens.text.muted, fontSize: 12, fontFamily: "var(--font-sans)" };
const formatValue = (value: unknown) => String(value);

// Recharts wrapped in one biolum-themed component: dark grid, token-colored
// series, glassy tooltip. All charts in the book route through here so they
// match the world. Hand-rolled SVG only when Recharts lacks the type.
export function Chart({
  kind = "line",
  data,
  xKey,
  series,
  xLabel,
  yLabel,
  caption,
  height = 280,
  showLegend = true,
}: ChartProps) {
  const resolvedYLabel = yLabel ?? (series.length === 1 ? series[0]?.label : undefined);
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
        tickMargin={8}
        height={xLabel ? 44 : 30}
        label={
          xLabel
            ? {
                value: xLabel,
                position: "insideBottom",
                offset: -8,
                ...axisStyle,
              }
            : undefined
        }
      />
      <YAxis
        tick={axisStyle}
        stroke={designTokens.line.borderStrong}
        tickLine={false}
        tickMargin={8}
        width={resolvedYLabel ? 56 : 40}
        label={
          resolvedYLabel
            ? {
                value: resolvedYLabel,
                angle: -90,
                position: "insideLeft",
                ...axisStyle,
              }
            : undefined
        }
      />
    </>
  );
  const legend = showLegend ? (
    <Legend
      verticalAlign="top"
      align="left"
      iconType="circle"
      wrapperStyle={{
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        paddingBottom: 8,
      }}
      formatter={(value) => <span style={{ color: designTokens.text.foreground }}>{value}</span>}
    />
  ) : null;
  const tooltip = (
    <Tooltip
      cursor={{ stroke: designTokens.biolum.cyan, strokeOpacity: 0.3 }}
      labelFormatter={(label) => (xLabel ? `${xLabel}: ${label}` : String(label))}
      formatter={(value, name) => [formatValue(value), String(name)]}
      contentStyle={{
        background: designTokens.depth.surfaceRaised,
        border: `1px solid ${designTokens.line.borderStrong}`,
        borderRadius: 10,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        color: designTokens.text.foreground,
      }}
      itemStyle={{ color: designTokens.text.foreground }}
      labelStyle={{ color: designTokens.text.muted, marginBottom: 6 }}
    />
  );
  const chartMargin = {
    top: showLegend ? 28 : 12,
    right: 12,
    bottom: xLabel ? 18 : 8,
    left: 4,
  };

  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-border bg-surface/50 p-4 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={height}>
          {kind === "bar" ? (
            <BarChart data={data} margin={chartMargin}>
              {grid}
              {axes}
              {legend}
              {tooltip}
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label ?? s.key}
                  fill={toneHex[s.tone ?? "cyan"]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : kind === "area" ? (
            <AreaChart data={data} margin={chartMargin}>
              {grid}
              {axes}
              {legend}
              {tooltip}
              {series.map((s) => {
                const c = toneHex[s.tone ?? "cyan"];
                return (
                  <Area
                    key={s.key}
                    dataKey={s.key}
                    name={s.label ?? s.key}
                    stroke={c}
                    fill={c}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                );
              })}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={chartMargin}>
              {grid}
              {axes}
              {legend}
              {tooltip}
              {series.map((s) => (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  name={s.label ?? s.key}
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

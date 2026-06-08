import { Chart } from "@/components/content/chart";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => {
  const Axis = ({
    axis,
    label,
  }: {
    axis: "x" | "y";
    label?: { value?: string };
  }) => <div data-testid={`${axis}-axis`}>{label?.value ?? ""}</div>;

  const Tooltip = ({
    formatter,
    labelFormatter,
  }: {
    formatter?: (value: number, name: string) => [string, string];
    labelFormatter?: (label: string) => string;
  }) => (
    <div data-testid="tooltip">
      <span>{labelFormatter?.("4.2")}</span>
      <span>{JSON.stringify(formatter?.(0.12, "Resistance (Ω)"))}</span>
    </div>
  );

  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    CartesianGrid: () => <div data-testid="grid" />,
    Legend: () => <div data-testid="legend" />,
    Tooltip,
    XAxis: ({ label }: { label?: { value?: string } }) => <Axis axis="x" label={label} />,
    YAxis: ({ label }: { label?: { value?: string } }) => <Axis axis="y" label={label} />,
    LineChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AreaChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Line: ({ name }: { name?: string }) => <div>{name}</div>,
    Bar: ({ name }: { name?: string }) => <div>{name}</div>,
    Area: ({ name }: { name?: string }) => <div>{name}</div>,
  };
});

describe("Chart", () => {
  it("renders series labels into chart text affordances", () => {
    render(
      <Chart
        kind="line"
        data={[
          { t: "4.0", R: 0 },
          { t: "4.2", R: 0.12 },
        ]}
        xKey="t"
        xLabel="Temperature (K)"
        yLabel="Resistance (Ω)"
        series={[{ key: "R", label: "Resistance (Ω)", tone: "cyan" }]}
      />,
    );

    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toHaveTextContent("Temperature (K)");
    expect(screen.getByTestId("y-axis")).toHaveTextContent("Resistance (Ω)");
    expect(screen.getAllByText("Resistance (Ω)")).toHaveLength(2);
    expect(screen.getByTestId("tooltip")).toHaveTextContent("Temperature (K): 4.2");
    expect(screen.getByTestId("tooltip")).toHaveTextContent('["0.12","Resistance (Ω)"]');
  });

  it("falls back to the single series label for the y-axis", () => {
    render(
      <Chart
        kind="bar"
        data={[
          { t: "0", flux: 1 },
          { t: "1", flux: 0.8 },
        ]}
        xKey="t"
        xLabel="Distance"
        series={[{ key: "flux", label: "Relative flux", tone: "amber" }]}
      />,
    );

    expect(screen.getByTestId("y-axis")).toHaveTextContent("Relative flux");
  });
});

import { WhittakerBiomeExplorer } from "@/components/content/whittaker-biome-explorer";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("WhittakerBiomeExplorer", () => {
  it("defaults to tropical rainforest (warm and wet, Pandora)", () => {
    render(<WhittakerBiomeExplorer locale="en" />);
    expect(screen.getByText("Tropical rainforest")).toBeInTheDocument();
  });

  it("classifies a cold, dry climate as tundra", () => {
    render(<WhittakerBiomeExplorer locale="en" />);
    fireEvent.change(screen.getByLabelText("Temperature"), { target: { value: "-10" } });
    fireEvent.change(screen.getByLabelText("Precipitation"), { target: { value: "10" } });
    expect(screen.getByText("Tundra")).toBeInTheDocument();
  });

  it("classifies a hot, dry climate as subtropical desert", () => {
    render(<WhittakerBiomeExplorer locale="en" />);
    fireEvent.change(screen.getByLabelText("Temperature"), { target: { value: "26" } });
    fireEvent.change(screen.getByLabelText("Precipitation"), { target: { value: "20" } });
    expect(screen.getByText("Subtropical desert")).toBeInTheDocument();
  });

  it("renders localized labels in Vietnamese", () => {
    render(<WhittakerBiomeExplorer locale="vi" />);
    expect(screen.getByLabelText("Nhiệt độ")).toBeInTheDocument();
    expect(screen.getByLabelText("Lượng mưa")).toBeInTheDocument();
  });
});

import { HalfLifeDecay } from "@/components/content/half-life-decay";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("HalfLifeDecay", () => {
  it("shows 50% parent remaining at one half-life by default", () => {
    render(<HalfLifeDecay locale="en" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("halves the remaining parent fraction with each half-life scrubbed", () => {
    render(<HalfLifeDecay locale="en" />);
    const time = screen.getByLabelText("Time (half-lives)");
    fireEvent.change(time, { target: { value: "0" } });
    expect(screen.getByText("100%")).toBeInTheDocument();
    fireEvent.change(time, { target: { value: "2" } });
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("renders localized labels in Vietnamese", () => {
    render(<HalfLifeDecay locale="vi" />);
    expect(screen.getByText("Cha (phóng xạ)")).toBeInTheDocument();
    expect(screen.getByLabelText("Thời gian (số chu kỳ bán rã)")).toBeInTheDocument();
  });
});

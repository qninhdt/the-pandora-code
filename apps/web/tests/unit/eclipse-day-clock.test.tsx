import { EclipseDayClock } from "@/components/content/eclipse-day-clock";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("EclipseDayClock", () => {
  it("defaults to the eclipse moment", () => {
    render(<EclipseDayClock locale="en" />);
    expect(screen.getByText("Eclipse")).toBeInTheDocument();
  });

  it("shows daylight at midday and twilight near sunset", () => {
    render(<EclipseDayClock locale="en" />);
    const time = screen.getByLabelText("Time of day");
    fireEvent.change(time, { target: { value: "0.5" } });
    expect(screen.getByText("Daylight")).toBeInTheDocument();
    fireEvent.change(time, { target: { value: "0.999" } });
    expect(screen.getByText("Twilight")).toBeInTheDocument();
  });

  it("renders localized labels in Vietnamese", () => {
    render(<EclipseDayClock locale="vi" />);
    expect(screen.getByText("Polyphemus")).toBeInTheDocument();
    expect(screen.getByLabelText("Giờ trong ngày")).toBeInTheDocument();
  });
});

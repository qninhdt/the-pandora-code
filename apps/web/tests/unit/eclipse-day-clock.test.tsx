import { EclipseDayClock } from "@/components/content/eclipse-day-clock";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("EclipseDayClock", () => {
  it("defaults to the eclipse moment", () => {
    renderWithIntl(<EclipseDayClock />);
    expect(screen.getByText("Eclipse")).toBeInTheDocument();
  });

  it("shows daylight at midday and twilight near sunset", () => {
    renderWithIntl(<EclipseDayClock />);
    const time = screen.getByLabelText("Time of day");
    fireEvent.change(time, { target: { value: "0.5" } });
    expect(screen.getByText("Daylight")).toBeInTheDocument();
    fireEvent.change(time, { target: { value: "0.999" } });
    expect(screen.getByText("Twilight")).toBeInTheDocument();
  });

  it("renders localized labels in Vietnamese", () => {
    renderWithIntl(<EclipseDayClock />, "vi");
    expect(screen.getByText("Polyphemus")).toBeInTheDocument();
    expect(screen.getByLabelText("Giờ trong ngày")).toBeInTheDocument();
  });
});

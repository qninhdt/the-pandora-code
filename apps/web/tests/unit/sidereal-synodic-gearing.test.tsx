import { SiderealSynodicGearing } from "@/components/content/sidereal-synodic-gearing";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("SiderealSynodicGearing", () => {
  it("makes the lived day longer than the day the stars keep", () => {
    renderWithIntl(<SiderealSynodicGearing />);
    expect(screen.getByText("26.00 h")).toBeInTheDocument();
    expect(screen.getByText("26.08 h")).toBeInTheDocument();
    expect(screen.getByText(/longer by \+4.6 min/)).toBeInTheDocument();
  });

  it("widens the surplus as the year shortens", () => {
    renderWithIntl(<SiderealSynodicGearing />);
    const year = screen.getByLabelText("One year around the star");
    fireEvent.change(year, { target: { value: "150" } });
    expect(screen.getByText(/longer by \+11.3 min/)).toBeInTheDocument();
  });

  it("banks a full day of disagreement across a whole year", () => {
    renderWithIntl(<SiderealSynodicGearing />);
    const scrub = screen.getByLabelText("How far through the year");
    fireEvent.change(scrub, { target: { value: "1" } });
    expect(screen.getByText("1.00")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<SiderealSynodicGearing />, "vi");
    expect(screen.getByText("Ngày bạn sống")).toBeInTheDocument();
    expect(screen.getByLabelText("Một vòng quanh hành tinh")).toBeInTheDocument();
  });
});

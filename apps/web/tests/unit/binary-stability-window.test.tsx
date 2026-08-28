import { BinaryStabilityWindow } from "@/components/content/binary-stability-window";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("BinaryStabilityWindow", () => {
  it("puts the real Alpha Centauri arrangement safely inside the edge", () => {
    renderWithIntl(<BinaryStabilityWindow />);
    expect(screen.getByText("Stays put")).toBeInTheDocument();
    expect(screen.getByText("Liquid")).toBeInTheDocument();
    expect(screen.getByText("the temperate band fits inside")).toBeInTheDocument();
  });

  it("loses the world when its orbit passes the survival edge", () => {
    renderWithIntl(<BinaryStabilityWindow />);
    const orbit = screen.getByLabelText("The world's orbit");
    fireEvent.change(orbit, { target: { value: "4.5" } });
    expect(screen.getByText("Flung out")).toBeInTheDocument();
    expect(screen.getByText(/thrown out of the system/)).toBeInTheDocument();
  });

  it("cuts the temperate band off when the companion closes in", () => {
    renderWithIntl(<BinaryStabilityWindow />);
    const periastron = screen.getByLabelText("Companion's closest approach");
    fireEvent.change(periastron, { target: { value: "5" } });
    expect(screen.getByText("the temperate band is cut off")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<BinaryStabilityWindow />, "vi");
    expect(screen.getByText("Trụ vững")).toBeInTheDocument();
    expect(screen.getByLabelText("Quỹ đạo của thế giới")).toBeInTheDocument();
  });
});

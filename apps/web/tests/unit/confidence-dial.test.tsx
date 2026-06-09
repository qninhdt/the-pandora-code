import { ConfidenceDial } from "@/components/content/confidence-dial";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("ConfidenceDial", () => {
  it("maps the default 91% to 'Very likely'", () => {
    renderWithIntl(<ConfidenceDial />);
    expect(screen.getByText("Very likely")).toBeInTheDocument();
  });

  it("maps probabilities to the IPCC calibrated term as it is swept", () => {
    renderWithIntl(<ConfidenceDial />);
    const slider = screen.getByLabelText("Probability (%)");
    fireEvent.change(slider, { target: { value: "100" } });
    expect(screen.getByText("Virtually certain")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "50" } });
    expect(screen.getByText("About as likely as not")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "2" } });
    expect(screen.getByText("Extremely unlikely")).toBeInTheDocument();
  });

  it("renders localized terms in Vietnamese", () => {
    renderWithIntl(<ConfidenceDial />, "vi");
    expect(screen.getByText("Rất có khả năng")).toBeInTheDocument();
    expect(screen.getByLabelText("Xác suất (%)")).toBeInTheDocument();
  });
});

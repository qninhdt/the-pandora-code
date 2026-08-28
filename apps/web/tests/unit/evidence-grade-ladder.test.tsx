import { EvidenceGradeLadder } from "@/components/content/evidence-grade-ladder";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("EvidenceGradeLadder", () => {
  it("opens a randomized trial at high certainty", () => {
    renderWithIntl(<EvidenceGradeLadder />);
    expect(screen.getByText(/further research is very unlikely/)).toBeInTheDocument();
    expect(screen.getByText("held")).toBeInTheDocument();
  });

  it("drags certainty down as appraisal flaws are applied", () => {
    renderWithIntl(<EvidenceGradeLadder />);
    fireEvent.click(screen.getByRole("button", { name: "Risk of bias" }));
    fireEvent.click(screen.getByRole("button", { name: "Results disagree" }));
    expect(screen.getByText("-2")).toBeInTheDocument();
    expect(screen.getByText(/could be substantially different/)).toBeInTheDocument();
  });

  it("lets an observational study climb above its starting rung", () => {
    renderWithIntl(<EvidenceGradeLadder />);
    fireEvent.click(screen.getByRole("radio", { name: "Observational study" }));
    fireEvent.click(screen.getByRole("button", { name: "Very large effect" }));
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText(/probably close to the estimate/)).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<EvidenceGradeLadder />, "vi");
    expect(screen.getByRole("radio", { name: "Thử nghiệm ngẫu nhiên" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nguy cơ sai lệch" })).toBeInTheDocument();
  });
});

import { CultureTransmissionLab } from "@/components/content/culture-transmission-lab";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("CultureTransmissionLab", () => {
  it("starts with all explanations open", () => {
    renderWithIntl(<CultureTransmissionLab />);
    expect(screen.getByRole("tab", { name: /Find a pattern/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByText("still open")).toHaveLength(3);
  });

  it("shows social transmission after diffusion evidence", () => {
    renderWithIntl(<CultureTransmissionLab />);
    fireEvent.click(screen.getByRole("tab", { name: /Watch it spread/ }));
    expect(screen.getByText(/The social network predicts who learns next/)).toBeInTheDocument();
    expect(screen.getByLabelText(/spreading from whale to whale/)).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<CultureTransmissionLab />, "vi");
    expect(screen.getByRole("tab", { name: /Dõi cách lan truyền/ })).toBeInTheDocument();
  });
});

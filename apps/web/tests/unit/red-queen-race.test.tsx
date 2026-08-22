import { RedQueenRace } from "@/components/content/red-queen-race";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("RedQueenRace", () => {
  it("defaults to fluctuating selection", () => {
    renderWithIntl(<RedQueenRace />);
    expect(screen.getByRole("radio", { name: "Changing target" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("Rare genotype wins—for now")).toBeInTheDocument();
  });

  it("switches to directional escalation", () => {
    renderWithIntl(<RedQueenRace />);
    fireEvent.click(screen.getByRole("radio", { name: "Arms race" }));
    expect(screen.getByText("Escalating")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Directional escalation between defence and attack"),
    ).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<RedQueenRace />, "vi");
    expect(screen.getByRole("radio", { name: "Mục tiêu đổi chỗ" })).toBeInTheDocument();
  });
});

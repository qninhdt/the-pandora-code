import { InfectionBarrierGauntlet } from "@/components/content/infection-barrier-gauntlet";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("InfectionBarrierGauntlet", () => {
  it("starts with every lock untried", () => {
    renderWithIntl(<InfectionBarrierGauntlet />);
    expect(screen.getByRole("radio", { name: "One biosphere" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("0 / 6")).toBeInTheDocument();
    expect(screen.getAllByText("Untried")).toHaveLength(6);
    expect(screen.getByText(/Nothing has happened yet/)).toBeInTheDocument();
  });

  it("opens one lock per attempt within a single biosphere", () => {
    renderWithIntl(<InfectionBarrierGauntlet />);
    fireEvent.click(screen.getByRole("button", { name: /Try the next lock/ }));
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
    expect(screen.getByText("Opens")).toBeInTheDocument();
    expect(screen.getAllByText("Untried")).toHaveLength(5);
  });

  it("stops at the docking lock across two biospheres", () => {
    renderWithIntl(<InfectionBarrierGauntlet />);
    fireEvent.click(screen.getByRole("radio", { name: "Two biospheres" }));
    const tryNext = screen.getByRole("button", { name: /Try the next lock/ });
    fireEvent.click(tryNext);
    fireEvent.click(tryNext);
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
    expect(screen.getByText(/Nothing on the host's cells fits it/)).toBeInTheDocument();
    expect(screen.getByText("Will not open")).toBeInTheDocument();
    expect(tryNext).toBeDisabled();
  });

  it("keeps the harm routes open regardless of the locks", () => {
    renderWithIntl(<InfectionBarrierGauntlet />);
    fireEvent.click(screen.getByRole("radio", { name: "Two biospheres" }));
    expect(screen.getByText("A toxin it carries")).toBeInTheDocument();
    expect(screen.getByText("Taking an ecological niche nothing here defends")).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<InfectionBarrierGauntlet />, "vi");
    expect(screen.getByRole("radio", { name: "Hai sinh quyển" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thử ổ khóa kế tiếp/ })).toBeInTheDocument();
  });
});

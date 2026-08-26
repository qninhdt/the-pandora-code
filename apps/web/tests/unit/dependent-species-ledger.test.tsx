import { DependentSpeciesLedger } from "@/components/content/dependent-species-ledger";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("DependentSpeciesLedger", () => {
  it("opens on the ash calibration with a debt already owed", () => {
    renderWithIntl(<DependentSpeciesLedger />);
    expect(screen.getByRole("radio", { name: "European ash" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("Already owed")).toBeInTheDocument();
    // A census 8 years in still records most of the doomed species as present.
    expect(screen.getByText(/8 years after the felling/)).toBeInTheDocument();
    expect(screen.getByText(/This is the census that misleads/)).toBeInTheDocument();
  });

  it("settles the debt as the census walks forward", () => {
    renderWithIntl(<DependentSpeciesLedger />);
    fireEvent.change(screen.getByRole("slider", { name: "Years since the felling" }), {
      target: { value: "120" },
    });
    expect(screen.getByText(/120 years after the felling/)).toBeInTheDocument();
    expect(screen.getByText(/The bill has mostly been paid/)).toBeInTheDocument();
  });

  it("switching calibration changes the obligate share", () => {
    renderWithIntl(<DependentSpeciesLedger />);
    const obligates = screen.getByRole("slider", {
      name: "Species that can live on no other host",
    });
    expect(obligates).toHaveValue("4.7");
    fireEvent.click(screen.getByRole("radio", { name: "Panama canopy tree" }));
    expect(obligates).toHaveValue("13.5");
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<DependentSpeciesLedger />, "vi");
    expect(screen.getByRole("radio", { name: "Tần bì châu Âu" })).toBeInTheDocument();
    expect(screen.getByText("Đã mắc nợ")).toBeInTheDocument();
  });
});

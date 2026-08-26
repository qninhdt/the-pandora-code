import { OpercularOxygenBudget } from "@/components/content/opercular-oxygen-budget";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

// Several readouts render "N×", so read a value by its own label rather than by
// matching the number anywhere on screen.
function readoutValue(label: string): string {
  const row = screen.getByText(label).parentElement;
  const value = row?.lastElementChild?.textContent;
  return value ?? "";
}

describe("OpercularOxygenBudget", () => {
  it("opens with a large tidal breather already short of oxygen in Pandora's air", () => {
    renderWithIntl(<OpercularOxygenBudget />);
    expect(readoutValue("Supply against demand")).toBe("0.88×");
    expect(
      screen.getByText("Demand has outrun the surface — this body cannot be fed"),
    ).toBeInTheDocument();
    expect(readoutValue("Spent moving air")).toBe("17%");
  });

  it("closes the gap when the same body switches to one-way flow", () => {
    renderWithIntl(<OpercularOxygenBudget />);
    fireEvent.click(screen.getByRole("radio", { name: "One-way" }));
    expect(readoutValue("Supply against demand")).toBe("1.15×");
    expect(
      screen.getByText("The exchange surface stays ahead of the appetite"),
    ).toBeInTheDocument();
    // ventilation work now rides on legs and wings, and the scoured membrane is
    // back to its structural minimum
    expect(readoutValue("Spent moving air")).toBe("0%");
    expect(readoutValue("Effective barrier")).toBe("1.00×");
  });

  it("lifts the supported-mass ceiling by orders of magnitude with one-way flow", () => {
    renderWithIntl(<OpercularOxygenBudget />);
    expect(readoutValue("Heaviest body supported")).toBe("72 kg");
    fireEvent.click(screen.getByRole("radio", { name: "One-way" }));
    expect(readoutValue("Heaviest body supported")).toBe("1,851 kg");
  });

  it("removes the ceiling entirely once the surface outgrows demand", () => {
    renderWithIntl(<OpercularOxygenBudget />);
    fireEvent.change(screen.getByRole("slider", { name: "Exchange surface grows as mass^" }), {
      target: { value: "0.78" },
    });
    expect(readoutValue("Heaviest body supported")).toBe("no limit");
  });

  it("shows that swapping to Earth air barely moves the answer", () => {
    renderWithIntl(<OpercularOxygenBudget />);
    fireEvent.click(screen.getByRole("radio", { name: "Earth air" }));
    expect(readoutValue("Supply against demand")).toBe("1.00×");
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<OpercularOxygenBudget />, "vi");
    expect(screen.getByRole("radio", { name: "Một chiều" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Khối lượng cơ thể" })).toBeInTheDocument();
    expect(screen.getByText("Cung so với cầu")).toBeInTheDocument();
  });
});

import { ExopackFilterBudget } from "@/components/content/exopack-filter-budget";
import {
  CO2_LIMIT_PCT,
  H2S_LIMIT_PPM,
  filterAir,
} from "@/components/content/exopack-filter-budget-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("exopack filter budget model", () => {
  it("lets sulfide through when the pack is spent on carbon dioxide", () => {
    const naive = filterAir(85, 200, "rest");
    expect(naive.co2Pct).toBeLessThan(CO2_LIMIT_PCT);
    expect(naive.h2sPpm).toBeGreaterThan(H2S_LIMIT_PPM);
    expect(naive.verdict).toBe("h2s");
  });

  it("lets carbon dioxide through when the pack is spent on sulfide", () => {
    const inverted = filterAir(20, 200, "rest");
    expect(inverted.h2sPpm).toBeLessThan(H2S_LIMIT_PPM);
    expect(inverted.co2Pct).toBeGreaterThan(CO2_LIMIT_PCT);
    expect(inverted.verdict).toBe("co2");
  });

  it("clears both poisons only in the middle of the range", () => {
    expect(filterAir(50, 200, "rest").verdict).toBe("clean");
  });

  it("narrows the survivable window when the wearer works harder", () => {
    const rest = filterAir(50, 400, "rest");
    const work = filterAir(50, 400, "work");
    expect(rest.verdict).not.toBe("h2s");
    expect(work.h2sPpm).toBeGreaterThan(rest.h2sPpm);
    expect(work.co2Pct).toBeGreaterThan(rest.co2Pct);
    expect(work.serviceDays).toBeLessThan(rest.serviceDays);
  });

  it("never invents oxygen — it only concentrates what was already there", () => {
    const { o2Kpa, rawO2Kpa } = filterAir(100, 200, "rest");
    expect(rawO2Kpa).toBeCloseTo(20.7, 1);
    expect(o2Kpa).toBeGreaterThan(rawO2Kpa);
    expect(o2Kpa).toBeLessThan(rawO2Kpa * 1.25);
  });
});

describe("ExopackFilterBudget", () => {
  it("opens on the naive split and reports sulfide breakthrough", () => {
    renderWithIntl(<ExopackFilterBudget />);
    expect(screen.getByText("Spend the filter")).toBeInTheDocument();
    expect(screen.getByText(/85% scrubber \/ 15% sulfide/)).toBeInTheDocument();
    expect(screen.getByText(/You spent the pack on the frightening number/)).toBeInTheDocument();
  });

  it("clears both poisons when the sorbent is split evenly", () => {
    renderWithIntl(<ExopackFilterBudget />);
    fireEvent.change(screen.getByLabelText("Split the sorbent between the two beds"), {
      target: { value: "50" },
    });
    expect(screen.getByText(/Both poisons stopped/)).toBeInTheDocument();
  });

  it("degrades the same split once the wearer starts working", () => {
    renderWithIntl(<ExopackFilterBudget />);
    fireEvent.change(screen.getByLabelText("Split the sorbent between the two beds"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Working hard" }));
    expect(screen.queryByText(/Both poisons stopped/)).not.toBeInTheDocument();
    expect(screen.getByText(/Survivable/)).toBeInTheDocument();
  });

  it("renders the Vietnamese controls and verdict", () => {
    renderWithIntl(<ExopackFilterBudget />, "vi");
    expect(screen.getByRole("radio", { name: "Vận động nặng" })).toBeInTheDocument();
    expect(screen.getByText(/dốc cả bộ lọc vào con số đáng sợ/)).toBeInTheDocument();
  });
});

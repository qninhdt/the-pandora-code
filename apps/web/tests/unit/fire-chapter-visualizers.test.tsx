import { BurningWingTimeBudget } from "@/components/content/burning-wing-time-budget";
import { CombustionBudgetLab } from "@/components/content/combustion-budget-lab";
import { EdgeToughnessTradeoff } from "@/components/content/edge-toughness-tradeoff";
import { PyricNutrientLedger } from "@/components/content/pyric-nutrient-ledger";
import { RadiantDoseDial } from "@/components/content/radiant-dose-dial";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("CombustionBudgetLab", () => {
  it("reports Pandora's air as burning reluctantly by default", () => {
    renderWithIntl(<CombustionBudgetLab />);
    expect(screen.getByText("Burns reluctantly")).toBeInTheDocument();
  });

  it("blows the flame out once the airstream is fast enough", () => {
    renderWithIntl(<CombustionBudgetLab />);
    fireEvent.change(screen.getByLabelText("Airspeed across the flame"), {
      target: { value: "12" },
    });
    expect(screen.getByText("Flame blown out")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<CombustionBudgetLab />, "vi");
    expect(screen.getByText("Cháy khó khăn")).toBeInTheDocument();
  });
});

describe("RadiantDoseDial", () => {
  it("escalates the outcome as the target moves toward the flame", () => {
    renderWithIntl(<RadiantDoseDial />);
    const dist = screen.getByLabelText("Distance to the target");
    fireEvent.change(dist, { target: { value: "6" } });
    expect(screen.getByText("Pain, no injury")).toBeInTheDocument();
    fireEvent.change(dist, { target: { value: "1" } });
    expect(screen.getByText("Dry fuel bursts alight")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<RadiantDoseDial />, "vi");
    expect(screen.getByLabelText("Nhiệt độ ngọn lửa")).toBeInTheDocument();
  });
});

describe("BurningWingTimeBudget", () => {
  it("loses control seconds before the membrane burns through", () => {
    renderWithIntl(<BurningWingTimeBudget />);
    expect(screen.getByText("2.8–4.5 s")).toBeInTheDocument();
    expect(screen.getByText("50 s")).toBeInTheDocument();
  });

  it("confirms the membrane is thermally thin", () => {
    renderWithIntl(<BurningWingTimeBudget />);
    expect(screen.getByText("Thermally thin — heats right through")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<BurningWingTimeBudget />, "vi");
    expect(screen.getByText("Mất điều khiển")).toBeInTheDocument();
  });
});

describe("EdgeToughnessTradeoff", () => {
  it("shows volcanic glass surviving a single hard strike", () => {
    renderWithIntl(<EdgeToughnessTradeoff />);
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("No furnace needed")).toBeInTheDocument();
  });

  it("swaps to steel and reports its furnace cost", () => {
    renderWithIntl(<EdgeToughnessTradeoff />);
    fireEvent.click(screen.getByRole("button", { name: "Hardened steel" }));
    expect(screen.getByText("Needs about 1475 °C")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<EdgeToughnessTradeoff />, "vi");
    expect(screen.getByText("Không cần lò")).toBeInTheDocument();
  });
});

describe("PyricNutrientLedger", () => {
  it("credits the ash bed while the ash stays at the surface", () => {
    renderWithIntl(<PyricNutrientLedger />);
    expect(screen.getByText("Feeds the next forest")).toBeInTheDocument();
  });

  it("returns nothing once the ash is buried", () => {
    renderWithIntl(<PyricNutrientLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Ash buried under tephra" }));
    expect(screen.getByText("Gives nothing back")).toBeInTheDocument();
    expect(screen.getByText("None reaches the soil")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<PyricNutrientLedger />, "vi");
    expect(screen.getByText("Nuôi cánh rừng kế tiếp")).toBeInTheDocument();
  });
});

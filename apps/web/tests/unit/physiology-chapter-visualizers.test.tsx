import { AcidBaseSetPointSolver } from "@/components/content/acid-base-set-point-solver";
import { OxygenAffinityBench } from "@/components/content/oxygen-affinity-bench";
import { RadiatorHeatLedger } from "@/components/content/radiator-heat-ledger";
import { SulfideElectronLedger } from "@/components/content/sulfide-electron-ledger";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("AcidBaseSetPointSolver", () => {
  it("opens on the terrestrial ratio and lands on the textbook pH", () => {
    renderWithIntl(<AcidBaseSetPointSolver />);
    expect(screen.getByText("7.39")).toBeInTheDocument();
    expect(screen.getByText("The terrestrial window, defended.")).toBeInTheDocument();
  });

  it("shows that holding the terrestrial pH in Pandoran air needs an unaffordable reserve", () => {
    renderWithIntl(<AcidBaseSetPointSolver />);
    fireEvent.click(screen.getByRole("radio", { name: "Hold 7.40 here" }));
    // The reserve, not the pH, is what fails: 74 mmol/L against a mammal's 24.
    expect(screen.getByText("Beyond the tissue")).toBeInTheDocument();
    expect(screen.getByText("The terrestrial window, defended.")).toBeInTheDocument();
  });

  it("reaches an affordable reserve once the set-point itself moves down", () => {
    renderWithIntl(<AcidBaseSetPointSolver />);
    fireEvent.click(screen.getByRole("radio", { name: "Native set-point" }));
    expect(screen.getByText("7.16")).toBeInTheDocument();
    expect(screen.getByText("Heavy but payable")).toBeInTheDocument();
  });

  it("turns alkaline when clean Earth air strips the carbon dioxide out", () => {
    renderWithIntl(<AcidBaseSetPointSolver />);
    fireEvent.click(screen.getByRole("radio", { name: "Native in Earth air" }));
    // Bicarbonate stays at 42 while carbon dioxide falls to 18 mmHg, so pH runs away.
    expect(screen.getByText("Past the alkaline limit. Tetany, then apnoea.")).toBeInTheDocument();
  });

  it("keeps the pH inside the window when only the reserve is raised to match", () => {
    renderWithIntl(<AcidBaseSetPointSolver />);
    fireEvent.change(screen.getByLabelText("Arterial carbon dioxide"), {
      target: { value: "120" },
    });
    fireEvent.change(screen.getByLabelText("Plasma bicarbonate"), { target: { value: "74" } });
    expect(screen.getByText("7.40")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<AcidBaseSetPointSolver />, "vi");
    expect(screen.getByText("Cửa sổ Trái Đất, được bảo vệ.")).toBeInTheDocument();
  });
});

describe("OxygenAffinityBench", () => {
  it("opens on resting human blood, which barely taps its cargo", () => {
    renderWithIntl(<OxygenAffinityBench />);
    expect(screen.getByText("A full reserve")).toBeInTheDocument();
    expect(
      screen.getByText("A light draw. Most of the cargo goes back unused."),
    ).toBeInTheDocument();
  });

  it("strips the reserve to nothing in a native sprint", () => {
    renderWithIntl(<OxygenAffinityBench />);
    fireEvent.click(screen.getByRole("radio", { name: "Native, sprinting" }));
    expect(screen.getByText("Almost nothing held back")).toBeInTheDocument();
    // Loading is untouched: alveolar oxygen sits on the plateau of the curve.
    expect(
      screen.getByText("Loading sits on the flat top of the curve, where affinity barely matters."),
    ).toBeInTheDocument();
  });

  it("recovers the reserve when the pigment stops answering to acid", () => {
    renderWithIntl(<OxygenAffinityBench />);
    fireEvent.click(screen.getByRole("radio", { name: "Native, sprinting" }));
    fireEvent.change(screen.getByLabelText("Acid sensitivity"), { target: { value: "0" } });
    expect(screen.getByText("A usable margin")).toBeInTheDocument();
  });

  it("makes loading the limit once affinity is pushed far enough down", () => {
    renderWithIntl(<OxygenAffinityBench />);
    fireEvent.change(screen.getByLabelText("Half-saturation pressure"), {
      target: { value: "46" },
    });
    fireEvent.change(screen.getByLabelText("Cooperativity"), { target: { value: "1" } });
    expect(
      screen.getByText(
        "Now the pigment cannot fill even at the lung. Loading has become the limit.",
      ),
    ).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<OxygenAffinityBench />, "vi");
    expect(screen.getByText("Dự trữ còn nguyên")).toBeInTheDocument();
  });
});

describe("RadiatorHeatLedger", () => {
  it("puts a three-tonne chase on a clock, because the ceiling is far below the effort", () => {
    renderWithIntl(<RadiatorHeatLedger />);
    expect(
      screen.getByText("Above the ceiling. The core is climbing and the chase has a deadline."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nearly closed. Sweat will not evaporate, so it cools nothing."),
    ).toBeInTheDocument();
  });

  it("credits the denser air with the whole cooling advantage", () => {
    renderWithIntl(<RadiatorHeatLedger />);
    // At 1.47 against Earth's 1.225, the rho^0.7 term is worth about 14 per cent.
    expect(screen.getByText("14%")).toBeInTheDocument();
    expect(
      screen.getByText("Advantage over Earth-density air at the same speed."),
    ).toBeInTheDocument();
  });

  it("flips the problem to conserving heat once the eclipse takes the sky away", () => {
    renderWithIntl(<RadiatorHeatLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Eclipse totality" }));
    expect(
      screen.getByText(
        "Far under the ceiling. The radiators have to be shut or the body simply drains.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("no limit")).toBeInTheDocument();
  });

  it("buys a longer chase when more of the body is given over to radiators", () => {
    renderWithIntl(<RadiatorHeatLedger />);
    expect(screen.getByText("3.6× resting")).toBeInTheDocument();
    expect(screen.getByText("24 min")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Radiator surface"), { target: { value: "0.25" } });
    expect(screen.getByText("4.6× resting")).toBeInTheDocument();
    expect(screen.getByText("27 min")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<RadiatorHeatLedger />, "vi");
    expect(
      screen.getByText("Vượt trần. Nhiệt độ lõi đang leo lên và cuộc truy đuổi có hạn chót."),
    ).toBeInTheDocument();
  });
});

describe("SulfideElectronLedger", () => {
  it("opens with Pandoran air arresting a human respiratory chain outright", () => {
    renderWithIntl(<SulfideElectronLedger />);
    expect(screen.getByText("A poison")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Past the cascade and onto the oxygen-reduction site. Every mitochondrion stops at once.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the same biology alive behind a mask, by never delivering the dose", () => {
    renderWithIntl(<SulfideElectronLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Human, masked" }));
    expect(screen.getByText("A trace")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("turns the same molecule into food for a native cascade", () => {
    renderWithIntl(<SulfideElectronLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Pandoran native" }));
    expect(screen.getByText("A supplement")).toBeInTheDocument();
    expect(screen.getByText("Real energy, arriving with the air.")).toBeInTheDocument();
  });

  it("kills even the native cascade once the exposure passes its capacity", () => {
    renderWithIntl(<SulfideElectronLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Pandoran native" }));
    fireEvent.change(screen.getByLabelText("Sulfide in the air"), { target: { value: "1" } });
    expect(screen.getByText("A poison")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<SulfideElectronLedger />, "vi");
    expect(screen.getByText("Một chất độc")).toBeInTheDocument();
  });
});

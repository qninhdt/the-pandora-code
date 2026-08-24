import { BallastBudgetPlanner } from "@/components/content/ballast-budget-planner";
import { JetMeanderMap } from "@/components/content/jet-meander-map";
import { SeasonReversalCircuit } from "@/components/content/season-reversal-circuit";
import { WindLayerRouter } from "@/components/content/wind-layer-router";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("WindLayerRouter", () => {
  it("opens in the low trade layer heading west", () => {
    renderWithIntl(<WindLayerRouter />);
    expect(screen.getByText("Low trades")).toBeInTheDocument();
    expect(screen.getByText(/circuits west/)).toBeInTheDocument();
  });

  it("reverses the destination when the reader climbs into the jet", () => {
    renderWithIntl(<WindLayerRouter />);
    fireEvent.change(screen.getByRole("slider", { name: "Flight level" }), {
      target: { value: "9.5" },
    });
    expect(screen.getByText("Jet core")).toBeInTheDocument();
    expect(screen.getByText(/circuits east/)).toBeInTheDocument();
  });

  it("labels the control in Vietnamese", () => {
    renderWithIntl(<WindLayerRouter />, "vi");
    expect(screen.getByRole("slider", { name: "Tầng bay" })).toBeInTheDocument();
    expect(screen.getByText("Tín phong tầng thấp")).toBeInTheDocument();
  });
});

describe("JetMeanderMap", () => {
  it("starts with weather still arriving", () => {
    renderWithIntl(<JetMeanderMap />);
    expect(screen.getByText("Weather keeps arriving")).toBeInTheDocument();
  });

  it("blocks when a long wave is slowed to its resonant flow", () => {
    renderWithIntl(<JetMeanderMap />);
    fireEvent.change(screen.getByRole("slider", { name: "Waves around the latitude" }), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "Mean flow carrying them" }), {
      target: { value: "17" },
    });
    expect(screen.getByText("Blocked — nowhere to go")).toBeInTheDocument();
  });

  it("labels the controls in Vietnamese", () => {
    renderWithIntl(<JetMeanderMap />, "vi");
    expect(screen.getByRole("slider", { name: "Số sóng quanh vòng vĩ tuyến" })).toBeInTheDocument();
  });
});

describe("BallastBudgetPlanner", () => {
  it("fails the all-jet itinerary a reader reaches for first", () => {
    renderWithIntl(<BallastBudgetPlanner />);
    expect(screen.getByText("Short of the rendezvous")).toBeInTheDocument();
  });

  it("arrives once each leg gets the level its wind field rewards", () => {
    renderWithIntl(<BallastBudgetPlanner />);
    const levels = ["Low", "Middle", "Jet", "Middle", "Low"];
    levels.forEach((level, i) => {
      const group = screen.getByRole("radiogroup", { name: `Flight level for leg ${i + 1}` });
      fireEvent.click(within(group).getByRole("radio", { name: level }));
    });
    expect(screen.getByText("Arrived at the rendezvous")).toBeInTheDocument();
  });

  it("labels the legs in Vietnamese", () => {
    renderWithIntl(<BallastBudgetPlanner />, "vi");
    expect(screen.getByText("Chặng 1")).toBeInTheDocument();
    expect(screen.getByText("Nước dằn")).toBeInTheDocument();
  });
});

describe("SeasonReversalCircuit", () => {
  it("fits the circuit inside a semi-annual wind season", () => {
    renderWithIntl(<SeasonReversalCircuit />);
    expect(screen.getByText("moored, trading, waiting for the turn")).toBeInTheDocument();
  });

  it("overruns the season when a becalmed caravan faces four reversals", () => {
    renderWithIntl(<SeasonReversalCircuit />);
    fireEvent.click(screen.getByRole("radio", { name: "Four times" }));
    fireEvent.change(screen.getByRole("slider", { name: "Riding speed" }), {
      target: { value: "2" },
    });
    expect(screen.getByText("the wind turns before the circuit closes")).toBeInTheDocument();
  });

  it("labels the cadence options in Vietnamese", () => {
    renderWithIntl(<SeasonReversalCircuit />, "vi");
    expect(screen.getByRole("radio", { name: "Hai lần" })).toBeInTheDocument();
  });
});

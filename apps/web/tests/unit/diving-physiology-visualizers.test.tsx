import { AdaptationTimescaleLadder } from "@/components/content/adaptation-timescale-ladder";
import { AscentHypoxiaProfile } from "@/components/content/ascent-hypoxia-profile";
import { DiveOxygenBudget } from "@/components/content/dive-oxygen-budget";
import { HydrostaticDepthDial } from "@/components/content/hydrostatic-depth-dial";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("HydrostaticDepthDial", () => {
  it("opens at the depth where an untrained lung reaches residual volume", () => {
    renderWithIntl(<HydrostaticDepthDial />);
    expect(screen.getByText("3.98 atm")).toBeInTheDocument();
    expect(screen.getByText("one atmosphere per 10.1 m")).toBeInTheDocument();
  });

  it("pushes the squeeze deeper when the same dive happens under 0.8 g", () => {
    renderWithIntl(<HydrostaticDepthDial />);
    fireEvent.click(screen.getByRole("radio", { name: "Pandora 0.8 g" }));
    expect(screen.getByText("3.38 atm")).toBeInTheDocument();
    expect(screen.getByText("one atmosphere per 12.6 m")).toBeInTheDocument();
  });

  it("crosses into thoracic squeeze once the diver goes deep enough", () => {
    renderWithIntl(<HydrostaticDepthDial />);
    fireEvent.change(screen.getByRole("slider", { name: "Depth" }), {
      target: { value: "60" },
    });
    expect(
      screen.getByText("Below residual volume — chest wall alone cannot hold"),
    ).toBeInTheDocument();
  });

  it("labels the world control in Vietnamese", () => {
    renderWithIntl(<HydrostaticDepthDial />, "vi");
    expect(screen.getByRole("radio", { name: "Pandora 0,8 g" })).toBeInTheDocument();
    expect(screen.getByText("Độ sâu")).toBeInTheDocument();
  });
});

describe("DiveOxygenBudget", () => {
  it("cannot hold the opening dive on an untrained body with no metabolic brake", () => {
    renderWithIntl(<DiveOxygenBudget />);
    expect(screen.getByText("Past the limit — the muscles go anaerobic")).toBeInTheDocument();
  });

  it("fits the dive once the metabolism is braked the way the reflex brakes it", () => {
    renderWithIntl(<DiveOxygenBudget />);
    fireEvent.change(screen.getByRole("slider", { name: "Metabolic rate held to" }), {
      target: { value: "0.4" },
    });
    expect(screen.getByText("The dive fits inside the aerobic limit")).toBeInTheDocument();
  });

  it("shows how little of a seal's oxygen sits in its lungs", () => {
    renderWithIntl(<DiveOxygenBudget />);
    fireEvent.click(screen.getByRole("radio", { name: "Seal" }));
    expect(screen.getByText("87 mL per kg of body")).toBeInTheDocument();
  });

  it("labels the body control in Vietnamese", () => {
    renderWithIntl(<DiveOxygenBudget />, "vi");
    expect(screen.getByRole("radio", { name: "Hải cẩu" })).toBeInTheDocument();
    expect(screen.getByText("Oxy mang theo")).toBeInTheDocument();
  });
});

describe("AdaptationTimescaleLadder", () => {
  it("opens on the month that buys doubled underwater eyesight", () => {
    renderWithIntl(<AdaptationTimescaleLadder />);
    expect(screen.getByText("Growing into it")).toBeInTheDocument();
    expect(screen.getByText("Grown in during childhood, kept for life")).toBeInTheDocument();
  });

  it("still refuses a fluke long after inheritance becomes possible", () => {
    renderWithIntl(<AdaptationTimescaleLadder />);
    const budget = screen.getByRole("slider", { name: "Time available" });

    // ~3600 years in log10 hours: a selection signal has had time to fix,
    // but nothing here can rebuild a skeleton.
    fireEvent.change(budget, { target: { value: "7.5" } });
    expect(screen.getByText("Inheritance")).toBeInTheDocument();

    // ~15 Ma — the only tier that can turn a tail into a fluke.
    fireEvent.change(budget, { target: { value: "11.2" } });
    expect(screen.getByText("Rebuilt skeleton")).toBeInTheDocument();
    expect(screen.getByText("Deep time, and no going back")).toBeInTheDocument();
  });

  it("names the tiers in Vietnamese", () => {
    renderWithIntl(<AdaptationTimescaleLadder />, "vi");
    expect(screen.getByText("Lớn lên cùng nó")).toBeInTheDocument();
    expect(screen.getByText("Thời gian có được")).toBeInTheDocument();
  });
});

describe("AscentHypoxiaProfile", () => {
  it("warns a normally breathing diver before the oxygen gives out", () => {
    renderWithIntl(<AscentHypoxiaProfile />);
    expect(screen.getByText("The alarm arrives before the oxygen runs out")).toBeInTheDocument();
  });

  it("removes the warning rather than adding oxygen when the diver hyperventilates", () => {
    renderWithIntl(<AscentHypoxiaProfile />);
    fireEvent.click(screen.getByRole("radio", { name: "Hyperventilated" }));
    expect(screen.getByText("Oxygen fails before any warning comes")).toBeInTheDocument();
    expect(screen.getByText("Blackout on ascent")).toBeInTheDocument();
  });

  it("labels the preparation control in Vietnamese", () => {
    renderWithIntl(<AscentHypoxiaProfile />, "vi");
    expect(screen.getByRole("radio", { name: "Thở gấp trước" })).toBeInTheDocument();
    expect(screen.getByText("Thời gian ở đáy")).toBeInTheDocument();
  });
});

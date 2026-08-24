import { StaticMarginTrade } from "@/components/content/static-margin-trade";
import { TandemWingInterference } from "@/components/content/tandem-wing-interference";
import { TurnEnvelopeDiagram } from "@/components/content/turn-envelope-diagram";
import { WingPhaseController } from "@/components/content/wing-phase-controller";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("TandemWingInterference", () => {
  it("starts with the wings nearly level and spoiling each other", () => {
    renderWithIntl(<TandemWingInterference />);
    expect(screen.getByText("Flying in air already pushed downward")).toBeInTheDocument();
  });

  it("recovers the rear wing's lift once the gap opens up", () => {
    renderWithIntl(<TandemWingInterference />);
    fireEvent.change(screen.getByLabelText("Vertical gap between wings"), {
      target: { value: "0.5" },
    });
    expect(screen.getByText("Meeting nearly clean air")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<TandemWingInterference />, "vi");
    expect(screen.getByText("Bay trong khối khí đã bị đẩy xuống")).toBeInTheDocument();
  });
});

describe("WingPhaseController", () => {
  it("defaults to the wake-recapture timing", () => {
    renderWithIntl(<WingPhaseController />);
    expect(screen.getByText("Cheapest cruise")).toBeInTheDocument();
  });

  it("switches to a steady platform when the pairs beat in opposition", () => {
    renderWithIntl(<WingPhaseController />);
    fireEvent.change(screen.getByLabelText("How far the rear pair lags"), {
      target: { value: "180" },
    });
    expect(screen.getByText("Steadiest platform")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<WingPhaseController />, "vi");
    expect(screen.getByText("Bay đường dài rẻ nhất")).toBeInTheDocument();
  });
});

describe("StaticMarginTrade", () => {
  it("starts self-righting and sluggish", () => {
    renderWithIntl(<StaticMarginTrade />);
    expect(screen.getByText("Comfortable, sluggish")).toBeInTheDocument();
  });

  it("turns vicious once the mass moves behind the neutral point", () => {
    renderWithIntl(<StaticMarginTrade />);
    fireEvent.change(screen.getByLabelText("Where the mass sits along the body"), {
      target: { value: "0.55" },
    });
    expect(screen.getByText("Vicious, demanding")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<StaticMarginTrade />, "vi");
    expect(screen.getByText("Dễ chịu, chậm chạp")).toBeInTheDocument();
  });
});

describe("TurnEnvelopeDiagram", () => {
  it("is lift-limited at low airspeed", () => {
    renderWithIntl(<TurnEnvelopeDiagram />);
    expect(screen.getByText("Limited by the wing")).toBeInTheDocument();
  });

  it("becomes body-limited once past corner speed", () => {
    renderWithIntl(<TurnEnvelopeDiagram />);
    fireEvent.change(screen.getByLabelText("Airspeed"), { target: { value: "65" } });
    expect(screen.getByText("Limited by the body")).toBeInTheDocument();
  });

  it("switches worlds and flyers", () => {
    renderWithIntl(<TurnEnvelopeDiagram />);
    fireEvent.click(screen.getByRole("radio", { name: "Earth" }));
    fireEvent.click(screen.getByRole("radio", { name: "Albatross" }));
    expect(screen.getByRole("radio", { name: "Albatross" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<TurnEnvelopeDiagram />, "vi");
    expect(screen.getByRole("radio", { name: "Pandora" })).toBeInTheDocument();
  });
});

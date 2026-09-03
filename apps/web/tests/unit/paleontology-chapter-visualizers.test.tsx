import { ArchiveBlindspotMatrix } from "@/components/content/archive-blindspot-matrix";
import { LastAppearanceSmear } from "@/components/content/last-appearance-smear";
import { PyriteWindowDial } from "@/components/content/pyrite-window-dial";
import { TaphonomicGauntlet } from "@/components/content/taphonomic-gauntlet";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("TaphonomicGauntlet", () => {
  it("opens on the forest floor, where burial is the gate that kills", () => {
    renderWithIntl(<TaphonomicGauntlet />);
    expect(screen.getByText("Effectively no record")).toBeInTheDocument();
    expect(screen.getAllByText("Rapid burial").length).toBeGreaterThan(0);
    expect(
      screen.getByText("The body is gone before sediment can cover it — the usual killer."),
    ).toBeInTheDocument();
  });

  it("inverts the verdict when the animal dies under an ash fall", () => {
    renderWithIntl(<TaphonomicGauntlet />);
    fireEvent.click(screen.getByRole("radio", { name: "Ash fall" }));
    expect(screen.getByText("An exceptional archive")).toBeInTheDocument();
    // With burial no longer the bottleneck, discovery becomes the tightest gate.
    expect(
      screen.getByText("In the ground, and nobody has cut that hillside open."),
    ).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<TaphonomicGauntlet />, "vi");
    expect(screen.getByText("Coi như không có hồ sơ")).toBeInTheDocument();
  });
});

describe("PyriteWindowDial", () => {
  it("starts on Earth, outside the window for want of sulfide", () => {
    renderWithIntl(<PyriteWindowDial />);
    expect(screen.getByText("Nothing forms")).toBeInTheDocument();
    expect(screen.getByText("Sulfide supply")).toBeInTheDocument();
  });

  it("opens the window when the Pandoran preset charges the water", () => {
    renderWithIntl(<PyriteWindowDial />);
    fireEvent.click(screen.getByRole("radio", { name: "Pandoran basin" }));
    expect(screen.getByText("Soft tissue replaced")).toBeInTheDocument();
    // Sulfide stops being the brake; iron delivery becomes the limit instead.
    expect(screen.getByText("Iron supply")).toBeInTheDocument();
    expect(screen.getByText("Organs and gut traceable")).toBeInTheDocument();
  });

  it("reaches cellular fidelity once iron keeps up with the sulfide", () => {
    renderWithIntl(<PyriteWindowDial />);
    fireEvent.click(screen.getByRole("radio", { name: "Pandoran basin" }));
    fireEvent.change(screen.getByLabelText("Reactive iron"), { target: { value: "95" } });
    expect(screen.getByText("Filaments at cellular scale")).toBeInTheDocument();
  });

  it("closes the window again when background carbon runs away", () => {
    renderWithIntl(<PyriteWindowDial />);
    fireEvent.click(screen.getByRole("radio", { name: "Pandoran basin" }));
    fireEvent.change(screen.getByLabelText("Background organic carbon"), {
      target: { value: "90" },
    });
    expect(screen.getByText("Carbon-poisoned")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<PyriteWindowDial />, "vi");
    expect(screen.getByLabelText("Sulfide hòa tan")).toBeInTheDocument();
  });
});

describe("LastAppearanceSmear", () => {
  it("shows a smear of last appearances even though the extinction was one event", () => {
    renderWithIntl(<LastAppearanceSmear />);
    expect(screen.getByText("True extinction")).toBeInTheDocument();
    expect(screen.getByText("Apparent decline")).toBeInTheDocument();
  });

  it("widens the apparent decline as sampling effort drops", () => {
    const { unmount } = renderWithIntl(<LastAppearanceSmear />);
    fireEvent.change(screen.getByLabelText("Sampling effort"), { target: { value: "10" } });
    // At minimum effort the rarest taxon falls out of the record entirely.
    expect(screen.getAllByText("never found").length).toBeGreaterThan(0);
    unmount();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<LastAppearanceSmear />, "vi");
    expect(screen.getByText("Tuyệt chủng thật")).toBeInTheDocument();
  });
});

describe("ArchiveBlindspotMatrix", () => {
  it("sends a question about lived experience to the network", () => {
    renderWithIntl(<ArchiveBlindspotMatrix />);
    expect(screen.getByText("Ask this one")).toBeInTheDocument();
    expect(screen.getByText("Experience, replayed with its texture intact.")).toBeInTheDocument();
  });

  it("sends a deep-time question to the rock instead", () => {
    renderWithIntl(<ArchiveBlindspotMatrix />);
    fireEvent.click(screen.getByRole("radio", { name: "A dead ocean" }));
    expect(screen.getByText("What happened, whether or not anything watched.")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<ArchiveBlindspotMatrix />, "vi");
    expect(screen.getByText("Hai kho lưu trữ, hai điểm mù")).toBeInTheDocument();
  });
});

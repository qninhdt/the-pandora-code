import { RainShadowTransect } from "@/components/content/rain-shadow-transect";
import { PHYSICS, runTransect } from "@/components/content/rain-shadow-transect-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("rain shadow transect model", () => {
  it("gives Pandora the gentler lapse rate", () => {
    expect(PHYSICS.pandora.dryLapse).toBeLessThan(PHYSICS.earth.dryLapse);
  });

  it("dries the lee far harder on Earth than on Pandora at the same ridge", () => {
    const earth = runTransect("earth", 2.6, 34);
    const pandora = runTransect("pandora", 2.6, 34);
    expect(earth.leeCm).toBeLessThan(pandora.leeCm);
    expect(earth.ridgeC).toBeLessThan(pandora.ridgeC);
    expect(earth.verdict).toBe("desert");
    expect(pandora.verdict).toBe("grassland");
  });

  it("warms the lee plain above the coast it started from", () => {
    const r = runTransect("pandora", 2.6, 34);
    expect(r.leeC).toBeGreaterThan(r.coastC);
    expect(r.leeRh).toBeLessThan(1);
  });

  it("makes no shadow worth the name from a low ridge", () => {
    const low = runTransect("pandora", 0.3, 10);
    const high = runTransect("pandora", 4.5, 10);
    expect(low.leeCm).toBeGreaterThan(high.leeCm);
    expect(low.verdict).toBe("wetBoth");
  });

  it("keeps Pandora's wet belt supplying rain twice as far from the equator", () => {
    expect(runTransect("pandora", 1, 20).supplyCm).toBeGreaterThan(
      runTransect("earth", 1, 20).supplyCm,
    );
  });
});

describe("RainShadowTransect", () => {
  it("opens on Pandora with a semi-arid lee plain, not a desert", () => {
    renderWithIntl(<RainShadowTransect />);
    expect(screen.getByText("Where the dry country hides")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Pandora" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/Semi-arid grassland/)).toBeInTheDocument();
  });

  it("turns the same transect into a real desert on Earth's air", () => {
    renderWithIntl(<RainShadowTransect />);
    fireEvent.click(screen.getByRole("radio", { name: "Earth" }));
    expect(screen.getByText(/A real rain shadow/)).toBeInTheDocument();
  });

  it("wets both flanks when the range is flattened inside the wet belt", () => {
    renderWithIntl(<RainShadowTransect />);
    fireEvent.change(screen.getByLabelText("Latitude of the transect"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("Height of the range"), { target: { value: "0.3" } });
    expect(screen.getByText(/No shadow worth the name/)).toBeInTheDocument();
  });

  it("reports the other world's lee rainfall for comparison", () => {
    renderWithIntl(<RainShadowTransect />);
    expect(screen.getByText(/Move the same range to Earth/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Earth" }));
    expect(screen.getByText(/Move the same range to Pandora/)).toBeInTheDocument();
  });

  it("renders the Vietnamese controls and verdict", () => {
    renderWithIntl(<RainShadowTransect />, "vi");
    expect(screen.getByLabelText("Độ cao của dãy núi")).toBeInTheDocument();
    expect(screen.getByText(/Đồng cỏ bán khô hạn/)).toBeInTheDocument();
  });
});

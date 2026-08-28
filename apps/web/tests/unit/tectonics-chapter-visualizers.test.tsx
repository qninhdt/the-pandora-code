import { BurialHoopMountainBuilder } from "@/components/content/burial-hoop-mountain-builder";
import { MantleConvectionRayleigh } from "@/components/content/mantle-convection-rayleigh";
import { OreGenesisRegimeLedger } from "@/components/content/ore-genesis-regime-ledger";
import { SeismicShadowSounder } from "@/components/content/seismic-shadow-sounder";
import { TectonicRegimeSelector } from "@/components/content/tectonic-regime-selector";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("SeismicShadowSounder", () => {
  it("delivers both waves while the station is inside 103 degrees", () => {
    renderWithIntl(<SeismicShadowSounder />);
    expect(screen.getByText("Rigid all the way down")).toBeInTheDocument();
  });

  it("loses the shear wave once the path must cross the liquid core", () => {
    renderWithIntl(<SeismicShadowSounder />);
    fireEvent.change(screen.getByLabelText("Angle from the quake to the station"), {
      target: { value: "120" },
    });
    expect(screen.getByText("Core is liquid")).toBeInTheDocument();
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("restores the shear wave when the core is set solid", () => {
    renderWithIntl(<SeismicShadowSounder />);
    fireEvent.change(screen.getByLabelText("Angle from the quake to the station"), {
      target: { value: "160" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Solid throughout" }));
    expect(screen.getByText("Rigid all the way down")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<SeismicShadowSounder />, "vi");
    expect(screen.getByText("Cứng suốt xuống dưới")).toBeInTheDocument();
  });
});

describe("MantleConvectionRayleigh", () => {
  it("has Earth's mantle overturning by default", () => {
    renderWithIntl(<MantleConvectionRayleigh />);
    expect(screen.getByText("Overturns")).toBeInTheDocument();
  });

  it("stops convection when the rock is made stiff enough", () => {
    renderWithIntl(<MantleConvectionRayleigh />);
    fireEvent.change(screen.getByLabelText("Layer thickness"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Rock viscosity"), { target: { value: "24" } });
    expect(screen.getByText("Only conducts")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<MantleConvectionRayleigh />, "vi");
    expect(screen.getByText("Đảo lộn")).toBeInTheDocument();
  });
});

describe("TectonicRegimeSelector", () => {
  it("places Earth's own numbers in the moving-crust field", () => {
    renderWithIntl(<TectonicRegimeSelector />);
    expect(screen.getByText("Moving crust")).toBeInTheDocument();
  });

  it("switches to a frozen shell when the crust is made strong", () => {
    renderWithIntl(<TectonicRegimeSelector />);
    fireEvent.change(screen.getByLabelText("Strength of the crust"), { target: { value: "3" } });
    expect(screen.getByText("One frozen shell")).toBeInTheDocument();
  });

  it("overrides everything with melt transport at high heat flux", () => {
    renderWithIntl(<TectonicRegimeSelector />);
    fireEvent.change(screen.getByLabelText("Heat leaving the surface"), { target: { value: "0.5" } });
    expect(screen.getByText("Vented through melt")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<TectonicRegimeSelector />, "vi");
    expect(screen.getByText("Vỏ dịch chuyển")).toBeInTheDocument();
  });
});

describe("BurialHoopMountainBuilder", () => {
  it("thrusts blocks upward once burial squeezes the crust past its strength", () => {
    renderWithIntl(<BurialHoopMountainBuilder />);
    expect(screen.getByText("Blocks thrust upward")).toBeInTheDocument();
  });

  it("holds the crust together when burial is shallow", () => {
    renderWithIntl(<BurialHoopMountainBuilder />);
    fireEvent.change(screen.getByLabelText("Depth of burial"), { target: { value: "3" } });
    expect(screen.getByText("Crust holds")).toBeInTheDocument();
  });

  it("shows most of a collisional range hidden underground", () => {
    renderWithIntl(<BurialHoopMountainBuilder />);
    fireEvent.click(screen.getByRole("radio", { name: "Continents colliding" }));
    expect(screen.getByText("Range floats")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<BurialHoopMountainBuilder />, "vi");
    expect(screen.getByText("Khối vỏ bị đẩy vọt lên")).toBeInTheDocument();
  });
});

describe("OreGenesisRegimeLedger", () => {
  it("keeps every route open on a world with a moving crust", () => {
    renderWithIntl(<OreGenesisRegimeLedger />);
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("closes the arc route once the crust stops moving", () => {
    renderWithIntl(<OreGenesisRegimeLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Frozen shell" }));
    expect(screen.getByText("Ruled out")).toBeInTheDocument();
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("leaves magmatic settling available in every regime", () => {
    renderWithIntl(<OreGenesisRegimeLedger />);
    fireEvent.click(screen.getByRole("radio", { name: "Melt-vented" }));
    fireEvent.click(screen.getByRole("button", { name: "Settling out of magma" }));
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<OreGenesisRegimeLedger />, "vi");
    expect(screen.getByText("Khả dụng")).toBeInTheDocument();
  });
});

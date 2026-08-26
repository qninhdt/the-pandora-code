import { ConsentLadder } from "@/components/content/consent-ladder";
import { ExtinctionDiscountExplorer } from "@/components/content/extinction-discount-explorer";
import { ReproductiveValueElasticity } from "@/components/content/reproductive-value-elasticity";
import { SenescenceArrestCurve } from "@/components/content/senescence-arrest-curve";
import { WildHarvestYieldLadder } from "@/components/content/wild-harvest-yield-ladder";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("ExtinctionDiscountExplorer", () => {
  it("recommends liquidation when capital outgrows the animal", () => {
    renderWithIntl(<ExtinctionDiscountExplorer />);
    expect(screen.getByText("Optimal to harvest to zero")).toBeInTheDocument();
    expect(screen.getByText("Capital outgrows the animal")).toBeInTheDocument();
  });

  it("flips to conservation once the stock grows faster than money", () => {
    renderWithIntl(<ExtinctionDiscountExplorer />);
    fireEvent.change(screen.getByLabelText("Discount rate"), { target: { value: "0.01" } });
    fireEvent.change(screen.getByLabelText("Stock growth rate"), { target: { value: "0.2" } });
    expect(screen.getByText("The animal outgrows capital")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<ExtinctionDiscountExplorer />, "vi");
    expect(screen.getByLabelText("Suất chiết khấu")).toBeInTheDocument();
  });
});

describe("ReproductiveValueElasticity", () => {
  it("opens on the class the hunt actually targets", () => {
    renderWithIntl(<ReproductiveValueElasticity />);
    expect(
      screen.getByRole("radio", { name: "Breeding females", checked: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Recovery time")).toBeInTheDocument();
  });

  it("shows a milder growth penalty for calves", () => {
    renderWithIntl(<ReproductiveValueElasticity />);
    fireEvent.click(screen.getByRole("radio", { name: "Calves" }));
    expect(
      screen.getByText("Losses in this class hurt, but the population absorbs them.", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<ReproductiveValueElasticity />, "vi");
    expect(screen.getByRole("radio", { name: "Con mẹ sinh sản" })).toBeInTheDocument();
  });
});

describe("WildHarvestYieldLadder", () => {
  it("opens on the case with no synthetic exit", () => {
    renderWithIntl(<WildHarvestYieldLadder />);
    expect(screen.getByText("Tulkun cranial gland")).toBeInTheDocument();
    expect(screen.getByText("None — wild harvest continues")).toBeInTheDocument();
  });

  it("switches to a compound industry escaped", () => {
    renderWithIntl(<WildHarvestYieldLadder />);
    fireEvent.click(screen.getByRole("button", { name: "Paclitaxel" }));
    expect(screen.getByText("Pacific yew bark")).toBeInTheDocument();
    expect(screen.getByText("Semi-synthesis, then cell culture")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<WildHarvestYieldLadder />, "vi");
    expect(screen.getByText("Tuyến trong hộp sọ tulkun")).toBeInTheDocument();
  });
});

describe("SenescenceArrestCurve", () => {
  it("reports a finite doubling time while aging continues", () => {
    renderWithIntl(<SenescenceArrestCurve />);
    expect(screen.getByRole("radio", { name: "Slow", checked: true })).toBeInTheDocument();
    expect(screen.getByText("Risk doubling time")).toBeInTheDocument();
    expect(screen.queryByText("∞")).not.toBeInTheDocument();
  });

  it("flattens the hazard entirely when aging is arrested", () => {
    renderWithIntl(<SenescenceArrestCurve />);
    fireEvent.click(screen.getByRole("radio", { name: "Arrest" }));
    expect(screen.getByText("∞")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<SenescenceArrestCurve />, "vi");
    expect(screen.getByRole("radio", { name: "Chặn hẳn" })).toBeInTheDocument();
  });
});

describe("ConsentLadder", () => {
  it("shows the consent rung as unmet", () => {
    renderWithIntl(<ConsentLadder />);
    expect(screen.getByText("Nagoya Protocol, in force 2014")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("marks open access as the only rung the trade clears", () => {
    renderWithIntl(<ConsentLadder />);
    fireEvent.click(screen.getByRole("button", { name: "Open access" }));
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No consent owed")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<ConsentLadder />, "vi");
    expect(screen.getByText("Đồng thuận báo trước")).toBeInTheDocument();
  });
});

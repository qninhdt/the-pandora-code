import { IsotopeTracerAudit } from "@/components/content/isotope-tracer-audit";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("IsotopeTracerAudit", () => {
  it("starts with labels only, so soil leak is still an open explanation", () => {
    renderWithIntl(<IsotopeTracerAudit />);
    expect(screen.getByText("Something moved")).toBeInTheDocument();
    expect(screen.getByText("Soil leak or fungus")).toBeInTheDocument();
  });

  it("credits the fungal route once the mesh barrier is in place", () => {
    renderWithIntl(<IsotopeTracerAudit />);
    fireEvent.click(screen.getByRole("button", { name: /Hyphae-severing mesh/ }));
    expect(screen.getByText("It went through the fungus")).toBeInTheDocument();
    expect(screen.getByText("The fungal link")).toBeInTheDocument();
  });

  it("withholds every claim when the donor cannot be distinguished", () => {
    renderWithIntl(<IsotopeTracerAudit />);
    fireEvent.click(screen.getByRole("button", { name: /Two distinguishable labels/ }));
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(screen.getByText("Unknown donor")).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<IsotopeTracerAudit />, "vi");
    expect(screen.getByText("Có thứ gì đã di chuyển")).toBeInTheDocument();
  });
});

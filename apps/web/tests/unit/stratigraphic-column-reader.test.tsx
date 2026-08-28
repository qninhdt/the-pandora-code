import { StratigraphicColumnReader } from "@/components/content/stratigraphic-column-reader";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("StratigraphicColumnReader", () => {
  it("opens on the intrusion, which the geometry cannot rank against the fault", () => {
    renderWithIntl(<StratigraphicColumnReader />);
    expect(screen.getByText("Cross-cutting")).toBeInTheDocument();
    expect(screen.getByText(/The intrusion and the fault never intersect/)).toBeInTheDocument();
    // one feature — the fault — sits in the same tier and stays unrankable
    const unrankable = screen.getByText("Unrankable").closest("div")?.parentElement;
    expect(unrankable).toHaveTextContent("1");
  });

  it("gives an intrusion above both dated beds only a one-sided bound", () => {
    renderWithIntl(<StratigraphicColumnReader />);
    expect(screen.getByText("younger than 1.16 Gyr")).toBeInTheDocument();
    expect(screen.getByText(/One-sided bound/)).toBeInTheDocument();
  });

  it("brackets a bed between the two ash layers, and shows how wide that is", () => {
    renderWithIntl(<StratigraphicColumnReader />);
    fireEvent.click(screen.getByRole("button", { name: "Fossil-bearing bed" }));
    expect(screen.getByText("3.84 – 1.16 Gyr")).toBeInTheDocument();
    expect(screen.getByText("A bracket 2680 million years wide")).toBeInTheDocument();
    expect(screen.getByText("Superposition")).toBeInTheDocument();
  });

  it("narrows the bracket when the two dated beds are moved closer together", () => {
    renderWithIntl(<StratigraphicColumnReader />);
    fireEvent.click(screen.getByRole("button", { name: "Fossil-bearing bed" }));
    fireEvent.change(screen.getByRole("slider", { name: "Lower ash bed dated at" }), {
      target: { value: "1.6" },
    });
    expect(screen.getByText("1.64 – 1.16 Gyr")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<StratigraphicColumnReader />, "vi");
    expect(screen.getByRole("button", { name: "Mạch xâm nhập" })).toBeInTheDocument();
    expect(screen.getByText("Cắt xuyên")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Sai số phép đo" })).toBeInTheDocument();
  });
});

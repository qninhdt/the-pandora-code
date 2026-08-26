import { SolventWindowBench } from "@/components/content/solvent-window-bench";
import enBiochemistry from "@/messages/en/viz-biochemistry.json";
import viBiochemistry from "@/messages/vi/viz-biochemistry.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// The shared renderWithIntl helper is edited by many hands; this figure only
// needs its own namespace, so it mounts a provider over exactly that file.
function renderBench(locale: "en" | "vi" = "en") {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "en" ? enBiochemistry : viBiochemistry}
    >
      <SolventWindowBench />
    </NextIntlClientProvider>,
  );
}

describe("SolventWindowBench", () => {
  it("opens on water, liquid at a temperate surface", () => {
    renderBench();
    expect(screen.getByRole("radio", { name: "Water" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Liquid")).toBeInTheDocument();
    // Water's 273–373 K window; at 293 K only water and formamide still flow.
    expect(screen.getByText("100 K")).toBeInTheDocument();
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("reports methane frozen out of its own window at a temperate surface", () => {
    renderBench();
    fireEvent.click(screen.getByRole("radio", { name: "Methane" }));
    expect(screen.getByText("Boiled away")).toBeInTheDocument();
    expect(
      screen.getByText(/the question of whether a cell could be built in it does not arise/),
    ).toBeInTheDocument();
  });

  it("shows formamide beating water on both headline numbers", () => {
    renderBench();
    fireEvent.click(screen.getByRole("radio", { name: "Formamide" }));
    expect(screen.getByText("212 K")).toBeInTheDocument();
    expect(screen.getByText("109.0")).toBeInTheDocument();
    // Its folding gate is honestly ungraded rather than a quiet yes.
    expect(screen.getAllByText("Not shown").length).toBeGreaterThan(0);
  });

  it("drops every candidate out of liquid in the deep cold", () => {
    renderBench();
    fireEvent.change(screen.getByRole("slider", { name: "Surface temperature of the world" }), {
      target: { value: "85" },
    });
    expect(screen.getByText("0 / 4")).toBeInTheDocument();
    expect(screen.getByText("Frozen solid")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderBench("vi");
    expect(screen.getByRole("radio", { name: "Nước" })).toBeInTheDocument();
    expect(screen.getByText("Thể lỏng")).toBeInTheDocument();
    expect(screen.getByText("Làm protein cuộn gập")).toBeInTheDocument();
  });
});

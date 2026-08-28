import { NetworkOrMindDiagnostic } from "@/components/content/network-or-mind-diagnostic";
import enBiochemistry from "@/messages/en/viz-biochemistry.json";
import viBiochemistry from "@/messages/vi/viz-biochemistry.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

function renderDiagnostic(locale: "en" | "vi" = "en") {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "en" ? enBiochemistry : viBiochemistry}
    >
      <NetworkOrMindDiagnostic />
    </NextIntlClientProvider>,
  );
}

describe("NetworkOrMindDiagnostic", () => {
  it("opens on Eywa, clearing competence and stalling at integration", () => {
    renderDiagnostic();
    expect(screen.getByRole("radio", { name: "Eywa" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    expect(screen.getByText("An intelligent network")).toBeInTheDocument();
    // The last check is reported as unanswerable rather than failed.
    expect(screen.getAllByText("Unanswerable").length).toBeGreaterThan(0);
  });

  it("fails the cerebellum at the first architectural check", () => {
    renderDiagnostic();
    fireEvent.click(screen.getByRole("radio", { name: "Cerebellum" }));
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    expect(
      screen.getByText(/people missing a cerebellum are motorically impaired and fully conscious/),
    ).toBeInTheDocument();
  });

  it("runs the cortex through every check", () => {
    renderDiagnostic();
    fireEvent.click(screen.getByRole("radio", { name: "Cerebral cortex" }));
    expect(screen.getByText("4 / 4")).toBeInTheDocument();
    expect(screen.getByText("A mind")).toBeInTheDocument();
  });

  it("renders every specimen in both locales without a missing label", () => {
    for (const locale of ["en", "vi"] as const) {
      const names =
        locale === "en"
          ? ["Slime mould", "Bee swarm", "Cerebellum", "Cerebral cortex", "Eywa"]
          : ["Nấm nhầy", "Bầy ong", "Tiểu não", "Vỏ não", "Eywa"];
      const { unmount } = renderDiagnostic(locale);
      for (const name of names) {
        fireEvent.click(screen.getByRole("radio", { name }));
        expect(screen.getByRole("radio", { name })).toHaveAttribute("aria-checked", "true");
        // A missing translation would surface as the raw key path in the DOM.
        expect(screen.queryByText(/viz\.networkOrMind/)).not.toBeInTheDocument();
      }
      unmount();
    }
  });

  it("renders Vietnamese labels", () => {
    renderDiagnostic("vi");
    expect(screen.getByRole("radio", { name: "Tiểu não" })).toBeInTheDocument();
    expect(screen.getByText("Một mạng lưới thông minh")).toBeInTheDocument();
  });
});

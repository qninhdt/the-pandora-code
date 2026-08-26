import { PneumaticBoneBudget } from "@/components/content/pneumatic-bone-budget";
import enAnatomy from "@/messages/en/viz-anatomy.json";
import viAnatomy from "@/messages/vi/viz-anatomy.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// viz-anatomy is not in the shared renderWithIntl namespace list yet, so mount a
// provider over exactly this namespace.
function renderBudget(locale: "en" | "vi" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? enAnatomy : viAnatomy}>
      <PneumaticBoneBudget />
    </NextIntlClientProvider>,
  );
}

describe("PneumaticBoneBudget", () => {
  it("opens on a pterosaur-like hollow spar in carbon-threaded bone", () => {
    renderBudget();
    expect(screen.getByRole("radio", { name: "Carbon-threaded bone" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText(/This is the bargain a flyer wants/)).toBeInTheDocument();
    // 80% hollow leaves the outer radius five times the wall thickness.
    expect(screen.getByText("5.0 : 1")).toBeInTheDocument();
  });

  it("flags the crumple failure once the wall gets too thin", () => {
    renderBudget();
    fireEvent.change(screen.getByRole("slider", { name: "Hollow out the core" }), {
      target: { value: "0.96" },
    });
    expect(screen.getByText(/fails by crumpling locally/)).toBeInTheDocument();
  });

  it("reports a heavier spar when the material is ordinary mineral bone", () => {
    renderBudget();
    // Carbon-threaded bone saves ~73% of a solid mineral spar's mass; plain
    // mineral bone at the same hollowness saves only ~53%.
    expect(screen.getByText("73%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Earth mineral bone" }));
    expect(screen.getByText("53%")).toBeInTheDocument();
  });

  it("renders Vietnamese material controls", () => {
    renderBudget("vi");
    expect(screen.getByRole("radio", { name: "Xương đan sợi carbon" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Rỗng hóa phần lõi" })).toBeInTheDocument();
  });
});

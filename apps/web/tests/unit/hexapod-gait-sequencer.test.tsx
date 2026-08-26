import { HexapodGaitSequencer } from "@/components/content/hexapod-gait-sequencer";
import enAnatomy from "@/messages/en/viz-anatomy.json";
import viAnatomy from "@/messages/vi/viz-anatomy.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// viz-anatomy is not in the shared renderWithIntl namespace list yet, so mount a
// provider over exactly this namespace.
function renderSequencer(locale: "en" | "vi" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? enAnatomy : viAnatomy}>
      <HexapodGaitSequencer />
    </NextIntlClientProvider>,
  );
}

describe("HexapodGaitSequencer", () => {
  it("opens on a galloping stride that keeps a brace under the turns", () => {
    renderSequencer();
    expect(screen.getByRole("radio", { name: "Gallop" })).toHaveAttribute("aria-checked", "true");
    // Stride pairs near unison leave a real suspension; the middle pair lands in
    // the gap, so almost every unsupported instant still has a foot planted.
    expect(screen.getByText("16%")).toBeInTheDocument();
    expect(screen.getByText("86%")).toBeInTheDocument();
    expect(screen.getByText(/The stride pairs now leave the ground together/)).toBeInTheDocument();
  });

  it("warns when the middle pair is timed away from its bracing job", () => {
    renderSequencer();
    fireEvent.change(screen.getByRole("slider", { name: "Where the short middle pair lands" }), {
      target: { value: "0" },
    });
    expect(
      screen.getByText(/needs something planted to push sideways against/),
    ).toBeInTheDocument();
  });

  it("removes the airborne phase in a walk", () => {
    renderSequencer();
    fireEvent.click(screen.getByRole("radio", { name: "Walk" }));
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(
      screen.getByText(/One of the long stride pairs is always carrying weight/),
    ).toBeInTheDocument();
  });

  it("renders Vietnamese gait controls", () => {
    renderSequencer("vi");
    expect(screen.getByRole("radio", { name: "Phi nước đại" })).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Cặp chân giữa ngắn hạ xuống ở đâu" }),
    ).toBeInTheDocument();
  });
});

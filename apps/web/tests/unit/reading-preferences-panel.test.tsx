import { ReadingPreferences } from "@/components/reading/reading-preferences";
import {
  DEFAULT_READING_PREFERENCES,
  READER_PREFERENCE_LIMITS,
  getReadingPreferences,
  resetReadingPreferences,
  setReadingPreferences,
} from "@/lib/engagement/preferences-store";
import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("reading preferences panel", () => {
  beforeEach(() => {
    localStorage.clear();
    resetReadingPreferences();
    document.documentElement.removeAttribute("data-reader-font");
    document.documentElement.removeAttribute("data-reader-width");
  });

  it("switches the typeface and marks the active tile", () => {
    renderWithIntl(<ReadingPreferences />);
    const mono = screen.getByRole("button", { name: "Mono" });
    expect(mono).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(mono);

    expect(getReadingPreferences().fontFamily).toBe("mono");
    expect(screen.getByRole("button", { name: "Mono" })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.readerFont).toBe("mono");
  });

  it("steps text size and disables the stepper at its bounds", () => {
    const { step, max } = READER_PREFERENCE_LIMITS.fontScale;
    renderWithIntl(<ReadingPreferences />);

    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }));
    expect(getReadingPreferences().fontScale).toBeCloseTo(1 + step);
    expect(screen.getByText(`${Math.round((1 + step) * 100)}%`)).toBeInTheDocument();

    act(() => setReadingPreferences({ fontScale: max }));
    expect(screen.getByRole("button", { name: "Increase text size" })).toBeDisabled();
  });

  it("toggles full width and reflects it on the document root", () => {
    renderWithIntl(<ReadingPreferences />);
    const toggle = screen.getByRole("switch", { name: "Full width" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);

    expect(getReadingPreferences().fullWidth).toBe(true);
    expect(document.documentElement.dataset.readerWidth).toBe("full");
  });

  it("returns motion to the device setting when the toggle is switched off", () => {
    renderWithIntl(<ReadingPreferences />);
    const toggle = screen.getByRole("switch", { name: "Reduce motion" });

    fireEvent.click(toggle);
    expect(getReadingPreferences().reducedMotion).toBe("reduce");

    fireEvent.click(screen.getByRole("switch", { name: "Reduce motion" }));
    expect(getReadingPreferences().reducedMotion).toBe("system");
  });

  it("resets every control to its default", () => {
    setReadingPreferences({ fontFamily: "mono", fontScale: 1.3, fullWidth: true });
    renderWithIntl(<ReadingPreferences />);

    fireEvent.click(screen.getByRole("button", { name: "Reset to default" }));

    expect(getReadingPreferences()).toEqual(DEFAULT_READING_PREFERENCES);
  });

  it("renders Vietnamese labels on the vi locale", () => {
    renderWithIntl(<ReadingPreferences />, "vi");
    expect(screen.getByText("Cỡ chữ")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Toàn chiều rộng" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đơn cách" })).toBeInTheDocument();
  });
});

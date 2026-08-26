import LocaleTemplate from "@/app/[locale]/template";
import { QuorumCascade } from "@/components/content/quorum-cascade";
import { resetReadingPreferences, setReadingPreferences } from "@/lib/engagement/preferences-store";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("reduced-motion contract", () => {
  beforeEach(() => {
    localStorage.clear();
    resetReadingPreferences();
  });

  afterEach(() => {
    cleanup();
    resetReadingPreferences();
  });

  it("keeps chapter visualizer controls available when reader motion is reduced", () => {
    setReadingPreferences({ reducedMotion: "reduce" });
    renderWithIntl(<QuorumCascade />);

    expect(
      screen.getByRole("slider", { name: "Scrub through the cascade tick by tick" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Step one tick" })).toBeInTheDocument();
  });

  it("keeps a stacking context around fixed page backgrounds", () => {
    setReadingPreferences({ reducedMotion: "reduce" });
    const { container } = render(
      <LocaleTemplate>
        <main data-testid="page-content">Page content</main>
      </LocaleTemplate>,
    );

    expect(container.firstElementChild).toHaveClass("relative", "isolate");
  });
});

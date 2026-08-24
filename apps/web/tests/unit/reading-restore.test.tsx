import {
  ContinueReadingPrompt,
  restoreRatioWithCorrection,
} from "@/components/reading/continue-reading-prompt";
import { ReadingProgress, calculateReadingProgress } from "@/components/reading/reading-progress";
import {
  clearReadingHistory,
  getReadingLocation,
  saveReadingLocation,
} from "@/lib/engagement/reading-store";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("reading restore", () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    clearReadingHistory();
    vi.stubGlobal("ResizeObserver", undefined);
    Object.defineProperty(window, "scrollTo", { value: scrollTo, writable: true });
    scrollTo.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not scroll until the reader explicitly clicks continue", async () => {
    saveReadingLocation({
      locale: "en",
      slug: "one",
      progress: 0.4,
    });
    const { container } = render(
      <>
        <main>
          <article data-reading-root style={{ height: "2000px" }} />
        </main>
        <ContinueReadingPrompt locale="en" slug="one" />
      </>,
    );

    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Continue reading" }));
    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
    expect(container.querySelector("[data-reading-root]")).toBeTruthy();
  });

  it("restores a bounded article-relative ratio", () => {
    const root = document.createElement("article");
    Object.defineProperty(root, "scrollHeight", { configurable: true, value: 1800 });
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 1900,
      height: 1800,
      width: 800,
      left: 0,
      right: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    document.body.append(root);

    void restoreRatioWithCorrection(root, 2);
    expect(scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "auto",
    });
  });

  it("restores an exact saved document offset when one is available", async () => {
    const root = document.createElement("article");
    root.dataset.readingRoot = "true";
    document.body.append(root);
    saveReadingLocation({ locale: "en", slug: "offset", progress: 0.4, scrollY: 1440 });

    render(<ContinueReadingPrompt locale="en" slug="offset" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue reading" }));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 1440, behavior: "auto" }));
    expect(root).toBeTruthy();
  });

  it("does not overwrite a saved location during the initial measurement", () => {
    const article = document.createElement("article");
    document.body.append(article);
    Object.defineProperty(article, "scrollHeight", { configurable: true, value: 2400 });
    vi.spyOn(article, "getBoundingClientRect").mockReturnValue({
      top: 600,
      bottom: 3000,
      height: 2400,
      width: 800,
      left: 0,
      right: 800,
      x: 0,
      y: 600,
      toJSON: () => ({}),
    });
    article.dataset.readingRoot = "true";
    saveReadingLocation({ locale: "en", slug: "preserve", progress: 0.55, scrollY: 1200 });

    render(<ReadingProgress locale="en" slug="preserve" />);

    expect(getReadingLocation("en", "preserve")).toMatchObject({
      progress: 0.55,
      scrollY: 1200,
    });
  });

  it("measures progress from the article's document position", () => {
    expect(
      calculateReadingProgress({
        scrollY: 600,
        articleTop: 600,
        articleHeight: 2400,
        viewportHeight: 800,
      }),
    ).toBe(0);
    expect(
      calculateReadingProgress({
        scrollY: 1400,
        articleTop: 600,
        articleHeight: 2400,
        viewportHeight: 800,
      }),
    ).toBeCloseTo(0.5);
  });

  it("does not offer completed chapters as continue items", () => {
    saveReadingLocation({ locale: "en", slug: "done", progress: 0.99, completed: true });
    render(<ContinueReadingPrompt locale="en" slug="done" />);
    expect(screen.queryByRole("button", { name: "Continue reading" })).toBeNull();
  });
});

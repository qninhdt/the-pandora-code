import { MobileReaderDock } from "@/components/reading/mobile-reader-dock";
import type { ChapterAudio } from "@/lib/content/loader/audio-loader";
import { getAudioState, loadAudio, resetAudioState } from "@/lib/engagement/audio-store";
import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

const headings = [{ id: "first", text: "First", depth: 2 as const }];
const track: ChapterAudio = {
  audioUrl: "/audio/chapters/sample/en/sample.en.mp3",
  duration: 32,
  sections: [{ sectionId: "sec-00", title: null, start: 0, end: 32 }],
};

describe("mobile reader dock", () => {
  beforeEach(() => {
    localStorage.clear();
    resetAudioState();
  });

  it("groups outline and text controls without reserving an empty audio action", () => {
    renderWithIntl(
      <MobileReaderDock headings={headings} active={null} label="Table of contents" />,
    );

    const outline = screen.getByRole("button", { name: "Table of contents" });
    const settings = screen.getByRole("button", { name: "Reading style" });
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
    expect(outline.parentElement).toBe(settings.parentElement?.parentElement);

    fireEvent.click(outline);
    expect(screen.getByRole("dialog")).toHaveClass("z-[60]");
  });

  it("adds play to the same dock when the chapter has audio", () => {
    act(() => loadAudio("sample", "en", track));
    renderWithIntl(
      <MobileReaderDock headings={headings} active={null} label="Table of contents" />,
    );

    const outline = screen.getByRole("button", { name: "Table of contents" });
    const play = screen.getByRole("button", { name: "Play" });
    expect(outline.parentElement).toBe(play.parentElement);

    fireEvent.click(play);
    expect(getAudioState()).toMatchObject({ isOpen: true, isPlaying: true });
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });
});

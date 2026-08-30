import { AudioPlayer } from "@/components/reading/audio-player";
import type { ChapterAudio } from "@/lib/content/loader/audio-loader";
import {
  getAudioState,
  loadAudio,
  openAudio,
  resetAudioState,
  seekAudio,
} from "@/lib/engagement/audio-store";
import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "./render-with-intl";

const track: ChapterAudio = {
  audioUrl: "/audio/chapters/sample/en/sample.en.mp3",
  duration: 32,
  sections: [{ sectionId: "sec-00", title: null, start: 0, end: 32 }],
};

function setMediaDuration(element: HTMLAudioElement, duration: number) {
  Object.defineProperty(element, "duration", { configurable: true, value: duration });
}

describe("AudioPlayer", () => {
  beforeEach(() => {
    localStorage.clear();
    resetAudioState();
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it("restores the exact playback position after closing and reopening", () => {
    act(() => {
      loadAudio("sample", "en", track);
      seekAudio(12);
      openAudio(false);
    });
    renderWithIntl(<AudioPlayer />);

    const firstAudio = document.querySelector("audio");
    expect(firstAudio).not.toBeNull();
    if (!firstAudio) return;
    setMediaDuration(firstAudio, 32);
    fireEvent(firstAudio, new Event("loadedmetadata"));
    expect(firstAudio.currentTime).toBe(12);

    firstAudio.currentTime = 14.5;
    fireEvent.click(screen.getByRole("button", { name: "Close player" }));
    expect(getAudioState()).toMatchObject({ currentTime: 14.5, isOpen: false });
    expect(document.querySelector("audio")).toBeNull();

    act(() => openAudio(false));
    const reopenedAudio = document.querySelector("audio");
    expect(reopenedAudio).not.toBeNull();
    if (!reopenedAudio) return;
    setMediaDuration(reopenedAudio, 32);
    fireEvent(reopenedAudio, new Event("loadedmetadata"));

    expect(reopenedAudio.currentTime).toBe(14.5);
  });
});

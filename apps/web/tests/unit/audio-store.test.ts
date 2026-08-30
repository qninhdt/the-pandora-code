import type { ChapterAudio } from "@/lib/content/loader/audio-loader";
import {
  clearAudio,
  closeAudio,
  getAudioState,
  goToSection,
  load,
  openAudio,
  pause,
  play,
  resetAudioState,
  sectionIndexAt,
  seek,
  setAudioFollowReading,
  setPlaybackRate,
  setVolume,
  skipSection,
  useAudioState,
} from "@/lib/engagement/audio-store";
import { READER_STORAGE_KEYS } from "@/lib/engagement/storage";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

const track: ChapterAudio = {
  audioUrl: "/audio/chapters/sample/en/sample.en.mp3",
  duration: 32,
  sections: [
    { sectionId: "sec-00", title: null, start: 0, end: 12 },
    { sectionId: "sec-01", title: "A chapter section", start: 12, end: 32 },
  ],
};

describe("audio store", () => {
  beforeEach(() => {
    resetAudioState();
    localStorage.clear();
  });

  it("loads one track and clamps playback actions to its duration", () => {
    load("sample", "en", track);
    expect(getAudioState()).toMatchObject({
      chapterSlug: "sample",
      chapterLocale: "en",
      audioUrl: track.audioUrl,
      duration: 32,
      currentTime: 0,
      isPlaying: false,
      isOpen: false,
    });

    play();
    expect(getAudioState()).toMatchObject({ isPlaying: true, isOpen: true });
    seek(99);
    expect(getAudioState().currentTime).toBe(32);
    setPlaybackRate(1.25);
    setVolume(-1);
    expect(getAudioState()).toMatchObject({ playbackRate: 1.25, volume: 0 });
    pause();
    expect(getAudioState().isPlaying).toBe(false);
  });

  it("seeks between section markers instead of swapping files", () => {
    load("sample", "en", track);
    goToSection(1);
    expect(getAudioState().currentTime).toBe(12);
    skipSection(-1);
    expect(getAudioState().currentTime).toBe(0);
    skipSection(5);
    expect(getAudioState().currentTime).toBe(12);
    expect(sectionIndexAt(track.sections, 11.9)).toBe(0);
    expect(sectionIndexAt(track.sections, 12)).toBe(1);
    expect(sectionIndexAt([], 4)).toBe(-1);
  });

  it("stays hidden until opened and clears on navigation away", () => {
    load("sample", "en", track);
    expect(getAudioState().isOpen).toBe(false);
    openAudio();
    expect(getAudioState()).toMatchObject({ isOpen: true, isPlaying: true });
    closeAudio();
    expect(getAudioState()).toMatchObject({ isOpen: false, isPlaying: false });

    openAudio();
    clearAudio();
    expect(getAudioState()).toMatchObject({
      chapterSlug: null,
      audioUrl: null,
      isOpen: false,
      isPlaying: false,
      sections: [],
    });
  });

  it("ignores play and open for a chapter without audio", () => {
    load("sample", "en", null);
    play();
    openAudio();
    expect(getAudioState()).toMatchObject({ isPlaying: false, isOpen: false, audioUrl: null });
  });

  it("persists resume position without persisting playback or visibility intent", () => {
    load("sample", "vi", track);
    openAudio();
    seek(4.5);
    setPlaybackRate(1.5);
    setVolume(0.4);

    const envelope = JSON.parse(localStorage.getItem(READER_STORAGE_KEYS.audio) ?? "null") as {
      data: Record<string, unknown>;
    };
    expect(envelope.data).toMatchObject({
      chapterSlug: "sample",
      chapterLocale: "vi",
      currentTime: 4.5,
      playbackRate: 1.5,
      volume: 0.4,
    });
    expect(envelope.data).not.toHaveProperty("isPlaying");
    expect(envelope.data).not.toHaveProperty("isOpen");
    expect(envelope.data).not.toHaveProperty("sections");
  });

  it("keeps runtime intent when the same-tab storage bridge rereads persisted data", () => {
    const { result, unmount } = renderHook(() => useAudioState());
    act(() => load("sample", "en", track));
    act(() => play());
    act(() => setAudioFollowReading(true));

    expect(result.current).toMatchObject({ isPlaying: true, followReading: true });
    unmount();
  });
});

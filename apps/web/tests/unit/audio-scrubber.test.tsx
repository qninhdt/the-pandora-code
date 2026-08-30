import { AudioScrubber } from "@/components/reading/audio-scrubber";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const sections = [{ sectionId: "sec-00", title: null, start: 0, end: 100 }];

function dispatchPointer(target: Element, type: string, clientX: number) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperties(event, {
    clientX: { value: clientX },
    pointerId: { value: 1 },
  });
  fireEvent(target, event);
}

function renderScrubber(onSeek: (time: number) => void) {
  render(
    <AudioScrubber
      duration={100}
      currentTime={10}
      sections={sections}
      activeIndex={0}
      onSeek={onSeek}
      ariaLabel="Current time"
      valueText="00:10 / 01:40"
    />,
  );
  const slider = screen.getByRole("slider");
  vi.spyOn(slider, "getBoundingClientRect").mockReturnValue({
    left: 100,
    width: 200,
    right: 300,
    top: 0,
    bottom: 24,
    height: 24,
    x: 100,
    y: 0,
    toJSON: () => ({}),
  });
  Object.defineProperties(slider, {
    setPointerCapture: { value: vi.fn() },
    hasPointerCapture: { value: vi.fn(() => true) },
  });
  return slider;
}

describe("AudioScrubber", () => {
  it("previews a drag locally and seeks once when the pointer is released", () => {
    const onSeek = vi.fn();
    const slider = renderScrubber(onSeek);

    dispatchPointer(slider, "pointerdown", 120);
    dispatchPointer(slider, "pointermove", 180);
    dispatchPointer(slider, "pointermove", 220);

    expect(onSeek).not.toHaveBeenCalled();
    expect(slider).toHaveAttribute("aria-valuenow", "60");

    dispatchPointer(slider, "pointerup", 220);

    expect(onSeek).toHaveBeenCalledOnce();
    expect(onSeek).toHaveBeenCalledWith(60);
  });

  it("does not seek when a drag is cancelled", () => {
    const onSeek = vi.fn();
    const slider = renderScrubber(onSeek);

    dispatchPointer(slider, "pointerdown", 120);
    dispatchPointer(slider, "pointercancel", 120);

    expect(onSeek).not.toHaveBeenCalled();
  });
});

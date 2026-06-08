import { TwentySecondsTimeline } from "@/components/content/twenty-seconds-timeline";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("TwentySecondsTimeline", () => {
  it("shows the histotoxic-hypoxia stage at the default time", () => {
    render(<TwentySecondsTimeline locale="en" />);
    expect(screen.getByText("Histotoxic hypoxia")).toBeInTheDocument();
  });

  it("advances to collapse and unconscious as the timeline is scrubbed", () => {
    render(<TwentySecondsTimeline locale="en" />);
    const timeline = screen.getByLabelText("Timeline (seconds)");
    fireEvent.change(timeline, { target: { value: "14" } });
    expect(screen.getByText("Collapse")).toBeInTheDocument();
    fireEvent.change(timeline, { target: { value: "20" } });
    expect(screen.getByText("Unconscious")).toBeInTheDocument();
  });

  it("starts at mask-off when reset", () => {
    render(<TwentySecondsTimeline locale="vi" />);
    const reset = screen.getByLabelText("Đặt lại");
    fireEvent.click(reset);
    expect(screen.getByText("Tháo mặt nạ")).toBeInTheDocument();
  });
});

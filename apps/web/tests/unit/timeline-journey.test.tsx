import { type JourneyEvent, TimelineJourney } from "@/components/content/timeline-journey";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const events: JourneyEvent[] = [
  {
    id: "part-origins",
    date: "Part 1",
    title: "Origins",
    description: "Where Pandora begins.",
    kind: "canon",
  },
  {
    id: "ch-where-is-pandora",
    date: "1.1",
    title: "Where is Pandora",
    description: "Locating the moon.",
    kind: "inference",
  },
  {
    id: "ch-time-on-pandora",
    date: "1.2",
    title: "Time on Pandora",
    kind: "inference",
  },
];

describe("TimelineJourney", () => {
  it("renders every part marker and chapter event", () => {
    render(<TimelineJourney events={events} locale="en" />);

    expect(screen.getByText("Origins")).toBeInTheDocument();
    expect(screen.getByText("Where is Pandora")).toBeInTheDocument();
    expect(screen.getByText("Time on Pandora")).toBeInTheDocument();
    expect(screen.getByText("Part 1")).toBeInTheDocument();
    expect(screen.getByText("1.1")).toBeInTheDocument();
  });

  it("renders the four-tier key", () => {
    render(<TimelineJourney events={events} locale="en" />);
    for (const label of ["Canon", "Inference", "Speculation", "Real science"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders localized tier labels in Vietnamese", () => {
    render(<TimelineJourney events={events} locale="vi" />);
    expect(screen.getByText("Chính truyện")).toBeInTheDocument();
    expect(screen.getByText("Suy luận")).toBeInTheDocument();
  });
});

import { LatencyHorizon } from "@/components/content/latency-horizon";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("LatencyHorizon", () => {
  it("shows the moon fragmented into many latency regions within a single day", () => {
    renderWithIntl(<LatencyHorizon />);
    expect(screen.getByText(/regions that cannot reach each other/)).toBeInTheDocument();
  });

  it("brings the whole moon into one horizon when a season is allowed", () => {
    renderWithIntl(<LatencyHorizon />);
    fireEvent.click(screen.getByRole("radio", { name: "A season" }));
    expect(screen.getByText("The whole moon")).toBeInTheDocument();
  });

  it("stretches the crossing time as the cable slows down", () => {
    renderWithIntl(<LatencyHorizon />);
    expect(screen.getByText("2.1 days")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Conduction speed of the cable"), {
      target: { value: "1" },
    });
    expect(screen.getByText("208.1 days")).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<LatencyHorizon />, "vi");
    expect(screen.getByLabelText("Tốc độ dẫn truyền của sợi cáp")).toBeInTheDocument();
  });
});

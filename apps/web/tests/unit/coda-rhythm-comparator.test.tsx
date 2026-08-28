import { CodaRhythmComparator } from "@/components/content/coda-rhythm-comparator";
import { VOICE_ROWS, tightestGap } from "@/components/content/coda-rhythm-comparator-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("coda rhythm rows", () => {
  it("packs the condensed clan tighter than the evenly spaced one", () => {
    const even = VOICE_ROWS.find((r) => r.id === "regular");
    const condensed = VOICE_ROWS.find((r) => r.id === "short");
    expect(tightestGap(condensed as never)).toBeLessThan(tightestGap(even as never) as number);
  });

  it("gives the tulkun row no measurable rhythm at all", () => {
    const tulkun = VOICE_ROWS.find((r) => r.id === "tulkun");
    expect(tulkun?.onsets).toHaveLength(0);
    expect(tightestGap(tulkun as never)).toBeNull();
  });
});

describe("CodaRhythmComparator", () => {
  it("opens on the two-then-three clan with its rhythm read out", () => {
    renderWithIntl(<CodaRhythmComparator />);
    expect(
      screen.getByRole("radio", { name: "Two-then-three", checked: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Two, then three")).toBeInTheDocument();
    expect(screen.getByText("Coastal shelves and atolls")).toBeInTheDocument();
  });

  it("reports no measurable rhythm for the tulkun call", () => {
    renderWithIntl(<CodaRhythmComparator />);
    fireEvent.click(screen.getByRole("radio", { name: "Tulkun" }));
    expect(screen.getByText("Not measurable")).toBeInTheDocument();
    expect(screen.getByText(/never exposes a structure/)).toBeInTheDocument();
  });

  it("explains the sympatric boundary once every repertoire is shown at once", () => {
    renderWithIntl(<CodaRhythmComparator />);
    fireEvent.click(screen.getByRole("button", { name: "Show all at once" }));
    expect(
      screen.getByText(/same water at the same time and share maternal lineages/),
    ).toBeInTheDocument();
  });

  it("renders the Vietnamese controls and readouts", () => {
    renderWithIntl(<CodaRhythmComparator />, "vi");
    expect(screen.getByRole("button", { name: "Hiện tất cả cùng lúc" })).toBeInTheDocument();
    expect(screen.getByText("Hai, rồi ba")).toBeInTheDocument();
  });
});

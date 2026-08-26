import { WarningSignalRace } from "@/components/content/warning-signal-race";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("WarningSignalRace", () => {
  it("lets the fungal alarm win across the metre of the pot experiment", () => {
    renderWithIntl(<WarningSignalRace />);
    expect(screen.getByText("Warned in time")).toBeInTheDocument();
  });

  it("loses the race once the neighbour is a forest gap away", () => {
    renderWithIntl(<WarningSignalRace />);
    fireEvent.change(screen.getByLabelText("Distance between the two plants"), {
      target: { value: "2" },
    });
    expect(screen.getByText("Too late")).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<WarningSignalRace />, "vi");
    expect(screen.getByLabelText("Khoảng cách giữa hai cây")).toBeInTheDocument();
    expect(screen.getByText("Kịp báo động")).toBeInTheDocument();
  });
});

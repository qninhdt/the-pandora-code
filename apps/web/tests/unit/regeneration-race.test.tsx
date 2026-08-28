import { RegenerationRace } from "@/components/content/regeneration-race";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("RegenerationRace", () => {
  it("holds the network together when reseeding outpaces the burning", () => {
    renderWithIntl(<RegenerationRace />);
    expect(screen.getByText("Scarred but whole")).toBeInTheDocument();
  });

  it("shatters the network once burning outruns reseeding", () => {
    renderWithIntl(<RegenerationRace />);
    fireEvent.change(screen.getByLabelText("Network burned each year"), {
      target: { value: "5" },
    });
    expect(screen.getByText("Network shattered")).toBeInTheDocument();
  });

  it("raises the critical density for an even mesh", () => {
    renderWithIntl(<RegenerationRace />);
    fireEvent.click(screen.getByRole("radio", { name: "Even mesh" }));
    expect(screen.getByText("critical density 59%")).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<RegenerationRace />, "vi");
    expect(screen.getByLabelText("Phần mạng lưới bị đốt mỗi năm")).toBeInTheDocument();
  });
});

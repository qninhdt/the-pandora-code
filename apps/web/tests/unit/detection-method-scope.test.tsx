import { DetectionMethodScope } from "@/components/content/detection-method-scope";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("DetectionMethodScope", () => {
  it("renders three method tabs", () => {
    render(<DetectionMethodScope locale="en" />);
    expect(screen.getByRole("tab", { name: "Radial velocity" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Transit" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Direct imaging" })).toBeInTheDocument();
  });

  it("shows the radial-velocity description by default and switches on tab click", () => {
    render(<DetectionMethodScope locale="en" />);
    expect(screen.getByRole("tab", { name: "Radial velocity" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Transit" }));
    expect(screen.getByRole("tab", { name: "Transit" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders localized tab labels in Vietnamese", () => {
    render(<DetectionMethodScope locale="vi" />);
    expect(screen.getByRole("tab", { name: "Vận tốc xuyên tâm" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Chụp ảnh trực tiếp" })).toBeInTheDocument();
  });
});

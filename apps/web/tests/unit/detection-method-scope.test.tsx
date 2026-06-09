import { DetectionMethodScope } from "@/components/content/detection-method-scope";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("DetectionMethodScope", () => {
  it("renders three method options", () => {
    renderWithIntl(<DetectionMethodScope />);
    expect(screen.getByRole("radio", { name: "Radial velocity" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Transit" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Direct imaging" })).toBeInTheDocument();
  });

  it("shows the radial-velocity view by default and switches on selection", () => {
    renderWithIntl(<DetectionMethodScope />);
    expect(screen.getByRole("radio", { name: "Radial velocity" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(screen.getByRole("radio", { name: "Transit" }));
    expect(screen.getByRole("radio", { name: "Transit" })).toHaveAttribute("aria-checked", "true");
  });

  it("renders localized option labels in Vietnamese", () => {
    renderWithIntl(<DetectionMethodScope />, "vi");
    expect(screen.getByRole("radio", { name: "Vận tốc xuyên tâm" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Chụp ảnh trực tiếp" })).toBeInTheDocument();
  });
});

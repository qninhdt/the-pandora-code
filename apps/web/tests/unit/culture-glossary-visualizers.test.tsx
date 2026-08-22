import AnimalCulture from "@/components/glossary/interactive/animal-culture";
import NetworkBasedDiffusionAnalysis from "@/components/glossary/interactive/network-based-diffusion-analysis";
import SocialLearning from "@/components/glossary/interactive/social-learning";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("culture glossary visualizers", () => {
  it("renders all three English concepts", () => {
    renderWithIntl(
      <>
        <AnimalCulture />
        <SocialLearning />
        <NetworkBasedDiffusionAnalysis />
      </>,
    );
    expect(screen.getByRole("img", { name: "Animal culture" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Social learning" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Network-based diffusion analysis" }),
    ).toBeInTheDocument();
  });

  it("uses the Vietnamese message catalog", () => {
    renderWithIntl(<AnimalCulture />, "vi");
    expect(screen.getByRole("img", { name: "Văn hóa ở động vật" })).toBeInTheDocument();
  });
});

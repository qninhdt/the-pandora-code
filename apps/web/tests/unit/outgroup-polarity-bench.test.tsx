import { OutgroupPolarityBench } from "@/components/content/outgroup-polarity-bench";
import enAnatomy from "@/messages/en/viz-anatomy.json";
import viAnatomy from "@/messages/vi/viz-anatomy.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// The shared renderWithIntl helper hard-codes its namespace list and cannot see
// viz-anatomy until it is registered centrally, so this figure mounts a provider
// over exactly its own namespace.
function renderBench(locale: "en" | "vi" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? enAnatomy : viAnatomy}>
      <OutgroupPolarityBench />
    </NextIntlClientProvider>,
  );
}

describe("OutgroupPolarityBench", () => {
  it("recovers the family crest from a baseline that branched off first", () => {
    renderBench();
    expect(screen.getByRole("radio", { name: "Early marine form" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByText("Recovered")).toBeInTheDocument();
    // Carbon-threaded bone and the neural queue each bind the other five
    // specimens on the bench — the two synapomorphies the chapter calls the crest.
    expect(screen.getAllByText("Binds 5 specimens into a branch")).toHaveLength(2);
    expect(screen.getByText(/gathers into one branch/)).toBeInTheDocument();
  });

  it("loses the crest when a member of the family is nominated instead", () => {
    renderBench();
    fireEvent.click(screen.getByRole("radio", { name: "Na'vi" }));
    expect(screen.getByText("Lost")).toBeInTheDocument();
    // With the Na'vi as the baseline, bone and queue read as ancestral, so each
    // is left stranded on the one specimen that lacks them.
    expect(screen.getAllByText("Stranded on one specimen — groups nobody")).toHaveLength(2);
    expect(screen.getByText(/the tree comes out confident and backwards/)).toBeInTheDocument();
  });

  it("renders Vietnamese controls and verdict", () => {
    renderBench("vi");
    expect(screen.getByRole("radio", { name: "Sinh vật biển sơ khai" })).toBeInTheDocument();
    expect(screen.getByText("Còn nguyên")).toBeInTheDocument();
  });
});

import { ElderMemoryLedger } from "@/components/content/elder-memory-ledger";
import { podLedger, witnessChance } from "@/components/content/elder-memory-ledger-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("elder memory ledger model", () => {
  it("costs the pod far more experience than bodies when elders go", () => {
    const ledger = podLedger(3, 150);
    expect(ledger.experienceLoss).toBeGreaterThan(ledger.bodyLoss * 2);
  });

  it("loses nothing while the pod is whole", () => {
    const ledger = podLedger(0, 150);
    expect(ledger.bodyLoss).toBe(0);
    expect(ledger.experienceLoss).toBe(0);
    expect(ledger.regime).toBe("intact");
  });

  it("buffers elder loss when lean years are common and not when they are rare", () => {
    expect(podLedger(5, 20).regime).toBe("buffered");
    expect(podLedger(5, 300).regime).toBe("asymmetric");
  });

  it("gives an older animal a better chance of having crossed a lean year", () => {
    expect(witnessChance(231, 150)).toBeGreaterThan(witnessChance(12, 150));
  });
});

describe("ElderMemoryLedger", () => {
  it("opens on a loss a census would understate", () => {
    renderWithIntl(<ElderMemoryLedger />);
    expect(screen.getByText("What no census records")).toBeInTheDocument();
    expect(screen.getByText(/experience piles up at the old end/)).toBeInTheDocument();
  });

  it("shows nothing lost while every member is alive", () => {
    renderWithIntl(<ElderMemoryLedger />);
    fireEvent.change(screen.getByLabelText("Oldest members taken"), { target: { value: "0" } });
    expect(screen.getByText(/safe only while they are/)).toBeInTheDocument();
  });

  it("buffers the loss once lean years become common", () => {
    renderWithIntl(<ElderMemoryLedger />);
    fireEvent.change(screen.getByLabelText("How rare a lean year is"), { target: { value: "20" } });
    expect(screen.getByText(/younger adults have crossed one too/)).toBeInTheDocument();
  });

  it("renders the Vietnamese controls and readouts", () => {
    renderWithIntl(<ElderMemoryLedger />, "vi");
    expect(screen.getByLabelText("Số cá thể già nhất bị lấy đi")).toBeInTheDocument();
    expect(screen.getByText("Điều không cuộc kiểm đếm nào ghi lại")).toBeInTheDocument();
  });
});

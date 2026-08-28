"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { RotateCcw, StepForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { InfectionBarrierChain } from "./infection-barrier-gauntlet-chain";
import { HarmRoutes, LockList } from "./infection-barrier-gauntlet-locks";
import {
  HARM_ROUTES,
  LOCK_ORDER,
  LOCK_STATES,
  type Pairing,
  locksCleared,
} from "./infection-barrier-gauntlet-model";

// "Aliens would wipe us out" and "aliens could never infect us" both skip the
// mechanism, so this figure makes the reader do the mechanism by hand. Pick a
// pairing, then try one lock at a time and watch where the chain actually ends.
// Inside one biosphere the visitor gets a long way; across two independently
// evolved ones it stops at the first molecular recognition step and never
// recovers; on a tank-grown avatar body every lock past exposure turns out to be
// a missing measurement rather than an answer. The panel underneath is the twist:
// every route to *harm* stays open regardless, because none of them require the
// organism to reproduce inside a host.
// Lock states and harm routes live in infection-barrier-gauntlet-model.ts.

const PAIRING_TONE: Record<Pairing, string> = {
  sameBiosphere: "var(--teal)",
  crossBiosphere: "var(--magenta)",
  avatarChimera: "var(--cyan)",
};

const FIG_TONE: Record<Pairing, "teal" | "magenta" | "cyan"> = {
  sameBiosphere: "teal",
  crossBiosphere: "magenta",
  avatarChimera: "cyan",
};

interface InfectionBarrierGauntletProps {
  caption?: string;
  className?: string;
}

export function InfectionBarrierGauntlet({ caption, className }: InfectionBarrierGauntletProps) {
  const t = useTranslations("viz.infectionBarrierGauntlet");
  const [pairing, setPairing] = useState<Pairing>("sameBiosphere");
  // Locks the reader has attempted so far, the blocked one included.
  const [attempted, setAttempted] = useState(0);

  const passable = locksCleared(pairing);
  // One attempt past the passable run reveals the door that ends the chain.
  const maxAttempts = passable < LOCK_ORDER.length ? passable + 1 : LOCK_ORDER.length;
  const cleared = Math.min(attempted, passable);
  const stopIndex = attempted > passable && passable < LOCK_ORDER.length ? passable : null;
  const complete = cleared === LOCK_ORDER.length;

  const advance = useCallback(() => {
    setAttempted((n) => Math.min(n + 1, maxAttempts));
  }, [maxAttempts]);

  const switchPairing = useCallback((p: Pairing) => {
    setPairing(p);
    setAttempted(0);
  }, []);

  const states = LOCK_STATES[pairing];
  const tone = PAIRING_TONE[pairing];

  const hint = complete
    ? t(`outcome.${pairing}`)
    : stopIndex !== null
      ? t(`blocked.${LOCK_ORDER[stopIndex]}`)
      : attempted === 0
        ? t("verdict.start")
        : t("verdict.walking", { n: cleared });

  const rows = LOCK_ORDER.map((id, i) => {
    const opened = i < cleared;
    const stopped = stopIndex === i;
    return {
      id,
      name: t(`lock.${id}.name`),
      detail: t(`lock.${id}.detail`),
      state: states[id],
      opened,
      stopped,
      stateLabel: opened
        ? t(`state.${states[id]}`)
        : stopped
          ? t("state.blocked")
          : t("state.untried"),
    };
  });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={hint}
      caption={caption}
      tone={FIG_TONE[pairing]}
      className={className}
    >
      {/* Full width rather than in the header: three pairing names do not fit
          alongside the title at phone width. */}
      <SegmentedToggle<Pairing>
        ariaLabel={t("pairingLabel")}
        value={pairing}
        onChange={switchPairing}
        options={[
          {
            value: "sameBiosphere",
            label: t("pairing.sameBiosphere"),
            tone: PAIRING_TONE.sameBiosphere,
          },
          {
            value: "crossBiosphere",
            label: t("pairing.crossBiosphere"),
            tone: PAIRING_TONE.crossBiosphere,
          },
          {
            value: "avatarChimera",
            label: t("pairing.avatarChimera"),
            tone: PAIRING_TONE.avatarChimera,
          },
        ]}
        className="mb-4 w-full"
      />

      <InfectionBarrierChain
        pairing={pairing}
        cleared={cleared}
        stoppedAt={stopIndex}
        ariaLabel={t("aria", { cleared, total: LOCK_ORDER.length })}
        shortLabels={LOCK_ORDER.map((id) => t(`lock.${id}.short`))}
        startLabel={t("chainStart")}
        endLabel={t("chainEnd")}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={advance}
          disabled={complete || stopIndex !== null}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-void/40 px-3 py-2 font-sans text-xs font-600 text-foreground transition-all hover:border-teal/60 hover:bg-void/70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <StepForward size={13} /> {t("tryNext")}
        </button>
        <button
          type="button"
          onClick={() => setAttempted(0)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-sans text-xs font-600 text-subtle transition-all hover:text-foreground active:scale-95"
        >
          <RotateCcw size={13} /> {t("reset")}
        </button>
        <VizReadout
          label={t("readout.cleared")}
          value={`${cleared} / ${LOCK_ORDER.length}`}
          tone={tone}
          tinted
          className="ml-auto min-w-36"
        />
      </div>

      <LockList rows={rows} />

      <HarmRoutes
        title={t("harmTitle")}
        lead={t("harmLead")}
        routes={HARM_ROUTES[pairing].map((h) => t(`harm.${h}`))}
      />
    </VizFigure>
  );
}

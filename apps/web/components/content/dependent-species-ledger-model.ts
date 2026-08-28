// The accounting behind DependentSpeciesLedger, kept separate so the component
// file stays lean. The question the figure answers is the one an ecologist at the
// stump cannot answer on the day: when one enormous tree falls, how many of the
// species that lived on it are already lost, and how long before the losses show
// up in a census?
//
// Two published shapes drive the arithmetic.
//
// KOH'S CO-EXTINCTION CURVES. Koh et al. (2004) found the shape of an affiliate's
// response depends entirely on how fussy it is. A monophagous obligate — one host,
// no alternative — is lost in strict 1:1 proportion to host loss: a straight line.
// A multi-host affiliate persists on its remaining hosts and only collapses once
// the whole host network passes a threshold: a curve that hugs zero until late.
//
// TILMAN'S EXTINCTION DEBT. Tilman et al. (1994): habitat destruction happens now,
// the extinctions are owed and paid later. Adults persist around the scar while
// their breeding structure is gone, so recruitment has already failed. The two
// classes pay on different schedules for the same reason their curves differ — an
// obligate has lost its only host and goes out within a generation or two, while a
// multi-host affiliate limps along on what is left. The research note puts the full
// realisation of a felled giant's debt in the 10-100 year window; a fast and a slow
// relaxation inside that window reproduce it.
//
// Every visible string lives in the component's translations.

/** Hosts a typical multi-host (polyphagous) affiliate can use. */
export const HOSTS_PER_AFFILIATE = 4;

/** Relaxation times of the debt, in years: obligates go out first. */
export const OBLIGATE_TAU_YEARS = 14;
export const AFFILIATE_TAU_YEARS = 55;

/** Earth anchors the presets are calibrated against (both from the research note). */
/** Mitchell et al. catalogued 955 species associated with European ash. */
export const ASH_ASSOCIATED = 955;
/** Of those, 44-45 are strict obligates — about 4.7%. */
export const ASH_OBLIGATE_PCT = 4.7;
/** Erwin found ~162 of ~1,200 canopy beetle species host-specific — about 13.5%. */
export const LUEHEA_OBLIGATE_PCT = 13.5;

export interface LedgerInput {
  /** Species associated with the tree at all. */
  associated: number;
  /** Share of those that can live on no other host, 0..1. */
  obligateShare: number;
  /** Share of the local host supply this one tree provided, 0..1. */
  hostShare: number;
}

export interface LedgerResult {
  /** Obligates doomed by the felling — linear in host loss, paid fast. */
  obligatesDoomed: number;
  /** Multi-host affiliates doomed — curvilinear in host loss, paid slowly. */
  affiliatesDoomed: number;
  /** Everything owed, fixed on the day the tree falls. */
  doomed: number;
  /** Species that genuinely persist, the long-run floor. */
  safe: number;
}

/**
 * Probability that an affiliate using `hosts` hosts loses all of them, given the
 * fraction of its host supply destroyed. hosts = 1 gives Koh's straight line;
 * larger values give the curve that stays near zero until the network collapses.
 */
export function coextinctionRisk(hostLoss: number, hosts: number): number {
  return hostLoss ** hosts;
}

/** Split the tenant list into what is owed and what survives. */
export function ledgerOf({ associated, obligateShare, hostShare }: LedgerInput): LedgerResult {
  // How much of each tenant's host supply the felling destroyed.
  const hostLoss = Math.min(1, Math.max(0, hostShare));
  const obligates = associated * obligateShare;
  const affiliates = associated - obligates;

  const obligatesDoomed = obligates * coextinctionRisk(hostLoss, 1);
  const affiliatesDoomed = affiliates * coextinctionRisk(hostLoss, HOSTS_PER_AFFILIATE);

  return {
    obligatesDoomed,
    affiliatesDoomed,
    doomed: obligatesDoomed + affiliatesDoomed,
    safe: associated - obligatesDoomed - affiliatesDoomed,
  };
}

const relax = (years: number, tau: number) => 1 - Math.exp(-Math.max(0, years) / tau);

/** Fraction of the whole debt already paid at `years`, weighting the two classes. */
export function debtPaidAt(ledger: LedgerResult, years: number): number {
  if (ledger.doomed <= 0) return 0;
  const paid =
    ledger.obligatesDoomed * relax(years, OBLIGATE_TAU_YEARS) +
    ledger.affiliatesDoomed * relax(years, AFFILIATE_TAU_YEARS);
  return paid / ledger.doomed;
}

/** Species a census at `years` would still record — the number that misleads. */
export function apparentRichnessAt(ledger: LedgerResult, years: number): number {
  return (
    ledger.safe +
    ledger.obligatesDoomed * (1 - relax(years, OBLIGATE_TAU_YEARS)) +
    ledger.affiliatesDoomed * (1 - relax(years, AFFILIATE_TAU_YEARS))
  );
}

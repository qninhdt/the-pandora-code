"use client";

import {
  CHARACTERS,
  type Polarity,
  TAXA,
} from "@/components/content/outgroup-polarity-bench-model";

// The scored bench, re-read against whichever baseline the reader nominated. The
// numbers in this table never change — only which of them counts as a novelty
// does, which is the whole point of the figure. Split out of the figure file to
// keep both under the size ceiling.
export function PolarityMatrix({
  baseline,
  polarityOf,
  heading,
  specimenHeading,
  label,
}: {
  baseline: string;
  polarityOf: (i: number) => Polarity;
  heading: string;
  specimenHeading: string;
  /** Resolves an i18n key relative to the figure's namespace. */
  label: (key: string) => string;
}) {
  return (
    <div className="lg:w-[46%]">
      <p className="mb-1 font-sans text-xs uppercase tracking-wider text-subtle">{heading}</p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-void/40">
              <th className="px-1 py-1 text-left font-sans text-xs font-700 text-subtle">
                {specimenHeading}
              </th>
              {CHARACTERS.map((key) => (
                <th key={key} className="px-1 py-1 font-sans text-xs font-700 text-subtle">
                  {label(`chars.${key}.short`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TAXA.map((taxon) => {
              const isBaseline = taxon.id === baseline;
              return (
                <tr key={taxon.id} className="border-t border-border/60">
                  <td
                    className="px-1 py-1 text-left font-display text-xs font-700"
                    style={{ color: isBaseline ? "var(--amber)" : "var(--foreground)" }}
                  >
                    {isBaseline ? `▸ ${label(`taxa.${taxon.id}`)}` : label(`taxa.${taxon.id}`)}
                  </td>
                  {taxon.states.map((state, i) => {
                    const isNovel = !isBaseline && state !== polarityOf(i).ancestral;
                    return (
                      <td
                        key={CHARACTERS[i]}
                        className="px-1 py-1.5 font-sans text-xs"
                        style={{
                          color: isNovel ? "var(--cyan)" : "var(--subtle)",
                          fontWeight: isNovel ? 700 : 400,
                          background: isNovel
                            ? "color-mix(in oklab, var(--cyan) 16%, transparent)"
                            : "color-mix(in oklab, var(--void) 25%, transparent)",
                        }}
                      >
                        {label(`chars.${CHARACTERS[i]}.states.${state}`)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

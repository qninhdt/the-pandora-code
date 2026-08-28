"use client";

import { SpecimenPlate } from "@/components/codex/specimen-plate";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import type { OfflineLocale } from "@/lib/offline/types";

export interface BrowserChapter {
  slug: string;
  locale: OfflineLocale;
  href: string;
  title: string;
  payload: string;
  plateNo: string;
  published: boolean;
  coverSrc?: string;
}

export interface BrowserPart {
  id: string;
  label: string;
  chapters: BrowserChapter[];
}

interface CodexBrowserProps {
  heading: string;
  kicker: string;
  comingLabel: string;
  parts: BrowserPart[];
}

// The full book map: every Part as a band, its chapters as specimen plates.
// Published chapters link through; the rest show as "coming". Reveals on scroll.
// A faint painted spore-field sits far behind the grid for atmosphere. Its
// viewport-sized band is feathered into the ambient layer at both edges so the
// section never introduces a visible horizontal background cut.
const CODEX_FIELD_MASK =
  "linear-gradient(to bottom, transparent 0%, black 32%, black 78%, transparent 100%)";

export function CodexBrowser({ heading, kicker, comingLabel, parts }: CodexBrowserProps) {
  return (
    <section className="relative overflow-visible">
      {/* Faint luminous backdrop, long enough to feather into the sections
          around it instead of ending as a hard horizontal strip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[20vh] -z-20 h-[110vh]"
      >
        <img
          src="/images/pages/codex-field.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-25"
          style={{ maskImage: CODEX_FIELD_MASK, WebkitMaskImage: CODEX_FIELD_MASK }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--void) 55%, transparent) 18%, color-mix(in oklab, var(--void) 55%, transparent) 78%, transparent 100%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-28">
        <FadeInOnScroll>
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.3em] text-magenta">{kicker}</p>
          <h2 className="mb-14 max-w-3xl font-display text-4xl font-700 leading-tight tracking-tight text-foreground sm:text-5xl">
            {heading}
          </h2>
        </FadeInOnScroll>

        <div className="space-y-16">
          {parts.map((part) => (
            <div key={part.id}>
              <FadeInOnScroll>
                <h3 className="mb-6 flex items-center gap-3 font-display text-xl font-600 text-foreground">
                  <span
                    className="h-px flex-1 max-w-8"
                    style={{ background: "color-mix(in oklab, var(--cyan) 60%, transparent)" }}
                  />
                  {part.label}
                </h3>
              </FadeInOnScroll>
              <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {part.chapters.map((c) => (
                  <StaggerItem key={c.slug}>
                    <SpecimenPlate
                      href={c.href}
                      locale={c.locale}
                      slug={c.slug}
                      title={c.title}
                      subtitle={c.payload}
                      plateNo={c.plateNo}
                      imageSrc={c.coverSrc}
                      coming={!c.published}
                      comingLabel={comingLabel}
                      className="h-full min-h-44"
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

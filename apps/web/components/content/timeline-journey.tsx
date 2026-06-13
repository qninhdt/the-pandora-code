"use client";

import { GlassPanel } from "@/components/codex/glass-panel";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { GlowPulse } from "@/components/motion/glow-pulse";
import { Parallax } from "@/components/motion/parallax";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Kind = "canon" | "inference" | "speculation" | "real_science";

export interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  kind?: Kind;
}

interface TimelineJourneyProps {
  events: JourneyEvent[];
  className?: string;
}

// Tier hue → CSS token (shared with CanonBadge / TierLegend).
const tierVar: Record<Kind, string> = {
  canon: "--canon",
  inference: "--inference",
  speculation: "--speculation",
  real_science: "--real-science",
};

// Tier → the closest GlowPulse bloom color (its palette is cyan|teal|magenta|amber).
const tierGlow: Record<Kind, "cyan" | "teal" | "magenta" | "amber"> = {
  canon: "cyan",
  inference: "teal",
  speculation: "magenta",
  real_science: "amber",
};

// Tier → GlassPanel glow (which only supports none|cyan|teal|magenta).
const panelGlow: Record<Kind, "cyan" | "teal" | "magenta"> = {
  canon: "cyan",
  inference: "teal",
  speculation: "magenta",
  real_science: "cyan",
};



// A cinematic vertical "journey" down the codex: a glowing spine threads through
// the page, Part markers land as luminous waypoints centered on the spine, and
// each chapter floats in on a glass card that alternates sides on desktop. All
// motion degrades to a static (still-glowing) layout under reduced motion via
// the underlying FadeInOnScroll / Parallax / GlowPulse primitives.
export function TimelineJourney({ events, className }: TimelineJourneyProps) {
  let cardIndex = -1;
  return (
    <div className={cn("relative", className)}>
      <TierKey />

      <ol className="relative mt-12">
        {/* The glowing spine. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[20px] w-px md:left-1/2 md:-translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--cyan) 55%, transparent) 10%, color-mix(in oklab, var(--teal) 42%, transparent) 90%, transparent)",
            boxShadow: "0 0 22px 0 color-mix(in oklab, var(--cyan) 28%, transparent)",
          }}
        />
        {/* A bioluminescent bloom drifting along the spine for depth. */}
        <Parallax
          offset={140}
          className="pointer-events-none absolute inset-y-0 left-[20px] top-0 md:left-1/2 md:-translate-x-1/2"
        >
          <span
            aria-hidden
            className="block h-48 w-px"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--cyan), transparent)",
              filter: "blur(2px)",
            }}
          />
        </Parallax>

        {events.map((e) => {
          const kind = e.kind ?? "canon";
          if (kind === "canon") {
            return <PartMarker key={e.id} event={e} />;
          }
          cardIndex += 1;
          return (
            <ChapterCard
              key={e.id}
              event={e}
              kind={kind}
              side={cardIndex % 2 === 0 ? "left" : "right"}
            />
          );
        })}
      </ol>
    </div>
  );
}

// A Part heading: a larger waypoint centered on the spine, announcing a new
// movement in the journey.
function PartMarker({ event }: { event: JourneyEvent }) {
  return (
    <li className="relative py-9">
      <FadeInOnScroll>
        <span className="absolute left-[20px] top-2 z-10 -translate-x-1/2 md:left-1/2">
          <GlowPulse color="cyan">
            <span
              aria-hidden
              className="block size-5 rounded-full"
              style={{
                background: "var(--canon)",
                boxShadow: "0 0 22px 2px var(--canon)",
                outline: "5px solid var(--void)",
              }}
            />
          </GlowPulse>
        </span>
        <div className="pl-12 md:mx-auto md:max-w-xl md:pl-0 md:pt-12 md:text-center">
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.35em] text-cyan">
            {event.date}
          </p>
          <h2 className="mt-2 font-display text-3xl font-800 leading-tight tracking-tight text-foreground sm:text-4xl">
            {event.title}
          </h2>
          {event.description && (
            <p className="mt-3 font-serif text-base leading-relaxed text-muted">
              {event.description}
            </p>
          )}
        </div>
      </FadeInOnScroll>
    </li>
  );
}

// A chapter waypoint: a tier-colored node on the spine and a glass card that
// rises into view, alternating sides on desktop.
function ChapterCard({
  event,
  kind,
  side,
}: {
  event: JourneyEvent;
  kind: Kind;
  side: "left" | "right";
}) {
  const c = `var(${tierVar[kind]})`;
  return (
    <li className="relative py-4">
      <span className="absolute left-[20px] top-7 z-10 -translate-x-1/2 md:left-1/2">
        <GlowPulse color={tierGlow[kind]}>
          <span
            aria-hidden
            className="block size-3.5 rounded-full"
            style={{
              background: c,
              boxShadow: `0 0 14px 1px ${c}`,
              outline: "4px solid var(--void)",
            }}
          />
        </GlowPulse>
      </span>
      <div
        className={cn(
          "pl-12 md:w-1/2 md:pl-0",
          side === "left" ? "md:mr-auto md:pr-14 md:text-right" : "md:ml-auto md:pl-14",
        )}
      >
        <FadeInOnScroll y={20}>
          <GlassPanel depth={2} glow={panelGlow[kind]} className="p-5">
            <p
              className="font-sans text-[0.65rem] uppercase tracking-[0.25em]"
              style={{ color: c }}
            >
              {event.date}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-700 leading-snug text-foreground">
              {event.title}
            </h3>
            {event.description && (
              <p className="mt-2 font-serif text-sm leading-relaxed text-muted">
                {event.description}
              </p>
            )}
          </GlassPanel>
        </FadeInOnScroll>
      </div>
    </li>
  );
}

// A compact key to the four epistemic tiers, so the node colors read at a glance.
function TierKey() {
  const t = useTranslations("classification");
  const kinds: Kind[] = ["canon", "inference", "speculation", "real_science"];
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {kinds.map((k) => {
        const c = `var(${tierVar[k]})`;
        return (
          <li key={k} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ background: c, boxShadow: `0 0 8px 0 ${c}` }}
            />
            <span className="font-sans text-xs uppercase tracking-wider text-muted">
              {t(k)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

import { CanonBadge } from "@/components/classification/canon-badge";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface SpecimenPlateProps {
  href: string;
  title: string;
  subtitle?: string;
  /** Establishing figure for the plate; falls back to a gradient field. */
  imageSrc?: string;
  /** Plate number shown as marginalia (e.g. "01"). */
  plateNo?: string;
  tier?: ClassificationKind;
  tierLabel?: string;
  /** Dim + disable for unpublished entries. */
  coming?: boolean;
  comingLabel?: string;
  className?: string;
}

// The reusable codex card: a full-bleed figure (or gradient field) with an
// oversized title overlapping the lower edge, a plate number in the margin, and
// a tier badge. Lifts and glows on hover.
export function SpecimenPlate({
  href,
  title,
  subtitle,
  imageSrc,
  plateNo,
  tier,
  tierLabel,
  coming = false,
  comingLabel,
  className,
}: SpecimenPlateProps) {
  const inner = (
    <>
      {/* Figure / field */}
      <div className="absolute inset-0 -z-10">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-110"
          />
        ) : (
          <div
            className="size-full"
            style={{
              background:
                "radial-gradient(80% 70% at 30% 20%, color-mix(in oklab, var(--cyan) 24%, transparent), transparent 60%), radial-gradient(70% 60% at 90% 90%, color-mix(in oklab, var(--magenta) 16%, transparent), transparent 60%), var(--surface)",
            }}
          />
        )}
        {/* legibility gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, var(--void) 8%, transparent 70%)" }}
        />
      </div>

      <div className="flex items-start justify-between gap-3 p-5">
        {plateNo && (
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-subtle">
            № {plateNo}
          </span>
        )}
        {tier && (
          <CanonBadge kind={tier}>
            {tierLabel}
          </CanonBadge>
        )}
      </div>

      <div className="mt-auto p-5">
        {coming && comingLabel && (
          <span className="mb-2 inline-block rounded-full border border-border px-2 py-0.5 font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
            {comingLabel}
          </span>
        )}
        <h3 className="font-display text-2xl font-700 leading-tight tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 line-clamp-2 font-serif text-sm text-muted">{subtitle}</p>
        )}
      </div>

      {!coming && (
        <span
          aria-hidden
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-void/50 text-cyan opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"
        >
          <ArrowUpRight size={16} />
        </span>
      )}
    </>
  );

  const shell = cn(
    "group relative isolate flex min-h-64 flex-col overflow-hidden rounded-2xl border border-border transition-all duration-300",
    coming ? "cursor-default opacity-55" : "hover:-translate-y-1 hover:border-border-strong",
    className,
  );

  if (coming) return <div className={shell}>{inner}</div>;

  return (
    <Link
      href={href}
      className={shell}
      style={{ boxShadow: "0 1px 0 0 transparent" }}
      onMouseEnter={undefined}
    >
      {inner}
    </Link>
  );
}

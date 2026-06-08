import { cn } from "@/lib/utils";

interface MarginaliaProps {
  /** Short label/number for the annotation (e.g. "Fig. 1", "Note"). */
  label?: string;
  className?: string;
  children: React.ReactNode;
}

// A scientific margin annotation: small sans note tied to the body by a thin
// connector rule. On wide screens it sits in the gutter (the parent supplies a
// relative/grid context); on narrow screens it falls inline beneath the text.
export function Marginalia({ label, className, children }: MarginaliaProps) {
  return (
    <aside
      className={cn(
        "relative border-l pl-3 font-sans text-xs leading-relaxed text-subtle",
        className,
      )}
      style={{ borderColor: "color-mix(in oklab, var(--cyan) 30%, transparent)" }}
    >
      {label && (
        <span className="mb-1 block font-medium uppercase tracking-wider text-muted">{label}</span>
      )}
      {children}
    </aside>
  );
}

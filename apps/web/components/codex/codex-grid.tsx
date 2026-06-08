import { cn } from "@/lib/utils";

type CodexVariant = "feature" | "split" | "mosaic";

interface CodexGridProps {
  variant?: CodexVariant;
  className?: string;
  children: React.ReactNode;
}

// Asymmetric editorial grid (the "codex" layout). Variants pick a column rhythm;
// CodexCell children opt into spans. Collapses to a single column under md.
const variantClass: Record<CodexVariant, string> = {
  // One dominant feature beside a stack.
  feature: "md:grid-cols-[1.6fr_1fr]",
  // Even-ish two-up that staggers.
  split: "md:grid-cols-2",
  // Dense 6-track mosaic for plate galleries.
  mosaic: "md:grid-cols-6",
};

export function CodexGrid({ variant = "mosaic", className, children }: CodexGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:gap-6", variantClass[variant], className)}>
      {children}
    </div>
  );
}

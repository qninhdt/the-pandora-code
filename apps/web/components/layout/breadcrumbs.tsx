import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Trail of small uppercase crumbs; the current page glows faintly in cyan.
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 font-sans text-[0.6875rem] uppercase tracking-wider text-subtle">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="text-muted transition-colors hover:text-cyan">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "text-foreground")}
                  style={
                    isLast
                      ? { textShadow: "0 0 12px color-mix(in oklab, var(--cyan) 50%, transparent)" }
                      : undefined
                  }
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={11} className="text-subtle" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

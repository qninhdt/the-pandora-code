"use client";

import { MobileReaderDock } from "@/components/reading/mobile-reader-dock";
import { TableOfContentsList, type TocHeading } from "@/components/reading/table-of-contents-list";
import { cn } from "@/lib/utils";
import { useActiveHeading } from "./audio-section-sync";

export type { TocHeading } from "@/components/reading/table-of-contents-list";

interface TableOfContentsProps {
  headings: TocHeading[];
  label?: string;
  className?: string;
}

export function TableOfContents({ headings, label, className }: TableOfContentsProps) {
  const active = useActiveHeading(headings);
  const heading = label ?? "On this page";

  return (
    <>
      {headings.length > 0 ? (
        <div className={cn("hidden lg:block", className)}>
          <div className="rounded-xl border border-border bg-surface/70 p-5 backdrop-blur-sm">
            <p className="mb-4 font-sans text-[0.6875rem] text-foreground/82 uppercase tracking-wider">
              {heading}
            </p>
            <TableOfContentsList headings={headings} active={active} ariaLabel={heading} />
          </div>
        </div>
      ) : null}
      <MobileReaderDock headings={headings} active={active} label={heading} />
    </>
  );
}

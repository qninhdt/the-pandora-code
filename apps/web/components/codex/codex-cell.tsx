import { cn } from "@/lib/utils";

interface CodexCellProps {
  /** Column span on md+ (1–6, matched to the mosaic grid). */
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Row span on md+ for taller feature cells. */
  rowSpan?: 1 | 2;
  className?: string;
  children: React.ReactNode;
}

const colSpan: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
};

const rowSpanClass: Record<number, string> = {
  1: "",
  2: "md:row-span-2",
};

// A child of CodexGrid that claims a span. Defaults to a 2-track cell in the
// 6-track mosaic, so three sit per row with room to break the rhythm.
export function CodexCell({ span = 2, rowSpan = 1, className, children }: CodexCellProps) {
  return <div className={cn(colSpan[span], rowSpanClass[rowSpan], className)}>{children}</div>;
}

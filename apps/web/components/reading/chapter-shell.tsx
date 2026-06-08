import { cn } from "@/lib/utils";

interface ChapterShellProps {
  hero?: React.ReactNode;
  toc?: React.ReactNode;
  progress?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// Three-column reading frame: a sticky TOC rail, the centered reading column
// tuned for 5–7k words, and a balancing gutter. The hero sits full-bleed above
// the columns so it can break out of the reading measure.
export function ChapterShell({
  hero,
  toc,
  progress,
  footer,
  className,
  children,
}: ChapterShellProps) {
  return (
    <div className={cn("relative", className)}>
      {progress}
      {hero}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{toc}</div>
        </aside>
        <main className="min-w-0">
          <article className="prose-pandora reading-column">{children}</article>
          {footer}
        </main>
      </div>
    </div>
  );
}

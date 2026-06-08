import { cn } from "@/lib/utils";

interface QuoteProps {
  children: React.ReactNode;
  cite?: string;
  className?: string;
}

// A large pull-quote that breaks the reading rhythm — oversized serif with a
// glowing quotation mark and an optional attribution.
export function Quote({ children, cite, className }: QuoteProps) {
  return (
    <blockquote className={cn("relative my-10 px-6 py-2 lg:-mx-8", className)}>
      <span
        aria-hidden
        className="absolute -left-1 -top-4 font-display text-6xl leading-none"
        style={{
          color: "var(--cyan)",
          textShadow: "0 0 24px color-mix(in oklab, var(--cyan) 50%, transparent)",
        }}
      >
        “
      </span>
      <p className="font-serif text-2xl font-300 italic leading-snug text-foreground">{children}</p>
      {cite && (
        <footer className="mt-3 font-sans text-sm text-muted">
          — <cite className="not-italic">{cite}</cite>
        </footer>
      )}
    </blockquote>
  );
}

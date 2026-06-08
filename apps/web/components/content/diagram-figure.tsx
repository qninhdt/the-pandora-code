import { cn } from "@/lib/utils";

interface DiagramLabel {
  /** Position as a percentage of the diagram box. */
  x: number;
  y: number;
  text: string;
}

interface DiagramFigureProps {
  /** SVG/image source for the base diagram. */
  src: string;
  labels?: DiagramLabel[];
  caption?: string;
  className?: string;
}

// A labeled diagram: a base image/SVG with glowing callout dots and labels
// positioned over it. Labels connect to their point with a small node.
export function DiagramFigure({ src, labels = [], caption, className }: DiagramFigureProps) {
  return (
    <figure className={cn("my-8", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        <img src={src} alt={caption ?? ""} className="w-full object-contain" />
        {labels.map((l, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
          >
            <span
              className="block size-2.5 rounded-full"
              style={{ background: "var(--cyan)", boxShadow: "0 0 10px 1px var(--cyan)" }}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-void/80 px-2 py-0.5 font-sans text-xs text-foreground backdrop-blur">
              {l.text}
            </span>
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 px-1 font-serif text-sm italic text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

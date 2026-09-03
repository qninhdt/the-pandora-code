import { cn } from "@/lib/utils";
import { FlaskConical, Info, Lightbulb, TriangleAlert } from "lucide-react";

type CalloutVariant = "note" | "science" | "insight" | "warning" | "inference";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

const config: Record<CalloutVariant, { tone: string; icon: typeof Info }> = {
  note: { tone: "--cyan", icon: Info },
  science: { tone: "--teal", icon: FlaskConical },
  insight: { tone: "--amber", icon: Lightbulb },
  warning: { tone: "--magenta", icon: TriangleAlert },
  inference: { tone: "--teal", icon: Lightbulb },
};

// Inline emphasis block, token-styled with a glowing left edge. Replaces the old
// ScientificNote / SideNote / note boxes with a single variant-driven component.
export function Callout({ variant = "note", title, className, children }: CalloutProps) {
  const { tone, icon: Icon } = config[variant] ?? config.note;
  const c = `var(${tone})`;
  return (
    <aside
      className={cn("my-6 flex gap-3 rounded-xl border p-4 backdrop-blur-sm", className)}
      style={{
        borderColor: `color-mix(in oklab, ${c} 30%, transparent)`,
        background: `color-mix(in oklab, ${c} 7%, transparent)`,
      }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: c, filter: `drop-shadow(0 0 5px ${c})` }}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        {title && (
          <p className="mb-1 font-sans text-sm font-semibold" style={{ color: c }}>
            {title}
          </p>
        )}
        <div className="font-serif text-[0.95rem] leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </aside>
  );
}

// Thin wrappers preserve the old MDX tag names while sharing one implementation.
export function ScientificNote(props: Omit<CalloutProps, "variant">) {
  return <Callout variant="science" {...props} />;
}
export function SideNote(props: Omit<CalloutProps, "variant">) {
  return <Callout variant="note" {...props} />;
}

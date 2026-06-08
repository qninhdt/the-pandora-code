import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface OpenQuestionsProps {
  title?: string;
  questions: string[];
  className?: string;
}

// End-of-chapter open questions — what science (and canon) still can't answer.
// Each sits in a glassy row with a glowing query mark.
export function OpenQuestions({ title, questions, className }: OpenQuestionsProps) {
  return (
    <section
      className={cn(
        "my-10 rounded-2xl border border-border bg-surface/40 p-6 backdrop-blur-sm",
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-700 text-foreground">
          <HelpCircle size={18} className="text-magenta" />
          {title}
        </h3>
      )}
      <ul className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-3 font-serif text-[0.95rem] leading-relaxed text-muted">
            <span className="shrink-0 font-sans text-sm font-semibold text-magenta tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            {q}
          </li>
        ))}
      </ul>
    </section>
  );
}

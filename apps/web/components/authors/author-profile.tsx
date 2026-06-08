import { GlassPanel } from "@/components/codex/glass-panel";
import { PageBackground } from "@/components/layout/page-background";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { GlowPulse } from "@/components/motion/glow-pulse";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import type { LocalizedAuthor } from "@/lib/content/loader/author-loader";
import { Languages, Palette, PenLine } from "lucide-react";
import Image from "next/image";

interface AuthorProfileProps {
  author: LocalizedAuthor;
  locale: "vi" | "en";
  /** Full-bleed, fixed page backdrop (the generated authors image). */
  bgSrc?: string;
}

const COPY = {
  vi: {
    bio: "Giới thiệu",
    voice: "Đặc trưng giọng văn",
    contract: "Cam kết với độc giả",
    models: "Mô hình sử dụng",
    writing: "Chấp bút",
    drawing: "Minh hoạ",
    translation: "Chuyển ngữ",
  },
  en: {
    bio: "Bio",
    voice: "Voice",
    contract: "Reader contract",
    models: "Models used",
    writing: "Writing",
    drawing: "Illustration",
    translation: "Translation",
  },
} as const;

// The single storyteller behind The Pandora Code, laid out like a long-form
// article: a centered byline header on a fullscreen bioluminescent backdrop,
// then the bio, the reader contract as a pull quote, the voice traits, and the
// production credits — all in one comfortable reading measure.
export function AuthorProfile({ author, locale, bgSrc }: AuthorProfileProps) {
  const t = COPY[locale];

  return (
    <>
      {bgSrc ? <PageBackground src={bgSrc} intensity={0.86} /> : null}

      <main className="mx-auto max-w-2xl px-6 pb-32 pt-32">
        {/* ---- Byline ---- */}
        <header className="flex flex-col items-center text-center">
          <GlowPulse color="cyan" duration={5}>
            <div
              className="relative size-24 overflow-hidden rounded-full"
              style={{
                border: "1px solid color-mix(in oklab, var(--cyan) 45%, var(--border-strong))",
                boxShadow: "inset 0 0 26px -8px color-mix(in oklab, var(--cyan) 60%, transparent)",
              }}
            >
              <Image
                src="/author.png"
                alt={author.name}
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
          </GlowPulse>

          <p className="mt-6 font-sans text-[0.7rem] uppercase tracking-[0.35em] text-cyan">
            {author.domain}
          </p>
          <h1
            className="mt-3 bg-clip-text font-display text-5xl font-800 leading-[1.02] tracking-tight text-transparent sm:text-6xl"
            style={{
              backgroundImage:
                "linear-gradient(180deg, var(--foreground) 34%, var(--accent-soft) 84%, var(--cyan) 100%)",
            }}
          >
            {author.name}
          </h1>
          <p className="mt-3 font-serif text-base text-muted">
            {author.title}
            <span className="mx-2 text-subtle">·</span>
            {author.institution}
          </p>

          <div
            aria-hidden
            className="mt-9 h-px w-24"
            style={{ background: "linear-gradient(90deg, transparent, var(--cyan), transparent)" }}
          />
        </header>

        {/* ---- Article ---- */}
        <article className="mt-12 space-y-14">
          {/* Bio */}
          <FadeInOnScroll>
            <section>
              <SectionLabel>{t.bio}</SectionLabel>
              <p className="mt-4 font-serif text-xl leading-relaxed text-foreground/90">
                {author.bio}
              </p>
            </section>
          </FadeInOnScroll>

          {/* Reader contract — a pull quote. */}
          {author.reader_contract ? (
            <FadeInOnScroll>
              <figure>
                <SectionLabel tone="cyan">{t.contract}</SectionLabel>
                <blockquote
                  className="mt-4 border-l-2 pl-6 font-serif text-lg italic leading-relaxed text-foreground/90"
                  style={{ borderColor: "var(--cyan)" }}
                >
                  {author.reader_contract}
                </blockquote>
              </figure>
            </FadeInOnScroll>
          ) : null}

          {/* Voice traits */}
          {author.voice_traits.length > 0 ? (
            <FadeInOnScroll>
              <section>
                <SectionLabel>{t.voice}</SectionLabel>
                <StaggerChildren className="mt-4 flex flex-wrap gap-2.5">
                  {author.voice_traits.map((trait) => (
                    <StaggerItem key={trait}>
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm text-foreground/85 backdrop-blur transition-colors hover:border-border-strong"
                        style={{
                          borderColor: "color-mix(in oklab, var(--cyan) 28%, var(--border))",
                          background: "color-mix(in oklab, var(--surface) 55%, transparent)",
                        }}
                      >
                        <span
                          aria-hidden
                          className="size-1.5 rounded-full bg-cyan"
                          style={{ boxShadow: "0 0 8px 0 var(--cyan)" }}
                        />
                        {trait}
                      </span>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </section>
            </FadeInOnScroll>
          ) : null}

          {/* Production credits */}
          <FadeInOnScroll>
            <section>
              <SectionLabel>{t.models}</SectionLabel>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <CreditCard
                  icon={<PenLine size={18} />}
                  glow="cyan"
                  label={t.writing}
                  model="Claude Opus 4.8"
                />
                <CreditCard
                  icon={<Palette size={18} />}
                  glow="magenta"
                  label={t.drawing}
                  model="GPT Image 2"
                />
                <CreditCard
                  icon={<Languages size={18} />}
                  glow="teal"
                  label={t.translation}
                  model="Gemini 3.1 Pro"
                />
              </div>
            </section>
          </FadeInOnScroll>
        </article>
      </main>
    </>
  );
}

function SectionLabel({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "cyan";
}) {
  return (
    <h2
      className="font-sans text-xs font-semibold uppercase tracking-[0.3em]"
      style={{ color: tone === "cyan" ? "var(--cyan)" : "var(--subtle)" }}
    >
      {children}
    </h2>
  );
}

function CreditCard({
  icon,
  label,
  model,
  glow,
}: {
  icon: React.ReactNode;
  label: string;
  model: string;
  glow: "cyan" | "magenta" | "teal";
}) {
  const c = glow === "cyan" ? "var(--cyan)" : glow === "teal" ? "var(--teal)" : "var(--magenta)";
  return (
    <GlassPanel depth={2} glow={glow} className="flex items-center gap-4 p-5">
      <span
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-xl"
        style={{
          color: c,
          background: `color-mix(in oklab, ${c} 14%, transparent)`,
          boxShadow: `inset 0 0 18px -8px ${c}`,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-subtle">{label}</p>
        <p className="mt-0.5 truncate font-display text-lg font-700 text-foreground">{model}</p>
      </div>
    </GlassPanel>
  );
}

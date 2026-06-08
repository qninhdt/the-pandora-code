import { CanonBadge } from "@/components/classification/canon-badge";
import { ComponentShowcase } from "@/components/design/component-showcase";
import { setRequestLocale } from "next-intl/server";
import { MotionDemos } from "./motion-demos";

interface DesignDebugProps {
  params: Promise<{ locale: string }>;
}

export default async function DesignDebug({ params }: DesignDebugProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale === "en" ? "en" : "vi";

  return (
    <main className="mx-auto max-w-4xl space-y-16 px-6 py-20">
      <header>
        <h1 className="font-display text-4xl font-800 tracking-tight">
          Design system
        </h1>
        <p className="mt-2 font-serif text-muted">
          Dark bioluminescent reference. Not in sitemap.
        </p>
      </header>

      <Section title="Depth & surface">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            "void",
            "abyss",
            "background",
            "surface",
            "surface-raised",
            "surface-overlay",
          ].map((name) => (
            <Swatch key={name} name={name} />
          ))}
        </div>
      </Section>

      <Section title="Bioluminescence">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["cyan", "teal", "magenta", "amber"].map((name) => (
            <Swatch key={name} name={name} glow />
          ))}
        </div>
      </Section>

      <Section title="Classification tiers">
        <div className="flex flex-wrap gap-3">
          <CanonBadge kind="canon" locale={loc} />
          <CanonBadge kind="inference" locale={loc} />
          <CanonBadge kind="speculation" locale={loc} />
          <CanonBadge kind="real_science" locale={loc} />
        </div>
      </Section>

      <Section title="Typography">
        <p className="font-display text-6xl font-800 tracking-tight">Pandora</p>
        <p className="mt-2 font-display text-3xl font-600">Display heading</p>
        <p className="mt-4 font-serif text-lg leading-relaxed text-muted">
          Đây là một đoạn văn tiếng Việt với đầy đủ dấu: ăn, ằn, ấn, ẩn, ẵn, ặn,
          ã, ò, ờ, ở, ỡ, ợ, ư, ữ, ự, đ - Spectral phục vụ phần thân bài dài, Be
          Vietnam Pro cho tiêu đề.
        </p>
        <p className="mt-3 font-sans text-sm text-subtle">
          Inter - UI sans for labels, captions, and chrome.
        </p>
      </Section>

      <Section title="Motion">
        <MotionDemos />
      </Section>

      <Section title="Content & 3D components">
        <ComponentShowcase />
      </Section>

      <Section title="Radii">
        <div className="flex flex-wrap gap-3">
          {["sm", "md", "lg", "xl"].map((r) => (
            <div
              key={r}
              className="grid h-14 w-24 place-items-center border border-border bg-surface-raised font-sans text-xs text-muted"
              style={{ borderRadius: `var(--radius-${r})` }}
            >
              {r}
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-5 font-sans text-xs uppercase tracking-wider text-subtle">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ name, glow }: { name: string; glow?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div
        className="mb-2 h-14 rounded-md border border-border"
        style={{
          background: `var(--${name})`,
          boxShadow: glow ? `0 0 24px -4px var(--${name})` : undefined,
        }}
      />
      <div className="font-sans text-[0.6875rem] text-muted">{name}</div>
    </div>
  );
}

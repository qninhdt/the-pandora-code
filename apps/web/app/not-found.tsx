import { fontVariables } from "@/lib/fonts";
import Link from "next/link";

// Requests the locale proxy never matched (e.g. a bare `/unknown`) render here,
// outside app/[locale]/layout.tsx. Since the root layout is a pass-through,
// this file supplies its own document shell and stays locale-neutral.
export default function NotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-sans text-xs uppercase tracking-wider text-subtle">404</p>
          <h1 className="mt-3 font-display text-3xl font-700 tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="mt-6 font-sans text-sm">
            <Link href="/en" className="text-cyan no-underline">
              ← The Pandora Code
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}

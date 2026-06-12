import { fontVariables } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/seo/site-url";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "The Pandora Code",
  description:
    "An interactive book decoding the world of Pandora through real science and storytelling.",
};

// Next.js requires <html> and <body> in the root layout. Locale is resolved via
// next-intl (set by middleware) so the right lang attribute lands here, above
// the [locale] segment.
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}

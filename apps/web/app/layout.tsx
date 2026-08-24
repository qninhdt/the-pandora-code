import { ScrollPositionRestorer } from "@/components/navigation/scroll-position-restorer";
import { OfflineProvider } from "@/components/offline/offline-provider";
import { ReadingPreferencesProvider } from "@/lib/engagement/preferences-store";
import { fontVariables } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/seo/site-url";
import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "The Pandora Code",
  description:
    "An interactive book decoding the world of Pandora through real science and storytelling.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "The Pandora Code",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#06111d",
  width: "device-width",
  initialScale: 1,
};

// Next.js requires <html> and <body> in the root layout. Locale is resolved via
// next-intl (set by middleware) so the right lang attribute lands here, above
// the [locale] segment.
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <ScrollPositionRestorer />
        <ReadingPreferencesProvider>
          <OfflineProvider>{children}</OfflineProvider>
        </ReadingPreferencesProvider>
      </body>
    </html>
  );
}

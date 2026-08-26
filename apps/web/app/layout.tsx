import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/seo/site-url";

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

// Deliberately a pass-through: <html>/<body> live in app/[locale]/layout.tsx.
// Reading the locale here (getLocale()) would resolve next-intl's request
// config before the [locale] segment can call setRequestLocale, freezing every
// server component that uses useLocale()/useTranslations() to the default
// locale. The unmatched-route 404 supplies its own document shell.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

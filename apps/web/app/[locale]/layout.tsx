import { AtmosphereProvider } from "@/components/atmosphere/atmosphere-provider";
import { FloatingDock } from "@/components/layout/floating-dock";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollPositionRestorer } from "@/components/navigation/scroll-position-restorer";
import { InstallAndUpdateStatus } from "@/components/offline/install-and-update-status";
import { OfflineProvider } from "@/components/offline/offline-provider";
import { AudioPlayer } from "@/components/reading/audio-player";
import { ReaderSettingsMenu } from "@/components/reading/reader-settings-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Locale, isLocale, locales } from "@/i18n/config";
import { ReadingPreferencesProvider } from "@/lib/engagement/preferences-store";
import { fontVariables } from "@/lib/fonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// This segment owns <html>/<body>: it is the first layout that knows the route
// locale, so `lang` and every server-rendered translation resolve correctly
// here. The parent app/layout.tsx is a pass-through for that reason.
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <ScrollPositionRestorer />
          <ReadingPreferencesProvider>
            <OfflineProvider>
              <TooltipProvider delayDuration={150}>
                <AtmosphereProvider />
                <FloatingDock />
                <InstallAndUpdateStatus />
                <ReaderSettingsMenu />
                <AudioPlayer />
                <div>
                  {children}
                  <SiteFooter />
                </div>
              </TooltipProvider>
            </OfflineProvider>
          </ReadingPreferencesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

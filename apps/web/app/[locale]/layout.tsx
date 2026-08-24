import { AtmosphereProvider } from "@/components/atmosphere/atmosphere-provider";
import { FloatingDock } from "@/components/layout/floating-dock";
import { SiteFooter } from "@/components/layout/site-footer";
import { InstallAndUpdateStatus } from "@/components/offline/install-and-update-status";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Locale, isLocale, locales } from "@/i18n/config";
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

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  // The root layout resolves the default locale before this segment runs. Pass
  // the route locale explicitly so client components (offline controls,
  // navigation, prompts) never hydrate with English messages on `/vi` routes.
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      <TooltipProvider delayDuration={150}>
        <AtmosphereProvider />
        <FloatingDock />
        <InstallAndUpdateStatus />
        <div>
          {children}
          <SiteFooter />
        </div>
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}

import { notFound } from "next/navigation";
import { isValidLocale, locales } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/context";
import { Locale } from "@/types";
import AppShell from "@/components/layout/AppShell";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <I18nProvider locale={locale as Locale}>
      <AppShell>{children}</AppShell>
    </I18nProvider>
  );
}

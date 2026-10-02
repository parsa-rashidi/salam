import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { PreferencesProvider } from "@/i18n/provider";
import { AppStoreProvider } from "@/store/app-store";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabBar } from "@/components/layout/mobile-tabbar";
import { ToastHost } from "@/components/ui/toast";
import { PrototypeBanner } from "@/components/layout/prototype-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "سَلام — سامانه هوشمند جست‌وجو و رزرو خدمات آرایشی",
    template: "%s | سَلام",
  },
  description:
    "سامانه‌ای مکان‌محور برای پیدا کردن و رزرو خدمات آرایشی و پیرایشی در سالن یا محل مشتری؛ همراه با پروفایل حرفه‌ای آرایشگران، نمونه‌کار، قیمت شفاف، تخفیف فوری و پشتیبانی ویژه از سالمندان و افراد کم‌توان.",
  keywords: [
    "آرایشگر",
    "آرایشگاه",
    "رزرو نوبت",
    "خدمات در محل",
    "تخفیف فوری",
    "سالمندان",
    "barber booking",
    "beauty services",
    "at-home beauty",
  ],
  applicationName: "سَلام",
  openGraph: {
    title: "سَلام — زیبایی، نزدیک شما",
    description:
      "پیدا کردن آرایشگر روی نقشه، مشاهدهٔ قیمت و نمونه‌کار، و رزرو نوبت در سالن یا محل مشتری.",
    type: "website",
    locale: "fa_IR",
    siteName: "سَلام",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#048571",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const locale = (store.get("salam_locale")?.value === "en" ? "en" : "fa") as Locale;
  const senior = store.get("salam_senior")?.value === "1";

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23048571'/%3E%3Cpath d='M16 26s-8-4.8-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6.2-8 11-8 11Z' fill='none' stroke='white' stroke-width='2.2' stroke-linejoin='round'/%3E%3Cpath d='M12.5 15.5h7' stroke='white' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E"
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <PreferencesProvider initialLocale={locale} initialSenior={senior}>
          <AppStoreProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:z-[10001] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
              style={{ insetInlineStart: "0.75rem" }}
            >
              Skip to content
            </a>
            <PrototypeBanner />
            <SiteHeader />
            <main id="main" className="flex-1 pb-16 lg:pb-0">
              {children}
            </main>
            <SiteFooter />
            <MobileTabBar />
            <ToastHost />
          </AppStoreProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}

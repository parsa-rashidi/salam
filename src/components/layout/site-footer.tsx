"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accessibility, Heart, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { useI18n } from "@/i18n/provider";

const SERVICE_LINKS = [
  { href: "/explore?mode=home", labelFa: "خدمات در محل", labelEn: "At-home services" },
  { href: "/explore?mode=salon", labelFa: "خدمات در سالن", labelEn: "Salon services" },
  { href: "/explore?senior=1", labelFa: "آرایشگران مناسب سالمندان", labelEn: "Senior-friendly stylists" },
  { href: "/deals", labelFa: "تخفیف‌های فوری", labelEn: "Flash deals" },
  { href: "/explore?cat=bridal", labelFa: "خدمات عروس", labelEn: "Bridal services" },
  { href: "/explore?cat=kids", labelFa: "کوتاهی کودک", labelEn: "Kids haircuts" },
];

const COMPANY_LINKS = [
  { href: "/provider", labelFa: "پنل آرایشگران", labelEn: "Stylist panel" },
  { href: "/admin", labelFa: "پنل مدیریت", labelEn: "Admin panel" },
  { href: "/accessibility", labelFa: "دسترسی‌پذیری", labelEn: "Accessibility" },
  { href: "/login", labelFa: "ورود / ثبت‌نام", labelEn: "Sign in / Sign up" },
];

const SUPPORT_LINKS = [
  { href: "/accessibility", labelFa: "مرکز راهنما", labelEn: "Help center" },
  { href: "/accessibility", labelFa: "قوانین و مقررات", labelEn: "Terms & conditions" },
  { href: "/accessibility", labelFa: "حریم خصوصی", labelEn: "Privacy policy" },
  { href: "/accessibility", labelFa: "ایمنی و اعتماد", labelEn: "Safety & trust" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const { t, locale } = useI18n();

  if (pathname.startsWith("/provider") || pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-ink-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-600">
              {t("footer.aboutText")}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700">
                <ShieldCheck size={14} className="text-brand-600" />
                {t("card.verified")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700">
                <Accessibility size={14} className="text-deal-600" />
                {t("card.seniorFriendly")}
              </span>
            </div>

            <div className="mt-6 space-y-2 text-sm text-ink-600">
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-ink-400" />
                {locale === "fa" ? "تهران، ایران" : "Tehran, Iran"}
              </p>
              <p className="tnum flex items-center gap-2">
                <Phone size={15} className="text-ink-400" />
                {t("misc.supportPhone")}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-ink-400" />
                hello@salaam.app
              </p>
            </div>
          </div>

          <FooterColumn title={t("footer.services")} links={SERVICE_LINKS} locale={locale} />
          <FooterColumn title={t("footer.company")} links={COMPANY_LINKS} locale={locale} />
          <FooterColumn title={t("footer.support")} links={SUPPORT_LINKS} locale={locale} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-6 sm:flex-row">
          <p className="text-xs text-ink-500">{t("footer.rights")}</p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
            <Heart size={13} className="text-deal-500" />
            {t("footer.builtFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  locale,
}: {
  title: string;
  links: { href: string; labelFa: string; labelEn: string }[];
  locale: "fa" | "en";
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-ink-950">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.labelEn}>
            <Link
              href={l.href}
              className="text-sm text-ink-600 transition-colors hover:text-brand-700"
            >
              {locale === "fa" ? l.labelFa : l.labelEn}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

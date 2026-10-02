"use client";

import Link from "next/link";
import {
  Accessibility,
  BellRing,
  Check,
  Contrast,
  Ear,
  Eye,
  HeartHandshake,
  Lock,
  MousePointerClick,
  Phone,
  ShieldCheck,
  Sun,
  Type,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { PageHeader } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/field";
import { PROVIDERS } from "@/lib/mock-data";
import { ProviderMiniCard } from "@/components/customer/provider-card";
import { cn } from "@/lib/cn";

const FEATURES = [
  { icon: Type, key: "landing.careFeature1" },
  { icon: Accessibility, key: "landing.careFeature2" },
  { icon: HeartHandshake, key: "landing.careFeature3" },
  { icon: Phone, key: "landing.careFeature4" },
] as const;

const CONTROLS = [
  { icon: Contrast, fa: "کنتراست بالا و رنگ‌های واضح", en: "High contrast and clear colours" },
  { icon: MousePointerClick, fa: "دکمه‌های بزرگ با فاصلهٔ کافی", en: "Large buttons with generous spacing" },
  { icon: Eye, fa: "متن بزرگ و خوانا در همهٔ صفحات", en: "Large readable text on every page" },
  { icon: Ear, fa: "اعلان‌های ساده و بدون ابهام", en: "Simple, unambiguous notifications" },
  { icon: UserRoundPlus, fa: "رزرو توسط همراه یا عضو خانواده", en: "Booking by a companion or family member" },
  { icon: Lock, fa: "حفاظت از نشانی تا زمان تأیید", en: "Address protected until confirmation" },
  { icon: BellRing, fa: "یادآوری نوبت با پیامک و اعلان", en: "Appointment reminders by SMS and push" },
  { icon: Users, fa: "امکان حضور همراه در زمان نوبت", en: "A companion may be present at the appointment" },
] as const;

export default function AccessibilityPage() {
  const { t, locale, senior, setSenior } = useI18n();
  const { userLocation, deals, toast } = useStore();

  const suitable = PROVIDERS.filter(
    (p) => p.seniorFriendly || p.accessibilityTrained,
  ).slice(0, 6);

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-deal-500 text-white">
              <Accessibility size={20} />
            </span>
            {t("a11y.seniorTitle")}
          </span>
        }
        subtitle={t("landing.careBody")}
        actions={
          <ButtonLink href="/explore?senior=1" variant="outline" size="md">
            {t("explore.seniorFriendly")}
          </ButtonLink>
        }
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* senior mode switch */}
        <section className={cn("card overflow-hidden", senior && "border-deal-300 ring-2 ring-deal-200")}>
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <span
              className={cn(
                "grid h-16 w-16 shrink-0 place-items-center rounded-2xl transition-colors",
                senior ? "bg-deal-500 text-white" : "bg-ink-100 text-ink-500",
              )}
            >
              <Sun size={28} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold text-ink-950">{t("a11y.seniorMode")}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t("a11y.seniorBody")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={senior ? "deal" : "neutral"} size="md" icon={senior ? <Check size={12} /> : undefined}>
                  {senior ? t("a11y.seniorModeOn") : t("a11y.seniorModeOff")}
                </Badge>
                <Badge tone="neutral" size="md" icon={<Type size={12} />}>
                  {locale === "fa" ? "متن ۱۱۸٪" : "118% text size"}
                </Badge>
              </div>
            </div>
            <div className="shrink-0 space-y-3">
              <Toggle
                checked={senior}
                onChange={(v) => {
                  setSenior(v);
                  toast(v ? t("a11y.seniorModeOn") : t("a11y.seniorModeOff"), "info");
                }}
                label={senior ? t("a11y.disable") : t("a11y.enable")}
              />
              <Button variant={senior ? "deal" : "outline"} size="sm" fullWidth onClick={() => setSenior(!senior)}>
                {senior ? t("a11y.disable") : t("landing.enableSeniorMode")}
              </Button>
            </div>
          </div>

          {/* live preview */}
          <div className="border-t border-ink-200 bg-ink-50 p-6">
            <p className="mb-3 text-xs font-bold text-ink-500">
              {locale === "fa" ? "پیش‌نمایش زنده" : "Live preview"}
            </p>
            <div className={cn("rounded-2xl border border-ink-200 bg-white p-5 transition-all", senior && "senior-mode")}>
              <p className="text-sm font-bold text-ink-950 sm:text-base">
                {locale === "fa" ? "نوبت شما فردا ساعت ۱۰:۳۰ تأیید شد." : "Your appointment is confirmed for tomorrow at 10:30."}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
                {locale === "fa"
                  ? "آرایشگر: امیر کاویانی — محل: منزل شما در پاسداران. در صورت نیاز با پشتیبانی تماس بگیرید."
                  : "Stylist: Amir Kaviani — Location: your home in Pasdaran. Call support if you need help."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size={senior ? "lg" : "md"} icon={<Phone size={15} />}>
                  {t("bookings.callSupport")}
                </Button>
                <Button size={senior ? "lg" : "md"} variant="outline">
                  {t("common.details")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* capabilities */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <h2 className="text-sm font-extrabold text-ink-950">
              {locale === "fa" ? "قابلیت‌های دسترسی‌پذیری" : "Accessibility capabilities"}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.key} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-700">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-deal-50 text-deal-600">
                      <Icon size={13} />
                    </span>
                    {t(f.key)}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-extrabold text-ink-950">
              {locale === "fa" ? "کنترل‌ها و انتخاب‌ها" : "Controls & choices"}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {CONTROLS.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.en} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-700">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon size={13} />
                    </span>
                    {locale === "fa" ? c.fa : c.en}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* suitable providers */}
        <section className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-ink-950">
              {locale === "fa" ? "آرایشگران مناسب سالمندان و افراد کم‌توان" : "Stylists suited to seniors & people with disabilities"}
            </h2>
            <Link href="/explore?senior=1" className="shrink-0 text-xs font-bold text-brand-700 hover:text-brand-800">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {suitable.map((p) => (
              <Link key={p.id} href={`/providers/${p.id}`} className="block">
                <ProviderMiniCard
                  provider={p}
                  deals={deals}
                  userLocation={userLocation}
                  onSelect={() => undefined}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* safety note */}
        <section className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-700">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-ink-950">{t("footer.safety")}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{t("landing.careNote")}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              {t("booking.privacyNote")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="tnum mt-3"
              icon={<Phone size={14} />}
              onClick={() => toast(t("misc.supportPhone"), "info")}
            >
              {t("misc.supportPhone")}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

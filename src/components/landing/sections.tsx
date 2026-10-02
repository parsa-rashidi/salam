"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarClock,
  CalendarPlus,
  ChevronDown,
  Clock,
  Eye,
  Flame,
  HandHeart,
  HeartHandshake,
  Images,
  MapPinned,
  Phone,
  Plus,
  Quote,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Users,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Section, SectionHeading } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/rating";
import { SmartImage } from "@/components/ui/smart-image";
import { DealCard } from "@/components/customer/deal-card";
import { FLASH_DEALS, PROVIDERS, REVIEWS } from "@/lib/mock-data";
import { localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

/* ================================================================== *
 * How it works
 * ================================================================== */

const STEPS = [
  { icon: MapPinned, titleKey: "landing.how1Title", bodyKey: "landing.how1Body", href: "/explore" },
  { icon: CalendarPlus, titleKey: "landing.how2Title", bodyKey: "landing.how2Body", href: "/book/p1" },
  { icon: BadgeCheck, titleKey: "landing.how3Title", bodyKey: "landing.how3Body", href: "/bookings" },
] as const;

export function HowItWorks() {
  const { t, dir, locale } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Section>
      <SectionHeading
        align="center"
        eyebrow={t("landing.howTitle")}
        title={t("landing.howTitle")}
        subtitle={t("landing.howSubtitle")}
      />
      <div className="relative mt-12 grid gap-6 md:grid-cols-3">
        <div
          className="pointer-events-none absolute inset-x-[16%] top-9 hidden h-px bg-[repeating-linear-gradient(to_right,var(--color-brand-300)_0_8px,transparent_8px_16px)] md:block"
          aria-hidden="true"
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.titleKey} className="relative">
              <div className="card relative flex h-full flex-col items-center p-6 text-center transition-transform hover:-translate-y-1">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-900/20">
                  <Icon size={26} strokeWidth={1.9} />
                </span>
                <span className="tnum absolute top-5 grid h-7 w-7 place-items-center rounded-full border-2 border-brand-200 bg-white text-xs font-extrabold text-brand-700 end-5">
                  {localDigits(i + 1, locale)}
                </span>
                <h3 className="mt-4 text-base font-extrabold text-ink-950 sm:text-lg">
                  {t(s.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t(s.bodyKey)}</p>
                <Link
                  href={s.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
                >
                  {t("common.continue")}
                  <Arrow size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ================================================================== *
 * Flash deals strip
 * ================================================================== */

export function DealsStrip() {
  const { t, dir } = useI18n();
  const { userLocation } = useStore();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const active = FLASH_DEALS.slice(0, 4).map((d) => ({
    deal: d,
    provider: PROVIDERS.find((p) => p.id === d.providerId),
  }));

  return (
    <Section className="bg-gradient-to-b from-deal-50/60 to-ink-50">
      <SectionHeading
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Flame size={13} /> {t("deals.badge")}
          </span>
        }
        title={t("landing.dealsTitle")}
        subtitle={t("landing.dealsSubtitle")}
        action={
          <ButtonLink href="/deals" variant="deal" size="md" icon={<Arrow size={15} />} iconPosition="end">
            {t("common.viewAll")}
          </ButtonLink>
        }
      />

      <div className="scroll-thin -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-4">
        {active.map(({ deal, provider }) => (
          <div key={deal.id} className="w-[19rem] shrink-0 snap-start sm:w-[21rem] lg:w-auto">
            <DealCard deal={deal} provider={provider} userLocation={userLocation} />
          </div>
        ))}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink-500">
        <Zap size={13} className="text-deal-500" />
        {t("deals.autoDeactivate")}
      </p>
    </Section>
  );
}

/* ================================================================== *
 * Why Salaam — feature grid
 * ================================================================== */

const FEATURES = [
  { icon: Banknote, titleKey: "landing.f1Title", bodyKey: "landing.f1Body", tone: "brand" },
  { icon: HandHeart, titleKey: "landing.f2Title", bodyKey: "landing.f2Body", tone: "deal" },
  { icon: Images, titleKey: "landing.f3Title", bodyKey: "landing.f3Body", tone: "violet" },
  { icon: CalendarClock, titleKey: "landing.f4Title", bodyKey: "landing.f4Body", tone: "info" },
  { icon: Users, titleKey: "landing.f5Title", bodyKey: "landing.f5Body", tone: "emerald" },
  { icon: ShieldCheck, titleKey: "landing.f6Title", bodyKey: "landing.f6Body", tone: "neutral" },
] as const;

const TONE_CLASS: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  deal: "bg-deal-50 text-deal-700 ring-deal-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  info: "bg-sky-50 text-sky-700 ring-sky-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  neutral: "bg-ink-100 text-ink-700 ring-ink-200",
};

export function WhySalaam() {
  const { t } = useI18n();
  return (
    <Section className="bg-white">
      <SectionHeading
        align="center"
        eyebrow={t("landing.whyTitle")}
        title={t("landing.whyTitle")}
        subtitle={t("landing.whySubtitle")}
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.titleKey}
              className="group relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
            >
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-xl ring-4 transition-transform group-hover:scale-110",
                  TONE_CLASS[f.tone],
                )}
              >
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[15px] font-extrabold text-ink-950">{t(f.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{t(f.bodyKey)}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ================================================================== *
 * Care / senior section
 * ================================================================== */

const CARE_FEATURES = [
  { icon: Sun, key: "landing.careFeature1" },
  { icon: Accessibility, key: "landing.careFeature2" },
  { icon: HeartHandshake, key: "landing.careFeature3" },
  { icon: Phone, key: "landing.careFeature4" },
] as const;

export function CareSection() {
  const { t, locale, senior, toggleSenior } = useI18n();
  const { toast } = useStore();

  return (
    <Section className="relative overflow-hidden bg-ink-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 70% at 20% 20%, #000, transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Badge tone="deal" size="md" className="border-white/15 bg-white/10 text-deal-200">
            <Accessibility size={13} />
            {t("landing.g2")} · {t("landing.g3")}
          </Badge>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-[2.6rem]">
            {t("landing.careTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {t("landing.careBody")}
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {CARE_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li
                  key={f.key}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 transition-colors hover:bg-white/10"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-deal-500/20 text-deal-300">
                    <Icon size={17} />
                  </span>
                  <span className="text-[13px] leading-relaxed font-semibold text-white/85">
                    {t(f.key)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant={senior ? "secondary" : "deal"}
              size="lg"
              onClick={() => {
                toggleSenior();
                toast(
                  senior
                    ? t("a11y.seniorModeOff")
                    : t("a11y.seniorModeOn"),
                  "info",
                );
              }}
              icon={<Sun size={17} />}
            >
              {senior ? t("a11y.disable") : t("landing.enableSeniorMode")}
            </Button>
            <ButtonLink href="/explore?senior=1" variant="outline" size="lg" className="border-white/25 bg-transparent text-white hover:bg-white/10">
              {t("explore.seniorFriendly")}
            </ButtonLink>
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/55">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-deal-300" />
            {t("landing.careNote")}
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-pop">
            <SmartImage
              src="/images/portfolio/senior-home.jpg"
              alt=""
              className="aspect-[4/3.2] w-full"
            />
          </div>
          <div className="absolute -bottom-5 -start-3 w-56 rounded-2xl border border-white/10 bg-ink-900/90 p-3.5 shadow-pop backdrop-blur sm:-start-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-deal-500/20 text-deal-300">
                <HeartHandshake size={15} />
              </span>
              <p className="text-xs font-bold text-white">
                {locale === "fa" ? "رزرو توسط همراه" : "Booked by a companion"}
              </p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/60">
              {locale === "fa"
                ? "«برای پدرم نوبت گرفتم — ۷۸ ساله، از واکر استفاده می‌کند، کم‌شنوا هستند.»"
                : "“I booked for my father — 78, uses a walker, hard of hearing.”"}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ================================================================== *
 * Audiences
 * ================================================================== */

const GROUPS = [
  { icon: Sparkles, k: "landing.g1", d: "landing.g1d" },
  { icon: HeartHandshake, k: "landing.g2", d: "landing.g2d" },
  { icon: Accessibility, k: "landing.g3", d: "landing.g3d" },
  { icon: Plus, k: "landing.g4", d: "landing.g4d" },
  { icon: Users, k: "landing.g5", d: "landing.g5d" },
  { icon: Clock, k: "landing.g6", d: "landing.g6d" },
  { icon: Scissors, k: "landing.g7", d: "landing.g7d" },
  { icon: MapPinned, k: "landing.g8", d: "landing.g8d" },
] as const;

export function Audiences() {
  const { t } = useI18n();
  return (
    <Section>
      <SectionHeading
        align="center"
        eyebrow={t("landing.groupsTitle")}
        title={t("landing.groupsTitle")}
        subtitle={t("landing.groupsSubtitle")}
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GROUPS.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.k}
              className="group rounded-2xl border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon size={18} />
              </span>
              <h3 className="mt-3 text-sm font-extrabold text-ink-950">{t(g.k)}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">{t(g.d)}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ================================================================== *
 * Reviews strip
 * ================================================================== */

export function ReviewsStrip() {
  const { t, locale } = useI18n();
  const picks = REVIEWS.filter((r) => r.rating === 5).slice(0, 3);

  return (
    <Section className="bg-white">
      <SectionHeading
        align="center"
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Star size={13} className="fill-current text-deal-400" /> {t("landing.reviewsTitle")}
          </span>
        }
        title={t("landing.reviewsTitle")}
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {picks.map((r) => {
          const provider = PROVIDERS.find((p) => p.id === r.providerId)!;
          return (
            <figure key={r.id} className="card relative flex h-full flex-col p-5">
              <Quote
                size={30}
                className="absolute top-4 text-ink-100 end-4"
                aria-hidden="true"
              />
              <Stars value={r.rating} size={15} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-700">
                {r.body[locale]}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5 border-t border-ink-100 pt-4">
                <Avatar name={r.authorName} accent={provider.accent} size={34} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink-950">{r.authorName}</p>
                  <p className="truncate text-[11px] text-ink-500">
                    {provider.name[locale]} ·{" "}
                    {r.mode === "home" ? t("review.atHome") : t("review.inSalon")}
                  </p>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </Section>
  );
}

/* ================================================================== *
 * Provider CTA
 * ================================================================== */

const PERKS = [
  { icon: CalendarClock, key: "landing.providerPerk1" },
  { icon: Zap, key: "landing.providerPerk2" },
  { icon: Flame, key: "landing.providerPerk3" },
  { icon: MapPinned, key: "landing.providerPerk4" },
] as const;

export function ProviderCta() {
  const { t } = useI18n();
  return (
    <Section>
      <div className="relative overflow-hidden rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 text-white shadow-pop sm:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 60% 80% at 90% 10%, #000, transparent)",
          }}
          aria-hidden="true"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Badge className="border-white/25 bg-white/15 text-white">
              <Scissors size={13} />
              {t("landing.g7")} · {t("landing.g8")}
            </Badge>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              {t("landing.providerCtaTitle")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
              {t("landing.providerCtaBody")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/provider" variant="dark" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">
                {t("landing.providerCtaBtn")}
              </ButtonLink>
              <ButtonLink
                href="/provider/deals/new"
                variant="outline"
                size="lg"
                className="border-white/35 bg-transparent text-white hover:bg-white/10"
                icon={<Flame size={16} />}
              >
                {t("pp.deal.createNew")}
              </ButtonLink>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/60">
              <Eye size={13} />
              {t("ad.rev.freeTier")}
            </p>
          </div>

          <ul className="grid gap-2.5 sm:grid-cols-2">
            {PERKS.map((p) => {
              const Icon = p.icon;
              return (
                <li
                  key={p.key}
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20">
                    <Icon size={17} />
                  </span>
                  <span className="text-[13px] leading-relaxed font-semibold text-white/90">
                    {t(p.key)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ================================================================== *
 * FAQ
 * ================================================================== */

const FAQS = [1, 2, 3, 4, 5, 6] as const;

export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(1);

  return (
    <Section className="bg-white">
      <SectionHeading align="center" eyebrow={t("landing.faqTitle")} title={t("landing.faqTitle")} />
      <div className="mx-auto mt-10 max-w-3xl space-y-2.5">
        {FAQS.map((n) => {
          const isOpen = open === n;
          return (
            <div
              key={n}
              className={cn(
                "overflow-hidden rounded-2xl border transition-colors",
                isOpen ? "border-brand-300 bg-brand-50/40" : "border-ink-200 bg-white hover:border-ink-300",
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : n)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
              >
                <span className="text-sm font-bold text-ink-950 sm:text-[15px]">
                  {t(`landing.faq${n}q` as TranslationKey)}
                </span>
                <ChevronDown
                  size={17}
                  className={cn(
                    "shrink-0 text-ink-400 transition-transform duration-300",
                    isOpen && "rotate-180 text-brand-700",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-ink-600">
                    {t(`landing.faq${n}a` as TranslationKey)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ================================================================== *
 * Newsletter
 * ================================================================== */

export function Newsletter() {
  const { t, locale } = useI18n();
  const { toast } = useStore();
  const [phone, setPhone] = useState("");

  return (
    <Section>
      <div className="card overflow-hidden p-8 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-deal-50 text-deal-600">
              <Bell size={20} />
            </span>
            <h2 className="mt-4 text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl">
              {t("landing.newsletterTitle")}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
              {t("landing.newsletterBody")}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (phone.trim().length < 6) return;
              toast(t("deals.toastSubscribed"), "success");
              setPhone("");
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("landing.newsletterPlaceholder")}
              inputMode="tel"
              dir="ltr"
              className="tnum h-12 flex-1 rounded-xl border border-ink-300 bg-white px-4 text-start text-sm font-medium text-ink-950 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              aria-label={t("auth.phoneLabel")}
            />
            <Button type="submit" size="lg" variant="deal">
              {t("landing.newsletterBtn")}
            </Button>
          </form>
        </div>
        <p className="mt-6 border-t border-ink-100 pt-4 text-[11px] text-ink-400">
          {locale === "fa"
            ? "با عضویت، فقط اعلان تخفیف‌های فوری محدودهٔ خود را دریافت می‌کنید؛ هر زمان می‌توانید لغو کنید."
            : "Subscribing only sends flash-deal alerts for your area; you can opt out at any time."}
        </p>
      </div>
    </Section>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Crosshair,
  Flame,
  Home as HomeIcon,
  MapPin,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Button, ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/rating";
import { formatMoney, localDigits } from "@/lib/format";
import { PROVIDERS, FLASH_DEALS } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

const POPULAR = [
  { key: "cat.haircut", q: "haircut" },
  { key: "cat.beard", q: "beard" },
  { key: "cat.color", q: "color" },
  { key: "cat.bridal", q: "bridal" },
  { key: "cat.nails", q: "nails" },
] as const;

export function Hero() {
  const { t, locale, dir } = useI18n();
  const router = useRouter();
  const { setUserLocation, toast } = useStore();
  const [q, setQ] = useState("");

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const submit = (query = q) => {
    router.push(`/explore${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  const nearMe = () => {
    setUserLocation({ lat: 35.7952, lng: 51.4181 });
    toast(
      locale === "fa"
        ? "موقعیت شما روی نقشه تنظیم شد — محدودهٔ الهیه/زعفرانیه"
        : "Location set on the map — Elahieh / Zaferanieh area",
      "info",
    );
    router.push("/explore?near=1");
  };

  const featured = PROVIDERS[0];
  const deal = FLASH_DEALS[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-ink-50 to-ink-50">
      {/* decorative backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(4,133,113,0.16) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 -end-32 h-[30rem] w-[30rem] rounded-full bg-brand-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-52 -start-40 h-[26rem] w-[26rem] rounded-full bg-deal-200/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
        {/* ---------------- copy ---------------- */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-800 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            {t("landing.heroBadge")}
          </span>

          <h1 className="mt-5 text-[2rem] font-black leading-[1.15] tracking-tight text-ink-950 sm:text-5xl lg:text-[3.4rem]">
            {t("landing.heroTitle1")}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-l from-brand-700 to-brand-500 bg-clip-text text-transparent">
                {t("landing.heroTitle2")}
              </span>
              <svg
                className="absolute -bottom-1 start-0 z-0 h-3 w-full text-deal-300"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8.5C60 3 130 2 298 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-600 sm:text-lg">
            {t("landing.heroSubtitle")}
          </p>

          {/* search */}
          <div className="mt-7 rounded-2xl border border-ink-200 bg-white p-2 shadow-card">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3.5"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder={t("landing.heroSearchPlaceholder")}
                  className="h-12 w-full rounded-xl border-0 bg-ink-50 pe-3 ps-10 text-sm font-medium text-ink-950 placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
                  aria-label={t("common.search")}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" onClick={nearMe} icon={<Crosshair size={17} />} className="flex-1 sm:flex-none">
                  {t("landing.heroNearMe")}
                </Button>
                <Button size="lg" onClick={() => submit()} icon={<Arrow size={17} />} iconPosition="end" className="flex-1 sm:flex-none">
                  {t("landing.heroCta")}
                </Button>
              </div>
            </div>

            <div className="scroll-thin mt-2 flex items-center gap-1.5 overflow-x-auto border-t border-ink-100 px-1 pt-2.5">
              <span className="shrink-0 text-[11px] font-semibold text-ink-400">
                {t("landing.heroPopular")}
              </span>
              {POPULAR.map((p) => (
                <button
                  key={p.key}
                  onClick={() => submit(t(p.key))}
                  className="shrink-0 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  {t(p.key)}
                </button>
              ))}
            </div>
          </div>

          {/* stats */}
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value="۱٬۶۵۴" valueEn="1,654" label={t("landing.statProviders")} icon={<Sparkles size={13} />} />
            <Stat value="۴۸٬۲۰۰" valueEn="48.2K" label={t("landing.statBookings")} icon={<CalendarCheck2 size={13} />} />
            <Stat value="۱۲٬۴۰۰" valueEn="12.4K" label={t("landing.statHomeVisits")} icon={<HomeIcon size={13} />} />
            <Stat value="۵" valueEn="5" label={t("landing.statCities")} icon={<MapPin size={13} />} />
          </dl>
        </div>

        {/* ---------------- visual ---------------- */}
        <div className="relative animate-fade-up lg:h-[34rem]">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[2rem] border border-white/60 shadow-pop">
              <SmartImage
                src="/images/hero.jpg"
                alt=""
                className="aspect-[4/3.4] w-full lg:aspect-[4/4.2]"
                priority
              />
            </div>

            {/* floating provider card */}
            <div className="absolute -bottom-6 -start-2 w-[15.5rem] rounded-2xl border border-ink-200 bg-white/95 p-3 shadow-pop backdrop-blur sm:-start-8">
              <Link href={`/providers/${featured.id}`} className="flex items-center gap-2.5">
                <Avatar name={featured.name[locale]} accent={featured.accent} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-extrabold text-ink-950">
                    {featured.name[locale]}
                    <BadgeCheck size={13} className="shrink-0 text-brand-600" />
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-ink-500">
                    <Stars value={featured.rating} size={10} />
                    <span className="tnum">{localDigits(featured.rating.toFixed(1), locale)}</span>
                    <span>· {featured.district[locale]}</span>
                  </p>
                </div>
              </Link>
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-brand-50 px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-800">
                  <HomeIcon size={12} />
                  {t("explore.modeHome")}
                </span>
                <span className="tnum text-[11px] font-extrabold text-brand-900">
                  {formatMoney(450000, locale, false)} {t("common.toman")}
                </span>
              </div>
            </div>

            {/* floating deal card */}
            <div className="absolute -end-1 -top-4 w-[13.5rem] rounded-2xl border border-deal-200 bg-white/95 p-3 shadow-pop backdrop-blur sm:-end-6 sm:-top-6">
              <div className="flex items-center gap-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-deal-500 text-white">
                  <Flame size={14} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-ink-950">
                    {deal.serviceName[locale]}
                  </p>
                  <p className="text-[10px] text-ink-500">{deal.district[locale]}</p>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="tnum text-[11px] text-ink-400 line-through">
                  {formatMoney(deal.originalPrice, locale, false)}
                </span>
                <span className="tnum text-base font-extrabold text-deal-600">
                  {formatMoney(deal.dealPrice, locale, false)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-deal-100">
                <div className="h-full w-3/4 rounded-full bg-deal-500" />
              </div>
            </div>

            {/* floating confirmed pill */}
            <div className="absolute -bottom-2 end-2 hidden items-center gap-2 rounded-full border border-emerald-200 bg-white/95 py-2 pe-3.5 ps-2.5 shadow-pop backdrop-blur sm:-end-4 sm:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <CalendarCheck2 size={14} />
              </span>
              <span className="text-xs font-bold text-ink-900">
                {t("status.confirmed")} · ۱۰:۳۰
              </span>
            </div>

            {/* floating rating pill */}
            <div className="absolute -start-3 top-1/3 hidden items-center gap-2 rounded-full border border-ink-200 bg-white/95 py-2 pe-3.5 ps-2.5 shadow-pop backdrop-blur lg:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-deal-100 text-deal-600">
                <Star size={14} className="fill-current" />
              </span>
              <span className="text-xs font-bold text-ink-900">
                {locale === "fa" ? "۴٫۸ میانگین امتیاز" : "4.8 avg rating"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* provider strip */}
      <div className="relative border-t border-ink-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-xs font-semibold text-ink-500 sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-brand-600" />
            {locale === "fa"
              ? "۳۴٪ از نوبت‌ها در محل مشتری انجام می‌شود"
              : "34% of bookings are delivered at the customer's place"}
          </span>
          <span className="hidden h-3 w-px bg-ink-300 sm:block" />
          <ButtonLink href="/provider" variant="ghost" size="xs">
            {t("footer.joinAsProvider")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  valueEn,
  label,
  icon,
}: {
  value: string;
  valueEn: string;
  label: string;
  icon: React.ReactNode;
}) {
  const { locale } = useI18n();
  return (
    <div className={cn("rounded-2xl border border-ink-200/80 bg-white/70 px-3.5 py-3 backdrop-blur")}>
      <span className="flex items-center gap-1.5 text-brand-700">{icon}</span>
      <dd className="tnum mt-1.5 text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl">
        {locale === "fa" ? value : valueEn}
      </dd>
      <dt className="mt-0.5 text-[11px] leading-tight font-medium text-ink-500">{label}</dt>
    </div>
  );
}

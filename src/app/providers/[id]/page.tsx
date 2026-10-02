"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarClock,
  Clock,
  Flame,
  Heart,
  Home,
  Images,
  Info,
  Lock,
  MapPin,
  MessageSquareText,
  Phone,
  Ruler,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TriangleAlert,
  Wallet,
  Zap,
} from "lucide-react";
import { PROVIDERS, reviewsFor } from "@/lib/mock-data";
import { dealsForProvider, discountPercent, minServicePrice, providerDistance } from "@/lib/queries";
import {
  formatClock,
  formatDistance,
  formatDuration,
  formatMoney,
  formatRelative,
  localDigits,
  travelMinutes,
  weekDayLabels,
} from "@/lib/format";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/layout";
import { PortfolioGrid } from "@/components/customer/portfolio-grid";
import { RatingSummary, ReviewList, WriteReviewForm } from "@/components/customer/review-list";
import { DealCard } from "@/components/customer/deal-card";
import { ProviderMiniCard } from "@/components/customer/provider-card";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const ProvidersMap = dynamic(() => import("@/components/map/providers-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-100">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
    </div>
  ),
});

type Tab = "services" | "portfolio" | "reviews" | "about" | "location";

export default function ProviderProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, locale, dir } = useI18n();
  const { deals, userLocation, toggleFavorite, isFavorite, toast } = useStore();
  const [tab, setTab] = useState<Tab>("services");

  const provider = PROVIDERS.find((p) => p.id === params?.id);
  const Arrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (!provider) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <EmptyState
          icon={<Scissors size={28} />}
          title={t("misc.notFoundTitle")}
          body={t("misc.notFoundBody")}
          action={<ButtonLink href="/explore">{t("misc.backHome")}</ButtonLink>}
        />
      </div>
    );
  }

  const providerDeals = dealsForProvider(deals, provider.id);
  const dist = providerDistance(provider, userLocation);
  const from = minServicePrice(provider);
  const fav = isFavorite(provider.id);
  const offersHome = provider.modes.includes("home");
  const insideRadius = offersHome && dist <= provider.homeRadiusKm;

  const similar = PROVIDERS.filter(
    (p) =>
      p.id !== provider.id &&
      p.gender === provider.gender &&
      providerDistance(p, provider) < 6,
  ).slice(0, 4);

  return (
    <div className="pb-10">
      {/* ---------------- cover ---------------- */}
      <div className="relative h-52 w-full overflow-hidden bg-ink-900 sm:h-64 lg:h-80">
        <SmartImage
          src={provider.portfolio[0]?.image ?? "/images/portfolio/salon.jpg"}
          alt=""
          className="absolute inset-0 h-full w-full"
          imgClassName="scale-105 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 flex items-center gap-1.5 rounded-xl border border-white/25 bg-ink-950/45 px-3 py-2 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-ink-950/65 start-4"
        >
          <Arrow size={14} />
          {t("common.back")}
        </button>

        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <div className="flex items-end gap-4">
            <Avatar
              name={tr(provider.name)}
              accent={provider.accent}
              size={76}
              ring
              className="hidden shrink-0 sm:grid"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {tr(provider.name)}
                </h1>
                {provider.verified && (
                  <Badge tone="brand" solid size="sm" icon={<BadgeCheck size={12} />}>
                    {t("card.verified")}
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                <span className="flex items-center gap-1">
                  {provider.kind === "salon" ? <Store size={12} /> : <Sparkles size={12} />}
                  {provider.kind === "salon" ? t("pp.set.kindSalon") : t("pp.set.kindIndependent")}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {tr(provider.district)} · {formatDistance(dist, locale)}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-deal-400 text-deal-400" />
                  <span className="tnum font-bold text-white">
                    {localDigits(provider.rating.toFixed(1), locale)}
                  </span>
                  <span>({localDigits(provider.reviewCount, locale)} {t("card.reviews")})</span>
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => {
                  const added = toggleFavorite(provider.id);
                  toast(added ? t("card.savedToFavorites") : t("favorites.remove"), added ? "success" : "info");
                }}
                aria-pressed={fav}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl border backdrop-blur transition-all active:scale-90",
                  fav
                    ? "border-red-300 bg-red-500 text-white"
                    : "border-white/30 bg-ink-950/40 text-white hover:bg-ink-950/60",
                )}
                aria-label={t("card.saveToFavorites")}
              >
                <Heart size={17} className={fav ? "fill-current" : ""} />
              </button>
              <button
                onClick={() => toast(t("profile.linkCopied"), "info")}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/30 bg-ink-950/40 text-white backdrop-blur transition-colors hover:bg-ink-950/60"
                aria-label={t("profile.shareProfile")}
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- quick facts ---------------- */}
      <div className="border-b border-ink-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:px-8">
          <Fact icon={<Banknote size={14} />} label={t("explore.startsFrom")} value={formatMoney(from, locale)} />
          <Fact icon={<Clock size={14} />} label={t("profile.experienceLabel")} value={`${localDigits(provider.yearsExperience, locale)} ${t("profile.yearsUnit")}`} />
          <Fact icon={<Zap size={14} />} label={t("profile.responseTimeLabel")} value={`${localDigits(provider.responseTimeMin, locale)} ${t("common.min")}`} />
          <Fact icon={<CalendarClock size={14} />} label={t("explore.nextSlot")} value={formatRelative(provider.nextFreeSlot, locale)} tone="brand" />
          <Fact icon={<Home size={14} />} label={t("explore.modeHome")} value={offersHome ? `${localDigits(provider.homeRadiusKm, locale)} ${t("common.km")}` : "—"} tone={offersHome ? "brand" : undefined} />
          <Fact icon={<Wallet size={14} />} label={t("profile.travelFee")} value={offersHome ? formatMoney(provider.travelFee, locale) : "—"} />
        </div>
      </div>

      {/* ---------------- body ---------------- */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="min-w-0">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            className="sticky top-16 z-20 -mx-4 mb-5 bg-white/95 px-4 backdrop-blur lg:top-[72px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
            items={[
              { id: "services", label: t("profile.tabServices"), icon: <Scissors size={14} /> },
              { id: "portfolio", label: t("profile.tabPortfolio"), icon: <Images size={14} />, count: provider.portfolio.length },
              { id: "reviews", label: t("profile.tabReviews"), icon: <MessageSquareText size={14} />, count: provider.reviewCount },
              { id: "about", label: t("profile.tabAbout"), icon: <Info size={14} /> },
              { id: "location", label: t("profile.tabLocation"), icon: <MapPin size={14} /> },
            ]}
          />

          {tab === "services" && (
            <div className="animate-fade-in space-y-5">
              {providerDeals.length > 0 && (
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink-950">
                    <Flame size={15} className="text-deal-500" />
                    {t("profile.dealsOfProvider")}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {providerDeals.map((d) => (
                      <DealCard key={d.id} deal={d} provider={provider} userLocation={userLocation} variant="compact" />
                    ))}
                  </div>
                </section>
              )}

              <section className="card overflow-hidden">
                <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-4 py-3">
                  <h2 className="text-sm font-extrabold text-ink-950">{t("profile.tabServices")}</h2>
                  <span className="text-[11px] font-semibold text-ink-500">
                    {localDigits(provider.services.length, locale)} {t("profile.servicesUnit")}
                  </span>
                </header>
                <ul className="divide-y divide-ink-100">
                  {provider.services.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/30">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
                        <Scissors size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink-950">{tr(s.name)}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatDuration(s.durationMin, locale)}
                          </span>
                          <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-semibold">
                            {t(`cat.${s.categoryId}` as TranslationKey)}
                          </span>
                          {s.homeAvailable ? (
                            <span className="flex items-center gap-1 font-semibold text-brand-700">
                              <Home size={11} />
                              {t("explore.modeHome")}
                              {s.homeSurcharge ? ` +${formatMoney(s.homeSurcharge, locale, false)}` : ""}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-ink-400">
                              <Store size={11} />
                              {t("profile.noHomeService")}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="tnum text-sm font-extrabold text-ink-950">
                          {formatMoney(s.price, locale)}
                        </p>
                        {s.homeAvailable && (
                          <p className="tnum text-[10px] text-ink-400">
                            {t("profile.priceHome")}: {formatMoney(s.price + (s.homeSurcharge ?? 0), locale, false)}
                          </p>
                        )}
                      </div>
                      <ButtonLink
                        href={`/book/${provider.id}?service=${s.id}`}
                        size="xs"
                        variant="outline"
                        className="shrink-0"
                      >
                        {t("card.bookNow")}
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
                <footer className="flex items-start gap-2 border-t border-ink-200 bg-deal-50/60 px-4 py-3 text-[11px] leading-relaxed text-deal-900">
                  <Wallet size={13} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>{t("profile.travelFee")}:</strong> {formatMoney(provider.travelFee, locale)} — {t("profile.travelFeeHint")}
                  </span>
                </footer>
              </section>
            </div>
          )}

          {tab === "portfolio" && (
            <div className="animate-fade-in space-y-4">
              {provider.portfolio.length === 0 ? (
                <EmptyState icon={<Images size={28} />} title={t("profile.portfolioEmpty")} />
              ) : (
                <PortfolioGrid items={provider.portfolio} columns={3} />
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="animate-fade-in space-y-4">
              <RatingSummary reviews={providerReviews(provider.id)} />
              <WriteReviewForm />
              <ReviewList reviews={providerReviews(provider.id)} />
            </div>
          )}

          {tab === "about" && (
            <div className="animate-fade-in space-y-4">
              <section className="card p-5">
                <h2 className="text-sm font-extrabold text-ink-950">{t("profile.aboutTitle")}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-700">{tr(provider.bio)}</p>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  <InfoRow icon={<Clock size={14} />} label={t("profile.experienceLabel")} value={`${localDigits(provider.yearsExperience, locale)} ${t("profile.yearsUnit")}`} />
                  <InfoRow icon={<Star size={14} />} label={t("profile.bookingsLabel")} value={localDigits(provider.bookingsCount, locale)} />
                  <InfoRow icon={<ShieldCheck size={14} />} label={t("footer.safety")} value={provider.verified ? t("card.verified") : t("ad.pend.docs")} tone={provider.verified ? "ok" : "warn"} />
                  <InfoRow icon={<Zap size={14} />} label={t("card.instant")} value={provider.acceptsInstant ? t("common.active") : t("common.inactive")} tone={provider.acceptsInstant ? "ok" : undefined} />
                </div>

                {(provider.seniorFriendly || provider.accessibilityTrained) && (
                  <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border border-violet-200 bg-violet-50/60 p-3.5">
                    {provider.seniorFriendly && (
                      <Badge tone="violet" size="md" icon={<Accessibility size={13} />}>
                        {t("card.seniorFriendly")}
                      </Badge>
                    )}
                    {provider.accessibilityTrained && (
                      <Badge tone="info" size="md" icon={<Accessibility size={13} />}>
                        {t("card.accessibility")}
                      </Badge>
                    )}
                  </div>
                )}
              </section>

              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                  <Clock size={14} className="text-brand-600" />
                  {t("profile.workingHours")}
                </h2>
                <ul className="mt-3 divide-y divide-ink-100">
                  {weekDayLabels(locale).map((d) => {
                    const wh = provider.workingHours.find((w) => w.day === d.index);
                    const closed = !wh || wh.closed;
                    return (
                      <li key={d.index} className="flex items-center justify-between py-2 text-sm">
                        <span className={cn("font-semibold", closed ? "text-ink-400" : "text-ink-800")}>
                          {d.label}
                        </span>
                        <span className={cn("tnum font-bold", closed ? "text-ink-400" : "text-ink-900")}>
                          {closed
                            ? t("pp.set.closedDay")
                            : `${formatClock(wh!.open, locale)} — ${formatClock(wh!.close, locale)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          )}

          {tab === "location" && (
            <div className="animate-fade-in space-y-4">
              <section className="card overflow-hidden">
                <div className="h-72 w-full sm:h-80">
                  <ProvidersMap
                    providers={[provider]}
                    deals={[]}
                    showDeals={false}
                    userLocation={userLocation}
                    radiusKm={offersHome ? provider.homeRadiusKm : null}
                    fitToMarkers
                    zoom={13}
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-xs font-bold text-ink-500">{t("profile.address")}</p>
                    <p className="mt-1 text-sm font-semibold text-ink-900">{tr(provider.address)}</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-600">
                    <Lock size={13} className="mt-0.5 shrink-0 text-brand-600" />
                    {t("profile.exactAddressHidden")}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <InfoRow icon={<Ruler size={14} />} label={t("profile.distanceLabel")} value={formatDistance(dist, locale)} />
                    <InfoRow icon={<Clock size={14} />} label={t("profile.travelTimeLabel")} value={`${localDigits(travelMinutes(dist), locale)} ${t("common.min")}`} />
                  </div>
                  {offersHome && (
                    <div
                      className={cn(
                        "flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed",
                        insideRadius
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-amber-200 bg-amber-50 text-amber-900",
                      )}
                    >
                      {insideRadius ? <ShieldCheck size={15} className="mt-0.5 shrink-0" /> : <TriangleAlert size={15} className="mt-0.5 shrink-0" />}
                      <span>
                        <strong>{t("profile.homeRadius")}:</strong>{" "}
                        {t("profile.homeRadiusValue", { km: localDigits(provider.homeRadiusKm, locale) })}
                        {" — "}
                        {insideRadius ? t("profile.insideRadius") : t("profile.outsideRadius")}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* ---------------- sidebar ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-ink-200 bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
              <p className="text-[11px] font-semibold text-white/70">{t("explore.nextSlot")}</p>
              <p className="tnum mt-0.5 text-lg font-extrabold">
                {formatRelative(provider.nextFreeSlot, locale)}
              </p>
              <p className="tnum mt-1 text-xs text-white/75">
                {formatMoney(from, locale)} · {t("explore.startsFrom")}
              </p>
            </div>
            <div className="space-y-2 p-4">
              {provider.modes.includes("salon") && (
                <ButtonLink href={`/book/${provider.id}?mode=salon`} fullWidth icon={<Store size={15} />}>
                  {t("profile.bookSalon")}
                </ButtonLink>
              )}
              {offersHome && (
                <ButtonLink
                  href={`/book/${provider.id}?mode=home`}
                  fullWidth
                  variant={provider.modes.includes("salon") ? "secondary" : "primary"}
                  icon={<Home size={15} />}
                >
                  {t("profile.bookHome")}
                </ButtonLink>
              )}
              {!offersHome && (
                <div className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-500">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  {t("booking.whereHomeDisabled")}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" icon={<Phone size={14} />} onClick={() => toast(t("profile.callMaskedHint"), "info")}>
                  {t("profile.call")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  icon={<TriangleAlert size={14} />}
                  onClick={() => toast(t("profile.reportSent"), "warn")}
                >
                  {t("common.report")}
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 border-t border-ink-200 bg-ink-50 px-4 py-3 text-[11px] leading-relaxed text-ink-600">
              <Lock size={13} className="mt-0.5 shrink-0 text-brand-600" />
              {t("profile.callMaskedHint")}
            </div>
          </div>

          {providerDeals.length > 0 && (
            <div className="rounded-2xl border border-deal-200 bg-deal-50/60 p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-deal-900">
                <Flame size={14} />
                {t("deals.badge")}
              </p>
              {providerDeals.map((d) => (
                <div key={d.id} className="mt-2.5 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink-950">{tr(d.serviceName)}</p>
                    <p className="tnum text-[11px] text-ink-500">
                      <span className="line-through">{formatMoney(d.originalPrice, locale, false)}</span>
                      {" → "}
                      <span className="font-extrabold text-deal-600">{formatMoney(d.dealPrice, locale, false)}</span>
                    </p>
                  </div>
                  <Badge tone="deal" solid size="sm">
                    {localDigits(discountPercent(d), locale)}٪
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="card p-4">
            <h3 className="text-xs font-extrabold text-ink-950">{t("footer.safety")}</h3>
            <ul className="mt-2.5 space-y-2">
              {[
                { icon: <ShieldCheck size={13} />, text: t("card.verified") },
                { icon: <Lock size={13} />, text: t("profile.exactAddressHidden") },
                { icon: <Phone size={13} />, text: t("booking.supportLine") },
              ].map((row, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-600">
                  <span className="mt-0.5 shrink-0 text-brand-600">{row.icon}</span>
                  {row.text}
                </li>
              ))}
            </ul>
          </div>

          {similar.length > 0 && (
            <div className="card p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-ink-950">{t("profile.similarProviders")}</h3>
                <Link href="/explore" className="text-[11px] font-bold text-brand-700 hover:text-brand-800">
                  {t("common.viewAll")}
                </Link>
              </div>
              <div className="space-y-1.5">
                {similar.map((p) => (
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
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function providerReviews(providerId: string) {
  return reviewsFor(providerId);
}

function Fact({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "brand";
}) {
  return (
    <div className={cn("rounded-xl border p-2.5", tone === "brand" ? "border-brand-200 bg-brand-50" : "border-ink-200 bg-ink-50")}>
      <p className={cn("flex items-center gap-1 truncate text-[10px] font-bold", tone === "brand" ? "text-brand-700" : "text-ink-500")}>
        {icon}
        {label}
      </p>
      <p className="tnum mt-1 truncate text-xs font-extrabold text-ink-950 sm:text-sm">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5">
      <span className={cn("shrink-0", tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-ink-400")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-ink-500">{label}</span>
      <span className="tnum shrink-0 text-xs font-extrabold text-ink-900">{value}</span>
    </div>
  );
}

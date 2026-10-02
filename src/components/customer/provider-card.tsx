"use client";

import Link from "next/link";
import {
  Accessibility,
  BadgeCheck,
  CalendarClock,
  Heart,
  Home,
  MapPin,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import type { FlashDeal, Provider } from "@/types";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import {
  bestDeal,
  dealsForProvider,
  discountPercent,
  minServicePrice,
  providerDistance,
} from "@/lib/queries";
import {
  formatDistance,
  formatMoney,
  formatRelative,
  localDigits,
  travelMinutes,
} from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/rating";
import { SmartImage } from "@/components/ui/smart-image";

export function ProviderCard({
  provider,
  deals,
  userLocation,
  active,
  onHover,
  onClick,
  showImage = true,
  className,
}: {
  provider: Provider;
  deals: FlashDeal[];
  userLocation: { lat: number; lng: number };
  active?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: () => void;
  showImage?: boolean;
  className?: string;
}) {
  const { t, tr, locale, senior } = useI18n();
  const { toggleFavorite, isFavorite } = useStore();

  const dist = providerDistance(provider, userLocation);
  const from = minServicePrice(provider);
  const deal = bestDeal(deals, provider.id);
  const fav = isFavorite(provider.id);

  return (
    <article
      onMouseEnter={() => onHover?.(provider.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={onClick}
      className={cn(
        "group card relative overflow-hidden transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-pop",
        active && "ring-2 ring-brand-600 ring-offset-2 ring-offset-ink-50",
        senior && "rounded-2xl",
        className,
      )}
    >
      <div className="flex gap-3.5 p-3.5 sm:p-4">
        {showImage && (
          <Link
            href={`/providers/${provider.id}`}
            className="relative hidden shrink-0 sm:block"
            tabIndex={-1}
            aria-hidden="true"
          >
            <SmartImage
              src={provider.portfolio[0]?.image ?? "/images/portfolio/salon.jpg"}
              alt=""
              className="h-[104px] w-[104px] rounded-2xl"
            />
            {deal && (
              <span className="absolute -top-1.5 -start-1.5 grid h-7 w-7 place-items-center rounded-full bg-deal-500 text-[10px] font-extrabold text-white shadow-md ring-2 ring-white">
                {localDigits(discountPercent(deal), locale)}٪
              </span>
            )}
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <Link
              href={`/providers/${provider.id}`}
              className="flex min-w-0 flex-1 items-start gap-3"
            >
              <Avatar
                name={tr(provider.name)}
                accent={provider.accent}
                size={senior ? 52 : 44}
                className="sm:hidden"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-[15px] font-extrabold text-ink-950 sm:text-base">
                    {tr(provider.name)}
                  </span>
                  {provider.verified && (
                    <BadgeCheck size={15} className="shrink-0 text-brand-600" />
                  )}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    {provider.kind === "salon" ? <Store size={12} /> : <Sparkles size={12} />}
                    {tr(provider.district)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {formatDistance(dist, locale)} · {localDigits(travelMinutes(dist), locale)}{" "}
                    {locale === "fa" ? "دقیقه" : "min"}
                  </span>
                </span>
              </span>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(provider.id);
              }}
              aria-label={t("card.saveToFavorites")}
              aria-pressed={fav}
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all active:scale-90",
                fav
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-ink-200 bg-white text-ink-400 hover:border-ink-300 hover:text-red-500",
              )}
            >
              <Heart size={16} className={fav ? "fill-current" : ""} />
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Stars value={provider.rating} size={14} />
              <span className="tnum text-xs font-bold text-ink-900">
                {localDigits(provider.rating.toFixed(1), locale)}
              </span>
              <span className="tnum text-xs text-ink-400">
                ({localDigits(provider.reviewCount, locale)} {t("card.reviews")})
              </span>
            </span>
            <span className="text-xs text-ink-400">
              {t("card.years", { n: localDigits(provider.yearsExperience, locale) })}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {provider.modes.includes("home") && (
              <Badge tone="brand" size="sm" icon={<Home size={12} />}>
                {t("explore.modeHome")}
              </Badge>
            )}
            {provider.modes.includes("salon") && (
              <Badge tone="neutral" size="sm" icon={<Store size={12} />}>
                {t("explore.modeSalon")}
              </Badge>
            )}
            {provider.seniorFriendly && (
              <Badge tone="violet" size="sm" icon={<Accessibility size={12} />}>
                {t("card.seniorFriendly")}
              </Badge>
            )}
            {provider.accessibilityTrained && (
              <Badge tone="info" size="sm" icon={<Accessibility size={12} />}>
                {t("card.accessibility")}
              </Badge>
            )}
            {provider.acceptsInstant && (
              <Badge tone="deal" size="sm" icon={<Zap size={12} />}>
                {t("card.instant")}
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-ink-100 pt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-ink-400">{t("explore.startsFrom")}</p>
              <p className="tnum text-base font-extrabold text-ink-950">
                {formatMoney(from, locale)}
              </p>
              {deal && (
                <p className="tnum mt-0.5 text-[11px] text-ink-400 line-through">
                  {formatMoney(deal.originalPrice, locale)}
                </p>
              )}
            </div>

            <div className="text-end">
              <p className="flex items-center justify-end gap-1 text-[11px] font-medium text-ink-400">
                <CalendarClock size={12} />
                {t("explore.nextSlot")}
              </p>
              <p className="text-xs font-bold text-brand-700">
                {formatRelative(provider.nextFreeSlot, locale)}
              </p>
              {dealsForProvider(deals, provider.id).length > 0 && (
                <p className="tnum mt-0.5 text-[11px] font-bold text-deal-600">
                  {t("deals.save", {
                    percent: localDigits(discountPercent(deal!), locale),
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              href={`/providers/${provider.id}`}
              className="flex h-9 flex-1 items-center justify-center rounded-lg border border-ink-300 bg-white px-3 text-xs font-bold text-ink-800 transition-colors hover:border-ink-400 hover:bg-ink-50"
            >
              {t("card.viewProfile")}
            </Link>
            <Link
              href={`/book/${provider.id}`}
              className={cn(
                "flex h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold text-white transition-colors",
                deal ? "bg-deal-500 hover:bg-deal-600" : "bg-brand-600 hover:bg-brand-700",
              )}
            >
              {deal ? t("deals.bookDeal") : t("card.bookNow")}
            </Link>
          </div>
        </div>
      </div>

      {!provider.openNow && (
        <span className="absolute inset-x-0 top-0 bg-ink-900/85 py-1 text-center text-[10px] font-bold text-white">
          {t("card.closed")}
        </span>
      )}
    </article>
  );
}

/** Compact row used inside the map side-list on desktop. */
export function ProviderMiniCard({
  provider,
  deals,
  userLocation,
  active,
  onSelect,
}: {
  provider: Provider;
  deals: FlashDeal[];
  userLocation: { lat: number; lng: number };
  active?: boolean;
  onSelect: () => void;
}) {
  const { locale, tr, t } = useI18n();
  const dist = providerDistance(provider, userLocation);
  const deal = bestDeal(deals, provider.id);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-2.5 text-start transition-all",
        active
          ? "border-brand-600 bg-brand-50 shadow-sm"
          : "border-transparent bg-white hover:border-ink-200 hover:bg-ink-50",
      )}
    >
      <Avatar name={tr(provider.name)} accent={provider.accent} size={38} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate text-sm font-bold text-ink-950">{tr(provider.name)}</span>
          {provider.verified && <BadgeCheck size={13} className="shrink-0 text-brand-600" />}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-500">
          <Stars value={provider.rating} size={11} />
          <span className="tnum">{localDigits(provider.rating.toFixed(1), locale)}</span>
          <span>·</span>
          <span className="tnum">{formatDistance(dist, locale)}</span>
        </span>
      </span>
      <span className="shrink-0 text-end">
        <span className="tnum block text-xs font-extrabold text-ink-950">
          {formatMoney(minServicePrice(provider), locale, false)}
        </span>
        {deal ? (
          <span className="tnum mt-0.5 block rounded-full bg-deal-100 px-1.5 py-0.5 text-[10px] font-bold text-deal-700">
            {localDigits(discountPercent(deal), locale)}٪ {t("deals.badge")}
          </span>
        ) : (
          <span className="mt-0.5 block text-[10px] text-ink-400">{t("common.toman")}</span>
        )}
      </span>
    </button>
  );
}

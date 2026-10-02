"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Flame, MapPin, Percent, Sparkles, Tag, Users } from "lucide-react";
import type { FlashDeal, Provider } from "@/types";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import { discountPercent } from "@/lib/queries";
import {
  formatCountdown,
  formatDateShort,
  formatDistance,
  formatMoney,
  formatTime,
  localDigits,
} from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Stars } from "@/components/ui/rating";

export function DealCard({
  deal,
  provider,
  userLocation,
  variant = "default",
  className,
}: {
  deal: FlashDeal;
  provider?: Provider;
  userLocation?: { lat: number; lng: number };
  variant?: "default" | "compact";
  className?: string;
}) {
  const { t, tr, locale } = useI18n();
  const [now, setNow] = useState(() => new Date());
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      force((n) => n + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pct = discountPercent(deal);
  const expired = new Date(deal.dateISO).getTime() < now.getTime();
  const soldOut = deal.remaining <= 0;
  const dist = userLocation
    ? formatDistance(
        Math.hypot(
          (deal.lat - userLocation.lat) * 111,
          (deal.lng - userLocation.lng) * 111 * Math.cos((deal.lat * Math.PI) / 180),
        ),
        locale,
      )
    : null;

  return (
    <article
      className={cn(
        "card group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop",
        (expired || soldOut) && "opacity-60 grayscale-[35%]",
        className,
      )}
    >
      {/* discount ribbon */}
      <div className="absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-deal-400 to-deal-600" />
      <div className="absolute -top-8 -end-8 h-24 w-24 rounded-full bg-deal-50 transition-transform duration-300 group-hover:scale-125" />

      <div className={cn("relative p-4 ps-5", variant === "compact" && "p-3.5 ps-4.5")}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="deal" solid size="sm" icon={<Flame size={11} />}>
                {t("deals.badge")}
              </Badge>
              <span className="tnum rounded-full bg-ink-950 px-2 py-0.5 text-[11px] font-extrabold text-white">
                {localDigits(pct, locale)}٪ {locale === "fa" ? "تخفیف" : "OFF"}
              </span>
            </div>

            <h3 className="mt-2 truncate text-[15px] font-extrabold text-ink-950">
              {tr(deal.serviceName)}
            </h3>

            {provider && (
              <Link
                href={`/providers/${provider.id}`}
                className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 hover:text-brand-700"
              >
                <Avatar name={tr(provider.name)} accent={provider.accent} size={18} />
                <span className="truncate font-semibold">{tr(provider.name)}</span>
                <span className="flex items-center gap-0.5">
                  <Stars value={provider.rating} size={10} />
                  <span className="tnum">{localDigits(provider.rating.toFixed(1), locale)}</span>
                </span>
              </Link>
            )}
          </div>

          <div className="shrink-0 text-end">
            <p className="tnum text-[11px] text-ink-400 line-through">
              {formatMoney(deal.originalPrice, locale, false)}
            </p>
            <p className="tnum text-lg font-extrabold text-deal-600 sm:text-xl">
              {formatMoney(deal.dealPrice, locale, false)}
            </p>
            <p className="text-[10px] font-medium text-ink-400">{t("common.toman")}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Meta icon={<Clock3 size={12} />} label={t("misc.date")} value={`${formatDateShort(deal.dateISO, locale)} · ${formatTime(deal.dateISO, locale)}`} />
          <Meta icon={<MapPin size={12} />} label={t("misc.districtLabel")} value={dist ? `${tr(deal.district)} · ${dist}` : tr(deal.district)} />
          <Meta icon={<Users size={12} />} label={t("deals.capacityLabel")} value={`${localDigits(deal.remaining, locale)} / ${localDigits(deal.capacity, locale)}`} />
          <Meta icon={<Tag size={12} />} label={t("deals.radiusLabel")} value={`${localDigits(deal.radiusKm, locale)} ${t("common.km")}`} />
        </div>

        <div className="mt-3.5 rounded-xl border border-deal-200 bg-deal-50/70 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-deal-800">
              <Sparkles size={12} />
              {expired || soldOut ? t("deals.expired") : t("deals.endsIn")}
            </span>
            <span className="tnum rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-deal-700 ring-1 ring-deal-200">
              {expired || soldOut ? "—" : formatCountdown(deal.dateISO, locale, now)}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-deal-200">
            <div
              className="h-full rounded-full bg-deal-500 transition-all duration-500"
              style={{ width: `${(deal.remaining / deal.capacity) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-deal-800">
            {soldOut
              ? t("deals.soldOut")
              : t("deals.capacity", {
                  remaining: localDigits(deal.remaining, locale),
                  total: localDigits(deal.capacity, locale),
                })}
          </p>
        </div>

        {variant === "default" && (
          <details className="group/details mt-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-bold text-ink-500 transition-colors hover:text-ink-800">
              <Percent size={12} />
              {t("deals.conditions")}
              <span className="transition-transform group-open/details:rotate-180">▾</span>
            </summary>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-600">
              {tr(deal.cancellationNote)} · {t("deals.autoDeactivate")}
            </p>
          </details>
        )}

        <div className="mt-3.5 flex gap-2">
          <ButtonLink
            href={`/book/${deal.providerId}?deal=${deal.id}`}
            variant="deal"
            size="sm"
            className="flex-1"
            aria-disabled={expired || soldOut}
            onClick={(e) => {
              if (expired || soldOut) e.preventDefault();
            }}
          >
            {t("deals.bookDeal")}
          </ButtonLink>
          <Button variant="outline" size="sm" className="flex-1">
            {t("deals.notifyMe")}
          </Button>
        </div>
      </div>
    </article>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-ink-50 px-2 py-1.5">
      <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-ink-400">
        {icon}
        {label}
      </p>
      <p className="tnum mt-0.5 truncate text-[11px] font-bold text-ink-800">{value}</p>
    </div>
  );
}

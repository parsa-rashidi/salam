"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  Flame,
  Info,
  MapPinned,
  Megaphone,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/layout";
import { Tabs } from "@/components/ui/tabs";
import { DealCard } from "@/components/customer/deal-card";
import { formatMoney, localDigits } from "@/lib/format";
import { isDealActive } from "@/lib/queries";
import { cn } from "@/lib/cn";

type Tab = "active" | "scheduled" | "ended";

export default function ProviderDealsPage() {
  const { t, tr, locale } = useI18n();
  const { deals, deactivateDeal, toast, userLocation } = useStore();
  const [tab, setTab] = useState<Tab>("active");
  const [removing, setRemoving] = useState<string | null>(null);

  const mine = deals.filter((d) => d.providerId === "p1");
  const now = new Date();

  const groups: Record<Tab, typeof mine> = {
    active: mine.filter((d) => isDealActive(d)),
    scheduled: mine.filter((d) => new Date(d.dateISO).getTime() > now.getTime() && d.remaining > 0 && !isDealActive(d)),
    ended: mine.filter((d) => d.remaining <= 0 || new Date(d.dateISO).getTime() <= now.getTime()),
  };

  const list = groups[tab];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-50 text-deal-700">
          <Flame size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.deal.title")}</h1>
          <p className="text-xs text-ink-500">{t("pp.deal.subtitle")}</p>
        </div>
        <ButtonLink href="/provider/deals/new" variant="deal" size="md" icon={<Plus size={15} />}>
          {t("pp.deal.createNew")}
        </ButtonLink>
      </div>

      {/* example */}
      <div className="flex items-start gap-3 rounded-2xl border border-deal-200 bg-deal-50/70 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-deal-500 text-white">
          <Sparkles size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-deal-900">{t("deals.badge")}</p>
          <p className="mt-1 text-xs leading-relaxed text-deal-800">{t("pp.deal.example")}</p>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat icon={<Flame size={15} />} label={t("pp.deal.active")} value={localDigits(groups.active.length, locale)} tone="deal" />
        <MiniStat icon={<Eye size={15} />} label={t("pp.deal.views")} value={localDigits(486, locale)} tone="brand" />
        <MiniStat icon={<Users size={15} />} label={locale === "fa" ? "رزرو از تخفیف" : "Bookings from deals"} value={localDigits(23, locale)} tone="violet" />
        <MiniStat icon={<TrendingUp size={15} />} label={locale === "fa" ? "نرخ تبدیل" : "Conversion"} value={`${localDigits(18, locale)}٪`} tone="neutral" />
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: "active", label: t("pp.deal.active"), count: localDigits(groups.active.length, locale) },
          { id: "scheduled", label: t("pp.deal.scheduled"), count: localDigits(groups.scheduled.length, locale) },
          { id: "ended", label: t("pp.deal.ended"), count: localDigits(groups.ended.length, locale) },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Flame size={28} />}
          title={t("pp.deal.empty")}
          body={t("pp.deal.subtitle")}
          action={
            <ButtonLink href="/provider/deals/new" variant="deal" size="sm" icon={<Plus size={14} />}>
              {t("pp.deal.createNew")}
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((d) => (
            <div key={d.id} className="space-y-2">
              <DealCard deal={d} userLocation={userLocation} />

              <div className="card flex flex-wrap items-center gap-2 p-3">
                <Badge tone="neutral" size="sm" icon={<MapPinned size={11} />}>
                  {t("deals.visibilityRadius", { km: localDigits(d.radiusKm, locale) })}
                </Badge>
                <Badge tone="brand" size="sm" icon={<Eye size={11} />}>
                  {localDigits(120 + d.remaining * 40, locale)} {t("pp.deal.views")}
                </Badge>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="xs"
                  icon={<Megaphone size={12} />}
                  onClick={() =>
                    toast(
                      locale === "fa"
                        ? "درخواست نمایش گسترده ثبت شد؛ مبلغ ۴۵٬۰۰۰ تومان از کیف پول کسر می‌شود."
                        : "Boost request recorded — 45,000 Toman will be charged to your wallet.",
                      "info",
                    )
                  }
                >
                  {t("pp.deal.boost")}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-red-600 hover:bg-red-50"
                  icon={<Trash2 size={12} />}
                  onClick={() => setRemoving(d.id)}
                >
                  {t("ad.deal.deactivate")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* boost explainer */}
      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
          <Megaphone size={15} className="text-deal-600" />
          {t("pp.deal.boost")}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-600">{t("pp.deal.boostHint")}</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {[
            { name: { fa: "پایه", en: "Basic" }, fee: 0, reach: 3 },
            { name: { fa: "محله", en: "Neighborhood" }, fee: 45_000, reach: 8 },
            { name: { fa: "شهر", en: "City-wide" }, fee: 120_000, reach: 25 },
          ].map((p) => (
            <div
              key={p.name.en}
              className={cn(
                "rounded-2xl border p-3.5 transition-colors",
                p.fee === 0 ? "border-brand-300 bg-brand-50/60" : "border-ink-200 bg-white",
              )}
            >
              <p className="text-xs font-extrabold text-ink-950">{tr(p.name)}</p>
              <p className="tnum mt-1 text-sm font-black text-deal-600">
                {p.fee === 0 ? t("common.free") : formatMoney(p.fee, locale)}
              </p>
              <p className="tnum mt-1 text-[11px] text-ink-500">
                {localDigits(p.reach, locale)} {t("common.km")} ·{" "}
                {localDigits(p.reach * 320, locale)} {locale === "fa" ? "کاربر" : "users"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-2.5 rounded-2xl border border-ink-200 bg-ink-50 p-4 text-[11px] leading-relaxed text-ink-600">
        <Info size={14} className="mt-0.5 shrink-0 text-brand-600" />
        <span>
          {t("pp.deal.autoNote")}{" "}
          <Link href="/provider/calendar" className="font-bold text-brand-700 hover:underline">
            {t("pp.calendar")}
          </Link>
        </span>
      </div>

      <ConfirmModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={t("ad.deal.deactivate")}
        body={t("deals.autoDeactivate")}
        confirmLabel={t("ad.deal.deactivate")}
        onConfirm={() => {
          if (removing) deactivateDeal(removing);
          toast(locale === "fa" ? "پیشنهاد غیرفعال شد." : "Offer deactivated.", "warn");
        }}
      />
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "deal" | "brand" | "violet" | "neutral";
}) {
  const tones = {
    deal: "bg-deal-50 text-deal-700",
    brand: "bg-brand-50 text-brand-700",
    violet: "bg-violet-50 text-violet-700",
    neutral: "bg-ink-100 text-ink-700",
  }[tone];
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones)}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-ink-500">{label}</p>
        <p className="tnum truncate text-base font-black text-ink-950">{value}</p>
      </div>
    </div>
  );
}

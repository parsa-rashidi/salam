"use client";

import Link from "next/link";
import {
  Accessibility,
  ArrowUpRight,
  Bell,
  CalendarPlus,
  Check,
  Clock,
  Eye,
  Flame,
  Home,
  Inbox,
  MapPin,
  Percent,
  Plus,
  Scissors,
  Star,
  Store,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatCard, EmptyState } from "@/components/ui/layout";
import { Toggle } from "@/components/ui/field";
import { BarChart, ShareBar } from "@/components/ui/chart";
import { Stars } from "@/components/ui/rating";
import {
  formatClock,
  formatDateShort,
  formatMoney,
  formatMoneyShort,
  formatRelative,
  localDigits,
} from "@/lib/format";
import { discountPercent, isDealActive } from "@/lib/queries";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

export default function ProviderDashboardPage() {
  const { t, tr, locale } = useI18n();
  const { calendar, requests, setRequestStatus, deals, settings, updateSettings, toast, notifications } =
    useStore();

  const today = calendar.find((d) => d.offset === 0) ?? calendar[1];
  const confirmedToday = today.slots.filter((s) => s.state === "confirmed");
  const pending = requests.filter((r) => r.status === "requested");
  const activeDeals = deals.filter((d) => d.providerId === "p1" && isDealActive(d));
  const freeThisWeek = calendar.reduce(
    (n, d) => n + d.slots.filter((s) => s.state === "free").length,
    0,
  );

  const weekSeries = calendar.map((d) => d.slots.filter((s) => s.state !== "free").length);
  const weekLabels = calendar.map((d) => formatDateShort(d.iso, locale));

  const homeShare = requests.filter((r) => r.mode === "home").length || 1;
  const salonShare = requests.filter((r) => r.mode === "salon").length || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* ---------------- KPIs ---------------- */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label={t("pp.statToday")}
          value={localDigits(confirmedToday.length, locale)}
          icon={<CalendarPlus size={16} />}
          delta={{ value: 12 }}
        />
        <StatCard
          label={t("pp.statPending")}
          value={localDigits(pending.length, locale)}
          icon={<Inbox size={16} />}
          tone="deal"
          className={cn(pending.length > 0 && "ring-2 ring-deal-200")}
        />
        <StatCard
          label={t("pp.statWeekIncome")}
          value={formatMoneyShort(18_450_000, locale)}
          icon={<Wallet size={16} />}
          tone="violet"
          delta={{ value: 8.6, label: t("misc.vsLastMonth") }}
        />
        <StatCard
          label={t("pp.statRating")}
          value={localDigits((4.9).toFixed(1), locale)}
          icon={<Star size={16} />}
          delta={{ value: 2.1 }}
        />
        <StatCard
          label={t("pp.statFreeSlots")}
          value={localDigits(freeThisWeek, locale)}
          icon={<Clock size={16} />}
        />
        <StatCard
          label={t("pp.statProfileViews")}
          value={localDigits(1284, locale)}
          icon={<Eye size={16} />}
          tone="neutral"
          delta={{ value: 21.4 }}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* ---------------- left column ---------------- */}
        <div className="min-w-0 space-y-5">
          {/* pending requests */}
          <section className="card overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <Inbox size={15} className="text-deal-600" />
                {t("pp.req.title")}
                {pending.length > 0 && (
                  <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-deal-500 px-1.5 text-[10px] font-bold text-white">
                    {localDigits(pending.length, locale)}
                  </span>
                )}
              </h2>
              <Link href="/provider/requests" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800">
                {t("common.viewAll")}
                <ArrowUpRight size={13} />
              </Link>
            </header>

            {pending.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<Check size={26} />} title={t("pp.req.empty")} className="border-0 bg-transparent py-6" />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {pending.slice(0, 3).map((r) => (
                  <li key={r.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={tr(r.customer)} accent={r.avatarAccent} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-extrabold text-ink-950">{tr(r.customer)}</p>
                          {r.senior && (
                            <Badge tone="violet" size="sm" icon={<Accessibility size={11} />}>
                              {t("pp.req.seniorBadge")}
                            </Badge>
                          )}
                          <Badge tone={r.mode === "home" ? "brand" : "neutral"} size="sm" icon={r.mode === "home" ? <Home size={11} /> : <Store size={11} />}>
                            {r.mode === "home" ? t("misc.home") : t("misc.salon")}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-ink-600">{tr(r.service)}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                          <span className="tnum flex items-center gap-1">
                            <Clock size={11} />
                            {formatDateShort(r.dateISO, locale)} · {formatClock(hhmm(r.dateISO), locale)}
                          </span>
                          <span className="tnum flex items-center gap-1">
                            <MapPin size={11} />
                            {localDigits(r.distanceKm.toFixed(1), locale)} {t("common.km")}
                          </span>
                          <span className="tnum flex items-center gap-1 font-bold text-brand-700">
                            <Wallet size={11} />
                            {formatMoney(r.price + r.travelFee, locale)}
                          </span>
                        </div>
                        {r.notes && (
                          <p className="mt-2 line-clamp-2 rounded-lg border-s-2 border-violet-300 bg-violet-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-violet-900">
                            {tr(r.notes)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        icon={<Check size={14} />}
                        onClick={() => {
                          setRequestStatus(r.id, "confirmed");
                          toast(t("pp.req.accepted"), "success");
                        }}
                      >
                        {t("pp.req.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Zap size={14} />}
                        onClick={() => {
                          setRequestStatus(r.id, "countered", "18:30");
                          toast(t("pp.req.countered"), "info");
                        }}
                      >
                        {t("pp.req.counter")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<X size={14} />}
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setRequestStatus(r.id, "rejected");
                          toast(t("pp.req.rejected"), "warn");
                        }}
                      >
                        {t("pp.req.reject")}
                      </Button>
                      <div className="flex-1" />
                      <ButtonLink href="/provider/requests" size="sm" variant="ghost">
                        {t("common.details")}
                      </ButtonLink>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* today's schedule */}
          <section className="card overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <Clock size={15} className="text-brand-600" />
                {t("pp.todaySchedule")}
              </h2>
              <Link href="/provider/calendar" className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800">
                {t("pp.calendar")}
                <ArrowUpRight size={13} />
              </Link>
            </header>

            {today.slots.filter((s) => s.state !== "free").length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<CalendarPlus size={26} />}
                  title={t("pp.noAppointmentsToday")}
                  action={
                    <ButtonLink href="/provider/deals/new" variant="deal" size="sm" icon={<Flame size={14} />}>
                      {t("pp.newDeal")}
                    </ButtonLink>
                  }
                  className="border-0 bg-transparent py-6"
                />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {today.slots
                  .filter((s) => s.state !== "free")
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="tnum w-14 shrink-0 text-xs font-extrabold text-ink-900">
                        {formatClock(s.time, locale)}
                      </span>
                      <span
                        className={cn(
                          "h-9 w-1 shrink-0 rounded-full",
                          s.state === "confirmed" && "bg-emerald-500",
                          s.state === "requested" && "bg-sky-500",
                          s.state === "blocked" && "bg-ink-400",
                          s.state === "free" && "bg-ink-200",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink-900">
                          {s.customer ?? (s.state === "blocked" ? t("status.blocked") : t("status.free"))}
                        </p>
                        {s.service && <p className="truncate text-[11px] text-ink-500">{s.service}</p>}
                      </div>
                      {s.mode && (
                        <Badge tone={s.mode === "home" ? "brand" : "neutral"} size="sm" icon={s.mode === "home" ? <Home size={11} /> : <Store size={11} />}>
                          {s.mode === "home" ? t("misc.home") : t("misc.salon")}
                        </Badge>
                      )}
                      <Badge
                        tone={
                          s.state === "confirmed" ? "success" : s.state === "requested" ? "info" : "neutral"
                        }
                        size="sm"
                      >
                        {t(
                          s.state === "free"
                            ? "status.free"
                            : s.state === "blocked"
                              ? "status.blocked"
                              : (`status.${s.state}` as TranslationKey),
                        )}
                      </Badge>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {/* charts */}
          <div className="grid gap-5 sm:grid-cols-2">
            <section className="card p-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <TrendingUp size={15} className="text-brand-600" />
                {t("misc.thisWeek")}
              </h2>
              <div className="mt-4">
                <BarChart
                  data={weekSeries}
                  labels={weekLabels}
                  height={120}
                  valueFormatter={(v) => `${v} ${locale === "fa" ? "نوبت" : "bookings"}`}
                />
              </div>
            </section>

            <section className="card p-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <Percent size={15} className="text-deal-600" />
                {t("ad.chartSplit")}
              </h2>
              <div className="mt-5">
                <ShareBar
                  segments={[
                    { label: t("ad.chartSplitHome"), value: homeShare, color: "var(--color-brand-500)" },
                    { label: t("ad.chartSplitSalon"), value: salonShare, color: "var(--color-ink-400)" },
                  ]}
                />
              </div>
            </section>
          </div>
        </div>

        {/* ---------------- right column ---------------- */}
        <div className="min-w-0 space-y-5">
          {/* quick actions */}
          <section className="card p-4">
            <h2 className="text-sm font-extrabold text-ink-950">{t("pp.quickActions")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <QuickAction href="/provider/calendar" icon={<Clock size={16} />} label={t("pp.blockTime")} tone="brand" />
              <QuickAction href="/provider/deals/new" icon={<Flame size={16} />} label={t("pp.newDeal")} tone="deal" />
              <QuickAction href="/provider/services" icon={<Plus size={16} />} label={t("pp.addService")} tone="violet" />
              <QuickAction href="/provider/portfolio" icon={<Scissors size={16} />} label={t("pp.addPortfolio")} tone="info" />
            </div>
          </section>

          {/* availability */}
          <section className="card p-4">
            <h2 className="text-sm font-extrabold text-ink-950">{t("pp.onlineStatus")}</h2>
            <div className="mt-3 space-y-3">
              <Toggle
                checked={settings.online}
                onChange={(v) => {
                  updateSettings({ online: v });
                  toast(v ? t("pp.online") : t("pp.offline"), "info");
                }}
                label={<span className="text-xs font-bold">{settings.online ? t("pp.online") : t("pp.offline")}</span>}
              />
              <Toggle
                checked={settings.acceptsInstant}
                onChange={(v) => {
                  updateSettings({ acceptsInstant: v });
                  toast(t("common.saved"), "success");
                }}
                label={<span className="flex items-center gap-1.5 text-xs font-bold"><Zap size={13} className="text-deal-600" />{t("pp.instantToggle")}</span>}
                hint={t("pp.instantToggleHint")}
              />
            </div>
          </section>

          {/* active deals */}
          <section className="card overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <Flame size={15} className="text-deal-600" />
                {t("pp.deal.title")}
              </h2>
              <Link href="/provider/deals/new" className="text-xs font-bold text-brand-700 hover:text-brand-800">
                {t("common.add")}
              </Link>
            </header>
            {activeDeals.length === 0 ? (
              <p className="p-4 text-xs text-ink-500">{t("pp.deal.empty")}</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {activeDeals.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-3.5">
                    <span className="tnum grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-deal-500 text-xs font-black text-white">
                      {localDigits(discountPercent(d), locale)}٪
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-950">{tr(d.serviceName)}</p>
                      <p className="tnum mt-0.5 text-[11px] text-ink-500">
                        {formatDateShort(d.dateISO, locale)} · {formatClock(hhmm(d.dateISO), locale)} ·{" "}
                        <span className="line-through">{formatMoney(d.originalPrice, locale, false)}</span>{" "}
                        <span className="font-bold text-deal-600">{formatMoney(d.dealPrice, locale, false)}</span>
                      </p>
                    </div>
                    <Badge tone="success" size="sm">{t("pp.deal.active")}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* rating snapshot */}
          <section className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold text-ink-950">{t("pp.rv.title")}</h2>
              <Link href="/provider/reviews" className="text-xs font-bold text-brand-700 hover:text-brand-800">
                {t("common.viewAll")}
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-center">
                <p className="tnum text-3xl font-black text-ink-950">{localDigits((4.9).toFixed(1), locale)}</p>
                <Stars value={4.9} size={12} className="mt-1 justify-center" />
                <p className="mt-1 text-[10px] text-ink-500">
                  {localDigits(214, locale)} {t("card.reviews")}
                </p>
              </div>
              <div className="flex-1 space-y-1">
                {[
                  { s: 5, pct: 88 },
                  { s: 4, pct: 9 },
                  { s: 3, pct: 3 },
                ].map((r) => (
                  <div key={r.s} className="flex items-center gap-2">
                    <span className="tnum w-5 text-[10px] font-bold text-ink-500">{localDigits(r.s, locale)}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <span className="block h-full rounded-full bg-deal-400" style={{ width: `${r.pct}%` }} />
                    </span>
                    <span className="tnum w-7 text-end text-[10px] text-ink-400">
                      {localDigits(r.pct, locale)}٪
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* notifications */}
          <section className="card overflow-hidden">
            <header className="border-b border-ink-200 bg-ink-50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <Bell size={15} className="text-brand-600" />
                {t("pp.notificationsPreview")}
              </h2>
            </header>
            <ul className="divide-y divide-ink-100">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className={cn("flex gap-3 px-4 py-3", !n.read && "bg-brand-50/40")}>
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      n.kind === "deal" ? "bg-deal-500" : n.kind === "booking" ? "bg-brand-500" : "bg-ink-400",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-900">{n.title[locale]}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-600">{n.body[locale]}</p>
                    <p className="mt-1 text-[10px] text-ink-400">{formatRelative(n.at, locale)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tone: "brand" | "deal" | "violet" | "info";
}) {
  const toneClass = {
    brand: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    deal: "bg-deal-50 text-deal-700 hover:bg-deal-100",
    violet: "bg-violet-50 text-violet-700 hover:bg-violet-100",
    info: "bg-sky-50 text-sky-700 hover:bg-sky-100",
  }[tone];

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-start gap-2 rounded-2xl border border-ink-200 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card",
        toneClass,
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm">{icon}</span>
      <span className="text-[11px] leading-tight font-extrabold">{label}</span>
    </Link>
  );
}

function hhmm(isoString: string) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

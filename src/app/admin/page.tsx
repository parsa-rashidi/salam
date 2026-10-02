"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Check,
  Flame,
  Flag,
  Gauge,
  Home,
  Percent,
  Star,
  Store,
  TriangleAlert,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  ADMIN_ACTIVITY,
  ADMIN_CITIES,
  ADMIN_KPI,
  ADMIN_REVENUE,
  BOOKING_TREND,
  PROVIDERS,
  SIGNUP_TREND,
} from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatCard } from "@/components/ui/layout";
import { BarChart, Donut, LineChart } from "@/components/ui/chart";
import { Stars } from "@/components/ui/rating";
import { Tabs } from "@/components/ui/tabs";
import { formatCompact, formatMoney, formatRelative, localDigits } from "@/lib/format";
import type { TranslationKey } from "@/i18n/dictionary";
import { cn } from "@/lib/cn";

const ACTIVITY_ICON = {
  provider: BadgeCheck,
  report: Flag,
  deal: Flame,
  booking: CalendarCheck2,
  user: Users,
  system: Activity,
} as const;

export default function AdminDashboardPage() {
  const { t, tr, locale } = useI18n();
  const { pending, resolvePending, toast } = useStore();
  const [chart, setChart] = useState<"bookings" | "signups">("bookings");

  const awaiting = pending.filter((p) => p.status === "pending");
  const topProviders = [...PROVIDERS].sort((a, b) => b.bookingsCount - a.bookingsCount).slice(0, 5);
  const topCities = [...ADMIN_CITIES].sort((a, b) => b.providers - a.providers);
  const totalRevenue = ADMIN_REVENUE.reduce((s, r) => s + r.amount, 0);
  const weeks = BOOKING_TREND.map((_, i) => `${locale === "fa" ? "ه" : "W"}${localDigits(i + 1, locale)}`);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* intro */}
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-brand-600 p-5 text-white sm:p-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.55) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold text-white/70">
                <Gauge size={13} />
                {t("ad.title")}
              </p>
              <h1 className="mt-1.5 text-xl font-black sm:text-2xl">{t("ad.dashboard")}</h1>
              <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/80">{t("ad.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/providers"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-xs font-bold text-indigo-800 shadow-sm transition-colors hover:bg-indigo-50"
              >
                <BadgeCheck size={14} />
                {t("ad.quickReview")}
              </Link>
              <Link
                href="/admin/reports"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/40 bg-white/15 px-3.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <Flag size={14} />
                {t("ad.reports")}
              </Link>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid gap-px bg-ink-200 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={<Users size={16} />} label={t("ad.statUsers")} value={formatCompact(ADMIN_KPI.users, locale)} delta={ADMIN_KPI.usersGrowth} tone="brand" />
          <Kpi icon={<Store size={16} />} label={t("ad.statProviders")} value={formatCompact(ADMIN_KPI.providers, locale)} delta={ADMIN_KPI.providersGrowth} tone="violet" />
          <Kpi icon={<CalendarCheck2 size={16} />} label={t("ad.statBookings")} value={formatCompact(ADMIN_KPI.bookingsThisMonth, locale)} delta={ADMIN_KPI.bookingsGrowth} tone="deal" />
          <Kpi icon={<Wallet size={16} />} label={t("ad.statRevenue")} value={formatCompact(ADMIN_KPI.revenue, locale)} delta={ADMIN_KPI.revenueGrowth} tone="brand" />
        </div>
      </div>

      {/* attention row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("ad.statPending")}
          value={localDigits(ADMIN_KPI.pending, locale)}
          icon={<BadgeCheck size={18} />}
          tone="deal"
        />
        <StatCard
          label={t("ad.statReports")}
          value={localDigits(ADMIN_KPI.reportsOpen, locale)}
          icon={<Flag size={18} />}
          tone="violet"
        />
        <StatCard
          label={t("ad.statDeals")}
          value={localDigits(ADMIN_KPI.dealsActive, locale)}
          delta={{ value: ADMIN_KPI.dealsGrowth }}
          icon={<Flame size={18} />}
          tone="deal"
        />
        <StatCard
          label={t("ad.statCommission")}
          value={formatCompact(ADMIN_KPI.commission, locale)}
          icon={<Percent size={18} />}
          tone="brand"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* charts */}
        <div className="space-y-5">
          <section className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold text-ink-950">
                {chart === "bookings" ? t("ad.chartBookings") : t("ad.chartSignups")}
              </h2>
              <Tabs<"bookings" | "signups">
                value={chart}
                onChange={setChart}
                size="sm"
                items={[
                  { id: "bookings", label: t("ad.chartBookings") },
                  { id: "signups", label: t("ad.chartSignups") },
                ]}
              />
            </div>
            <div className="mt-4">
              <LineChart
                data={chart === "bookings" ? BOOKING_TREND : SIGNUP_TREND}
                labels={weeks}
                height={170}
                color={chart === "bookings" ? "var(--color-brand-600)" : "var(--color-deal-600)"}
                fill={chart === "bookings" ? "var(--color-brand-500)" : "var(--color-deal-500)"}
                valueFormatter={(v) => formatCompact(v, locale)}
              />
            </div>
            <p className="tnum mt-3 text-[11px] text-ink-500">
              {locale === "fa"
                ? `میانگین هفتگی: ${formatCompact(Math.round((chart === "bookings" ? BOOKING_TREND : SIGNUP_TREND).reduce((a, b) => a + b, 0) / 12), locale)}`
                : `Weekly average: ${formatCompact(Math.round((chart === "bookings" ? BOOKING_TREND : SIGNUP_TREND).reduce((a, b) => a + b, 0) / 12), locale)}`}
            </p>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-ink-950">{t("ad.rev.title")}</h2>
            <p className="mt-0.5 text-[11px] text-ink-500">{t("ad.rev.subtitle")}</p>
            <div className="mt-4">
              <BarChart
                data={ADMIN_REVENUE.map((r) => r.amount)}
                labels={ADMIN_REVENUE.map((r) => t(r.source as TranslationKey))}
                height={140}
                color="var(--color-brand-500)"
                valueFormatter={(v) => formatCompact(v, locale)}
              />
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {ADMIN_REVENUE.map((r) => (
                <li key={r.id} className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50/60 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-ink-900">{t(r.source as TranslationKey)}</p>
                    <p className="truncate text-[10px] text-ink-500">{r.rate}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="tnum text-xs font-black text-ink-950">{formatCompact(r.amount, locale)}</p>
                    <p
                      className={cn(
                        "tnum text-[10px] font-bold",
                        r.growth >= 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {r.growth >= 0 ? "+" : ""}
                      {localDigits(r.growth.toFixed(1), locale)}٪
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/revenue"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50"
            >
              {t("ad.revenue")}
              <ArrowUpRight size={13} />
            </Link>
          </section>

          {/* quick review */}
          <section className="card overflow-hidden">
            <header className="flex flex-wrap items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-deal-100 text-deal-700">
                <BadgeCheck size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-extrabold text-ink-950">{t("ad.quickReview")}</h2>
                <p className="text-[11px] text-ink-500">{t("ad.pend.subtitle")}</p>
              </div>
              <ButtonLink href="/admin/providers" variant="outline" size="xs">
                {t("common.viewAll")}
              </ButtonLink>
            </header>

            {awaiting.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-ink-500">{t("ad.pend.empty")}</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {awaiting.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <Avatar name={tr(p.name)} accent={p.accent} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-950">{tr(p.name)}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-ink-500">
                        <span className="flex items-center gap-1">
                          <Building2 size={10} />
                          {tr(p.city)}
                        </span>
                        <span>·</span>
                        <span>{p.kind === "salon" ? t("pp.set.kindSalon") : t("pp.set.kindIndependent")}</span>
                        <span>·</span>
                        <span className="tnum">
                          {localDigits(p.servicesCount, locale)} {t("profile.servicesUnit")}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.docsSubmitted ? (
                        <Badge tone="success" size="sm" icon={<Check size={10} />}>{t("ad.pend.docs")}</Badge>
                      ) : (
                        <Badge tone="danger" size="sm" icon={<X size={10} />}>{t("ad.pend.docs")}</Badge>
                      )}
                      {p.nationalIdVerified ? (
                        <Badge tone="success" size="sm">{t("ad.pend.nationalId")}</Badge>
                      ) : (
                        <Badge tone="warn" size="sm">{t("ad.pend.nationalId")}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="xs"
                        icon={<Check size={12} />}
                        onClick={() => {
                          resolvePending(p.id, "approved");
                          toast(t("ad.pend.approved"), "success");
                        }}
                      >
                        {t("ad.pend.approve")}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        icon={<X size={12} />}
                        onClick={() => {
                          resolvePending(p.id, "rejected");
                          toast(t("ad.pend.rejected"), "warn");
                        }}
                      >
                        {t("ad.pend.reject")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* right column */}
        <div className="space-y-5">
          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-ink-950">{t("ad.chartSplit")}</h2>
            <div className="mt-4 flex items-center gap-5">
              <Donut
                size={128}
                segments={[
                  { label: t("ad.chartSplitHome"), value: ADMIN_KPI.homeShare, color: "var(--color-brand-500)" },
                  { label: t("ad.chartSplitSalon"), value: 100 - ADMIN_KPI.homeShare, color: "var(--color-ink-300)" },
                ]}
                center={
                  <div className="text-center">
                    <p className="tnum text-lg font-black text-ink-950">
                      {localDigits(ADMIN_KPI.homeShare, locale)}٪
                    </p>
                    <p className="text-[9px] font-bold text-ink-500">{t("ad.chartSplitHome")}</p>
                  </div>
                }
              />
              <ul className="min-w-0 flex-1 space-y-2.5">
                <li className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-brand-500" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink-700">{t("ad.chartSplitHome")}</span>
                  <b className="tnum">{localDigits(ADMIN_KPI.homeShare, locale)}٪</b>
                </li>
                <li className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-ink-300" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink-700">{t("ad.chartSplitSalon")}</span>
                  <b className="tnum">{localDigits(100 - ADMIN_KPI.homeShare, locale)}٪</b>
                </li>
              </ul>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-[11px] leading-relaxed text-brand-900">
              <Home size={13} className="mt-0.5 shrink-0" />
              {locale === "fa"
                ? "سهم خدمات در محل رشد پایداری دارد؛ بیشترین تقاضا از سوی سالمندان و افراد دارای محدودیت حرکتی است."
                : "At-home demand keeps growing — most of it from seniors and customers with limited mobility."}
            </div>
          </section>

          <section className="card overflow-hidden">
            <header className="flex items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <Building2 size={15} className="text-indigo-600" />
              <h2 className="text-sm font-extrabold text-ink-950">{t("ad.topCities")}</h2>
            </header>
            <ul className="divide-y divide-ink-100">
              {topCities.map((c, i) => {
                const max = topCities[0].providers;
                return (
                  <li key={c.id} className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ink-100 text-[10px] font-black text-ink-600">
                        {localDigits(i + 1, locale)}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-xs font-bold text-ink-950">{tr(c.name)}</p>
                      {!c.active && (
                        <Badge tone="warn" size="sm">{locale === "fa" ? "غیرفعال" : "Inactive"}</Badge>
                      )}
                      <span className="tnum text-xs font-extrabold text-ink-900">
                        {formatCompact(c.providers, locale)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-brand-500 transition-all duration-700"
                        style={{ width: `${Math.round((c.providers / max) * 100)}%` }}
                      />
                    </div>
                    <p className="tnum mt-1.5 flex flex-wrap gap-x-3 text-[10px] text-ink-500">
                      <span>{localDigits(c.districts, locale)} {locale === "fa" ? "منطقه" : "districts"}</span>
                      <span>{formatCompact(c.users, locale)} {locale === "fa" ? "کاربر" : "users"}</span>
                      <span>{formatCompact(c.bookingsThisMonth, locale)} {t("ad.bookings")}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card overflow-hidden">
            <header className="flex items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <Star size={15} className="text-deal-500" />
              <h2 className="text-sm font-extrabold text-ink-950">{t("ad.topProviders")}</h2>
            </header>
            <ul className="divide-y divide-ink-100">
              {topProviders.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/providers/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/50"
                  >
                    <Avatar name={tr(p.name)} accent={p.accent} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-xs font-bold text-ink-950">
                        {tr(p.name)}
                        {p.verified && <BadgeCheck size={12} className="shrink-0 text-brand-600" />}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5">
                        <Stars value={p.rating} size={9} />
                        <span className="tnum text-[10px] font-bold text-ink-500">
                          {localDigits(p.rating.toFixed(1), locale)} · {tr(p.district)}
                        </span>
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-xs font-extrabold text-brand-700">
                      {formatCompact(p.bookingsCount, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="card overflow-hidden">
            <header className="flex items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <Activity size={15} className="text-violet-600" />
              <h2 className="text-sm font-extrabold text-ink-950">{t("ad.recentActivity")}</h2>
            </header>
            <ul className="divide-y divide-ink-100">
              {ADMIN_ACTIVITY.map((a) => {
                const Icon = ACTIVITY_ICON[a.kind] ?? Activity;
                return (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
                      <Icon size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-relaxed text-ink-800">{tr(a.text)}</p>
                      <p className="tnum mt-0.5 text-[10px] text-ink-400">{formatRelative(a.at, locale)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2.5">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-amber-900">
                  {locale === "fa" ? "این یک نمونهٔ تعاملی است" : "This is an interactive prototype"}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                  {locale === "fa"
                    ? "همهٔ داده‌ها ساختگی‌اند و تغییرات فقط در مرورگر شما نگه داشته می‌شوند. هیچ سرور، پایگاه داده یا پرداخت واقعی وجود ندارد."
                    : "All data is mock and changes live only in your browser. There is no real server, database or payment."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral" size="sm" icon={<Zap size={11} />}>{t("ad.deals")}</Badge>
                  <Badge tone="neutral" size="sm" icon={<Wallet size={11} />}>
                    {formatMoney(totalRevenue, locale)}
                  </Badge>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number;
  tone: "brand" | "deal" | "violet";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    deal: "bg-deal-50 text-deal-700",
    violet: "bg-violet-50 text-violet-700",
  }[tone];
  return (
    <div className="flex items-center gap-3 bg-white p-4">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones)}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-ink-500">{label}</p>
        <p className="tnum truncate text-lg font-black text-ink-950">{value}</p>
      </div>
      {delta !== undefined && (
        <span
          className={cn(
            "tnum ms-auto shrink-0 rounded-lg px-1.5 py-1 text-[10px] font-black",
            delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
        >
          {delta >= 0 ? "+" : ""}
          {localDigits(delta.toFixed(1), "en")}٪
        </span>
      )}
    </div>
  );
}

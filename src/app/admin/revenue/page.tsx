"use client";

import { useState } from "react";
import {
  BadgeDollarSign,
  CircleDollarSign,
  Coins,
  Download,
  Home,
  Percent,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { ADMIN_KPI, ADMIN_REVENUE, BOOKING_TREND } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import { BarChart, LineChart, ShareBar } from "@/components/ui/chart";
import { formatCompact, formatMoney, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const SOURCE_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  "ad.rev.bookingCommission": Percent,
  "ad.rev.subscription": Receipt,
  "ad.rev.featured": Sparkles,
  "ad.rev.dealPublish": Zap,
  "ad.rev.homeService": Home,
};

export default function AdminRevenuePage() {
  const { t, locale } = useI18n();
  const { toast } = useStore();
  const [commission, setCommission] = useState(8);
  const [subscription, setSubscription] = useState(290_000);
  const [dealFee, setDealFee] = useState(45_000);
  const [homeFee, setHomeFee] = useState(5);

  const total = ADMIN_REVENUE.reduce((s, r) => s + r.amount, 0);
  const maxAmount = Math.max(...ADMIN_REVENUE.map((r) => r.amount));
  const weeks = BOOKING_TREND.map((_, i) => `${locale === "fa" ? "ه" : "W"}${localDigits(i + 1, locale)}`);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-600 p-5 text-white sm:p-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.6) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold text-white/75">
                <Wallet size={13} />
                {t("ad.rev.title")}
              </p>
              <p className="tnum mt-2 text-3xl font-black sm:text-4xl">{formatMoney(total, locale)}</p>
              <p className="mt-1 text-xs text-white/80">{t("ad.rev.subtitle")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tnum flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
                <TrendingUp size={14} />
                +{localDigits(ADMIN_KPI.revenueGrowth.toFixed(1), locale)}٪
              </span>
              <button
                onClick={() =>
                  toast(locale === "fa" ? "گزارش مالی ساخته شد (نمونه)." : "Financial report generated (demo).", "info")
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-xs font-bold text-brand-800 hover:bg-brand-50"
              >
                <Download size={14} />
                {t("ad.bk.export")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-ink-200 sm:grid-cols-2 xl:grid-cols-4">
          <Cell label={t("ad.statRevenue")} value={formatCompact(ADMIN_KPI.revenue, locale)} delta={ADMIN_KPI.revenueGrowth} icon={<Coins size={16} />} />
          <Cell label={t("ad.statCommission")} value={formatCompact(ADMIN_KPI.commission, locale)} delta={18.4} icon={<Percent size={16} />} />
          <Cell label={t("ad.rev.subscription")} value={formatCompact(subscription * 75, locale)} delta={9.1} icon={<Receipt size={16} />} />
          <Cell label={t("ad.rev.homeService")} value={formatCompact(ADMIN_REVENUE[4].amount, locale)} delta={24} icon={<Home size={16} />} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-ink-950">{t("ad.rev.title")}</h2>
            <p className="mt-0.5 text-[11px] text-ink-500">{t("ad.rev.subtitle")}</p>

            <div className="mt-4">
              <BarChart
                data={ADMIN_REVENUE.map((r) => r.amount)}
                labels={ADMIN_REVENUE.map((r) => t(r.source as TranslationKey))}
                height={150}
                color="var(--color-brand-500)"
                valueFormatter={(v) => formatCompact(v, locale)}
              />
            </div>

            <ul className="mt-4 space-y-2">
              {ADMIN_REVENUE.map((r) => {
                const Icon = SOURCE_ICON[r.source] ?? Coins;
                const share = Math.round((r.amount / total) * 100);
                return (
                  <li key={r.id} className="rounded-2xl border border-ink-200 p-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-ink-950">{t(r.source as TranslationKey)}</p>
                        <p className="tnum truncate text-[10px] text-ink-500">{r.rate}</p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="tnum text-sm font-black text-ink-950">{formatMoney(r.amount, locale)}</p>
                        <p className="tnum text-[10px] font-bold text-ink-500">
                          {localDigits(share, locale)}٪ {t("ad.rev.amount")}
                        </p>
                      </div>
                      <Badge tone={r.growth >= 0 ? "success" : "danger"} size="sm" icon={r.growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}>
                        {r.growth >= 0 ? "+" : ""}
                        {localDigits(r.growth.toFixed(1), locale)}٪
                      </Badge>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-700"
                        style={{ width: `${Math.round((r.amount / maxAmount) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
              <BadgeDollarSign size={15} className="text-brand-600" />
              {locale === "fa" ? "شبیه‌ساز درآمد" : "Revenue simulator"}
            </h2>
            <p className="mt-1 text-[11px] text-ink-500">
              {locale === "fa"
                ? "نرخ‌ها را تغییر دهید تا اثر آن بر درآمد ماهانه را ببینید."
                : "Change the rates to see their effect on monthly revenue."}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("ad.rev.bookingCommission")} hint={`${localDigits(commission, locale)}٪`}>
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  max={30}
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value) || 0)}
                  className="tnum text-start"
                />
              </Field>
              <Field label={t("ad.rev.subscription")} hint={formatMoney(subscription, locale)}>
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  step={10000}
                  value={subscription}
                  onChange={(e) => setSubscription(Number(e.target.value) || 0)}
                  className="tnum text-start"
                />
              </Field>
              <Field label={t("ad.rev.dealPublish")} hint={formatMoney(dealFee, locale)}>
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  step={5000}
                  value={dealFee}
                  onChange={(e) => setDealFee(Number(e.target.value) || 0)}
                  className="tnum text-start"
                />
              </Field>
              <Field label={t("ad.rev.homeService")} hint={`${localDigits(homeFee, locale)}٪`}>
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  max={20}
                  value={homeFee}
                  onChange={(e) => setHomeFee(Number(e.target.value) || 0)}
                  className="tnum text-start"
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Sim label={t("ad.rev.bookingCommission")} value={formatMoney(Math.round(ADMIN_KPI.bookingsThisMonth * 420_000 * (commission / 100)), locale)} />
              <Sim label={t("ad.rev.subscription")} value={formatMoney(subscription * 75, locale)} />
              <Sim label={t("ad.rev.dealPublish")} value={formatMoney(dealFee * 38, locale)} />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-brand-50 p-4">
              <p className="text-xs font-extrabold text-brand-900">
                {locale === "fa" ? "درآمد ماهانهٔ برآوردی" : "Estimated monthly revenue"}
              </p>
              <p className="tnum text-lg font-black text-brand-800">
                {formatMoney(
                  Math.round(ADMIN_KPI.bookingsThisMonth * 420_000 * (commission / 100)) +
                    subscription * 75 +
                    dealFee * 38 +
                    Math.round(ADMIN_KPI.bookingsThisMonth * (ADMIN_KPI.homeShare / 100) * 90_000 * (homeFee / 100)),
                  locale,
                )}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-ink-950">{t("ad.chartSplit")}</h2>
            <div className="mt-4">
              <ShareBar
                segments={ADMIN_REVENUE.map((r, i) => ({
                  label: t(r.source as TranslationKey),
                  value: r.amount,
                  color: ["var(--color-brand-500)", "var(--color-sky-500)", "var(--color-violet-500)", "var(--color-deal-500)", "var(--color-emerald-500)"][i % 5],
                }))}
              />
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="text-sm font-extrabold text-ink-950">{locale === "fa" ? "روند نوبت‌ها و درآمد" : "Bookings & revenue trend"}</h2>
            <div className="mt-4">
              <LineChart
                data={BOOKING_TREND}
                labels={weeks}
                height={140}
                color="var(--color-emerald-600)"
                fill="var(--color-emerald-500)"
                valueFormatter={(v) => formatCompact(v, locale)}
              />
            </div>
            <p className="tnum mt-3 text-[11px] text-ink-500">
              {locale === "fa" ? "میانگین ارزش هر نوبت" : "Average booking value"}:{" "}
              <b className="font-extrabold text-ink-900">{formatMoney(420_000, locale)}</b>
            </p>
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
              <CircleDollarSign size={15} className="text-deal-600" />
              {t("ad.rev.freeTier")}
            </h2>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-600">
              {[
                { fa: "ثبت پروفایل و نمایش در جست‌وجو رایگان است.", en: "Listing a profile and appearing in search is free." },
                { fa: "کمیسیون فقط از نوبت‌های انجام‌شده کسر می‌شود.", en: "Commission is charged only on completed bookings." },
                { fa: "اشتراک ویژه، نوبت را در نتایج بالاتر نمایش می‌دهد.", en: "The premium subscription ranks bookings higher in results." },
                { fa: "انتشار تخفیف فوری و نمایش گسترده هزینهٔ جداگانه دارند.", en: "Publishing a flash deal and boosting it are charged separately." },
              ].map((x) => (
                <li key={x.en} className="flex items-start gap-2 rounded-xl bg-ink-50 p-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{locale === "fa" ? x.fa : x.en}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-ink-500">{label}</p>
        <p className="tnum truncate text-lg font-black text-ink-950">{value}</p>
      </div>
      {delta !== undefined && (
        <span className="tnum ms-auto shrink-0 rounded-lg bg-emerald-50 px-1.5 py-1 text-[10px] font-black text-emerald-700">
          +{localDigits(delta.toFixed(1), "en")}٪
        </span>
      )}
    </div>
  );
}

function Sim({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-2xl border border-ink-200 bg-ink-50 p-3")}>
      <p className="truncate text-[10px] font-bold text-ink-500">{label}</p>
      <p className="tnum mt-1 truncate text-sm font-black text-ink-950">{value}</p>
    </div>
  );
}

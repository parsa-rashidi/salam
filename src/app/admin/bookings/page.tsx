"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarCheck2,
  Download,
  Eye,
  Home,
  Percent,
  Search,
  Store,
} from "lucide-react";
import { BOOKINGS, providerById } from "@/lib/mock-data";
import type { BookingStatus } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { ShareBar } from "@/components/ui/chart";
import {
  formatClock,
  formatDate,
  formatDuration,
  formatMoney,
} from "@/lib/format";
import type { TranslationKey } from "@/i18n/dictionary";
import { cn } from "@/lib/cn";

const COMMISSION = 0.08;

const STATUSES: (BookingStatus | "all")[] = [
  "all",
  "confirmed",
  "pending",
  "requested",
  "done",
  "cancelled",
  "rejected",
  "no_show",
];

export default function AdminBookingsPage() {
  const { t, tr, locale } = useI18n();
  const { toast } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [mode, setMode] = useState<"all" | "salon" | "home">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = BOOKINGS.filter((b) => (status === "all" ? true : b.status === status))
    .filter((b) => (mode === "all" ? true : b.mode === mode))
    .filter((b) =>
      q.trim()
        ? b.code.toLowerCase().includes(q.trim().toLowerCase()) ||
          tr(b.customerName).toLowerCase().includes(q.trim().toLowerCase())
        : true,
    );

  const gross = BOOKINGS.reduce((s, b) => s + b.price + b.travelFee, 0);
  const commission = Math.round(gross * COMMISSION);
  const homeCount = BOOKINGS.filter((b) => b.mode === "home").length;
  const detail = BOOKINGS.find((b) => b.id === openId) ?? null;
  const detailProvider = detail ? providerById(detail.providerId) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <CalendarCheck2 size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.bk.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.bk.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand" size="md">
            {t("ad.bk.amount")}: {formatMoney(gross, locale)}
          </Badge>
          <Badge tone="deal" size="md" icon={<Percent size={12} />}>
            {t("ad.bk.commission")}: {formatMoney(commission, locale)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() =>
              toast(locale === "fa" ? "گزارش نوبت‌ها ساخته شد (نمونه)." : "Booking report generated (demo).", "info")
            }
          >
            {t("ad.bk.export")}
          </Button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-extrabold text-ink-950">{t("ad.chartSplit")}</h2>
        <div className="mt-3">
          <ShareBar
            segments={[
              { label: t("ad.chartSplitHome"), value: homeCount, color: "var(--color-brand-500)" },
              { label: t("ad.chartSplitSalon"), value: BOOKINGS.length - homeCount, color: "var(--color-ink-300)" },
            ]}
          />
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[11rem] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={locale === "fa" ? "کد نوبت یا نام مشتری" : "Booking code or customer"}
            className="h-10 ps-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus | "all")}
          className="h-10 w-auto min-w-[9rem]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? t("ad.nt.all") : t(`status.${s}` as TranslationKey)}
            </option>
          ))}
        </Select>
        <Select
          value={mode}
          onChange={(e) => setMode(e.target.value as "all" | "salon" | "home")}
          className="h-10 w-auto min-w-[8rem]"
        >
          <option value="all">{t("ad.nt.all")}</option>
          <option value="salon">{t("explore.inSalon")}</option>
          <option value="home">{t("explore.atHome")}</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<CalendarCheck2 size={28} />} title={t("common.noResults")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold text-ink-500">
                  <th className="px-4 py-3 text-start">{t("ad.bk.code")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.bk.customer")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.bk.provider")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.bk.date")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.bk.mode")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.bk.amount")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.bk.commission")}</th>
                  <th className="px-4 py-3 text-start">{t("common.status")}</th>
                  <th className="px-4 py-3 text-start">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((b) => {
                  const p = providerById(b.providerId);
                  const amount = b.price + b.travelFee;
                  return (
                    <tr key={b.id} className="transition-colors hover:bg-brand-50/30">
                      <td className="tnum px-4 py-3 text-[11px] font-black text-ink-900">{b.code}</td>
                      <td className="px-4 py-3">
                        <p className="truncate text-xs font-bold text-ink-950">{tr(b.customerName)}</p>
                        {!b.beneficiary.isSelf && (
                          <p className="truncate text-[10px] text-violet-700">
                            {locale === "fa" ? "برای " : "For "}
                            {tr(b.beneficiary.name)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/providers/${b.providerId}`} className="truncate text-xs font-semibold text-brand-700 hover:underline">
                          {p ? tr(p.name) : b.providerId}
                        </Link>
                      </td>
                      <td className="tnum px-4 py-3 text-[11px] text-ink-700">
                        {formatDate(b.dateISO, locale)}
                        <span className="block text-[10px] text-ink-400">{formatClock(hhmm(b.dateISO), locale)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={b.mode === "home" ? "brand" : "neutral"} size="sm" icon={b.mode === "home" ? <Home size={10} /> : <Store size={10} />}>
                          {b.mode === "home" ? t("explore.atHome") : t("explore.inSalon")}
                        </Badge>
                      </td>
                      <td className="tnum px-4 py-3 text-xs font-extrabold text-ink-950">
                        {formatMoney(amount, locale)}
                      </td>
                      <td className="tnum px-4 py-3 text-xs font-bold text-deal-600">
                        {formatMoney(Math.round(amount * COMMISSION), locale)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={b.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="xs" icon={<Eye size={12} />} onClick={() => setOpenId(b.id)}>
                          {t("common.details")}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!detail}
        onClose={() => setOpenId(null)}
        title={detail ? detail.code : undefined}
        description={detail ? `${formatDate(detail.dateISO, locale)} · ${formatClock(hhmm(detail.dateISO), locale)}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpenId(null)}>
              {t("common.close")}
            </Button>
            {detail && (
              <Link
                href={`/bookings/${detail.id}`}
                className="flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {t("common.viewAll")}
              </Link>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={detail.status} size="md" />
              <Badge tone={detail.mode === "home" ? "brand" : "neutral"} size="md" icon={detail.mode === "home" ? <Home size={12} /> : <Store size={12} />}>
                {detail.mode === "home" ? t("explore.atHome") : t("explore.inSalon")}
              </Badge>
              {detail.companionShared && (
                <Badge tone="violet" size="md">{t("bookings.companionShared")}</Badge>
              )}
            </div>

            <ul className="space-y-2 text-xs">
              <Line label={t("ad.bk.customer")} value={tr(detail.customerName)} />
              <Line label={t("booking.summaryBeneficiary")} value={tr(detail.beneficiary.name)} />
              <Line label={t("ad.bk.provider")} value={detailProvider ? tr(detailProvider.name) : "—"} />
              <Line label={t("profile.duration")} value={formatDuration(detail.durationMin, locale)} />
              <Line label={t("ad.bk.amount")} value={formatMoney(detail.price + detail.travelFee, locale)} strong />
              <Line label={t("profile.travelFee")} value={formatMoney(detail.travelFee, locale)} />
              <Line label={t("ad.bk.commission")} value={formatMoney(Math.round((detail.price + detail.travelFee) * COMMISSION), locale)} strong />
            </ul>

            {detail.address && (
              <div className={cn("rounded-xl border p-3 text-[11px]", detail.addressVisible ? "border-brand-200 bg-brand-50" : "border-ink-200 bg-ink-50")}>
                <p className="font-bold text-ink-500">{t("booking.addressTitle")}</p>
                <p className="mt-1 leading-relaxed text-ink-800">
                  {detail.addressVisible ? tr(detail.address) : t("ad.set.privacyAddressHint")}
                </p>
              </div>
            )}

            <div className="rounded-xl bg-ink-50 p-3">
              <p className="text-[11px] font-bold text-ink-500">{t("bookings.timeline")}</p>
              <ol className="mt-2 space-y-1.5">
                {detail.timeline.map((ev, i) => (
                  <li key={i} className="tnum flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span className="font-bold text-ink-800">{t(`status.${ev.status}` as TranslationKey)}</span>
                    <span className="text-ink-400">{formatDate(ev.at, locale)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function hhmm(isoString: string) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 px-3 py-2.5">
      <span className="text-ink-500">{label}</span>
      <span className={cn("tnum", strong ? "text-sm font-black text-ink-950" : "font-bold text-ink-900")}>
        {value}
      </span>
    </li>
  );
}

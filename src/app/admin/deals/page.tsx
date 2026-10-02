"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock3,
  Download,
  ExternalLink,
  Flame,
  MapPinned,
  Megaphone,
  Percent,
  Power,
  Users,
  Zap,
} from "lucide-react";
import { PROVIDERS, providerById } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/layout";
import { Tabs } from "@/components/ui/tabs";
import {
  formatClock,
  formatCountdown,
  formatDate,
  formatMoney,
  localDigits,
} from "@/lib/format";
import { discountPercent, isDealActive } from "@/lib/queries";
import { cn } from "@/lib/cn";

type Tab = "active" | "ended";

export default function AdminDealsPage() {
  const { t, tr, locale } = useI18n();
  const { deals, deactivateDeal, toast } = useStore();
  const [tab, setTab] = useState<Tab>("active");
  const [removing, setRemoving] = useState<string | null>(null);
  const now = new Date();

  const groups: Record<Tab, typeof deals> = {
    active: deals.filter((d) => isDealActive(d, now)),
    ended: deals.filter((d) => !isDealActive(d, now)),
  };
  const list = groups[tab];
  const totalSaving = deals.reduce((s, d) => s + (d.originalPrice - d.dealPrice) * d.capacity, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-50 text-deal-700">
          <Flame size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.deal.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.deal.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="deal" size="md" icon={<Zap size={12} />}>
            {localDigits(groups.active.length, locale)} {t("ad.deal.title")}
          </Badge>
          <Badge tone="brand" size="md" icon={<Percent size={12} />}>
            {formatMoney(totalSaving, locale)}
          </Badge>
          <ButtonLink href="/deals" variant="outline" size="sm" icon={<ExternalLink size={14} />}>
            {t("nav.deals")}
          </ButtonLink>
        </div>
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: "active", label: t("pp.deal.active"), count: localDigits(groups.active.length, locale), icon: <Zap size={14} /> },
          { id: "ended", label: t("pp.deal.ended"), count: localDigits(groups.ended.length, locale), icon: <Clock3 size={14} /> },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon={<Flame size={28} />} title={t("pp.deal.empty")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[58rem] text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold text-ink-500">
                  <th className="px-4 py-3 text-start">{t("ad.deal.provider")}</th>
                  <th className="px-4 py-3 text-start">{t("pp.deal.service")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.deal.discount")}</th>
                  <th className="px-4 py-3 text-start">{t("pp.deal.dateTime")}</th>
                  <th className="px-4 py-3 text-start">{t("pp.deal.capacity")}</th>
                  <th className="px-4 py-3 text-start">{t("pp.deal.radius")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.deal.boosted")}</th>
                  <th className="px-4 py-3 text-start">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((d) => {
                  const p = providerById(d.providerId) ?? PROVIDERS[0];
                  const pct = discountPercent(d);
                  const boosted = d.boost && d.boost !== "basic";
                  return (
                    <tr key={d.id} className="transition-colors hover:bg-deal-50/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={tr(p.name)} accent={p.accent} size={32} />
                          <div className="min-w-0">
                            <Link href={`/providers/${p.id}`} className="truncate text-xs font-bold text-ink-950 hover:text-brand-700">
                              {tr(p.name)}
                            </Link>
                            <p className="truncate text-[10px] text-ink-400">{tr(p.district)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-ink-800">{tr(d.serviceName)}</td>
                      <td className="px-4 py-3">
                        <p className="tnum text-xs font-black text-deal-600">
                          {localDigits(pct, locale)}٪
                        </p>
                        <p className="tnum text-[10px] text-ink-400">
                          <span className="line-through">{formatMoney(d.originalPrice, locale, false)}</span>{" "}
                          <b className="font-extrabold text-ink-800">{formatMoney(d.dealPrice, locale, false)}</b>
                        </p>
                      </td>
                      <td className="tnum px-4 py-3 text-[11px] text-ink-700">
                        {formatDate(d.dateISO, locale)}
                        <span className="block text-[10px] text-ink-400">
                          {formatClock(d.dateISO.slice(11, 16), locale)}
                          {isDealActive(d, now) && (
                            <span className="ms-1.5 font-bold text-deal-600">
                              {formatCountdown(d.expiresAtISO, locale)}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="tnum text-xs font-extrabold text-ink-950">
                            {localDigits(d.remaining, locale)}/{localDigits(d.capacity, locale)}
                          </span>
                          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
                            <span
                              className={cn("block h-full rounded-full", d.remaining > 0 ? "bg-deal-500" : "bg-ink-300")}
                              style={{ width: `${Math.round((d.remaining / d.capacity) * 100)}%` }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="tnum px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-ink-700">
                          <MapPinned size={11} className="text-ink-400" />
                          {localDigits(d.radiusKm, locale)} {t("common.km")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {boosted ? (
                          <Badge tone="deal" size="sm" icon={<Megaphone size={10} />}>{t("ad.deal.boosted")}</Badge>
                        ) : (
                          <Badge tone="neutral" size="sm">{locale === "fa" ? "پایه" : "Basic"}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Power size={12} />}
                            disabled={d.remaining <= 0}
                            onClick={() => setRemoving(d.id)}
                          >
                            {t("ad.deal.deactivate")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Mini icon={<Users size={15} />} label={locale === "fa" ? "کل ظرفیت منتشرشده" : "Total published capacity"} value={localDigits(deals.reduce((s, d) => s + d.capacity, 0), locale)} />
        <Mini icon={<Percent size={15} />} label={locale === "fa" ? "میانگین تخفیف" : "Average discount"} value={`${localDigits(Math.round(deals.reduce((s, d) => s + discountPercent(d), 0) / Math.max(1, deals.length)), locale)}٪`} />
        <Mini icon={<Flame size={15} />} label={locale === "fa" ? "درآمد انتشار تخفیف" : "Deal publishing revenue"} value={formatMoney(deals.length * 45_000, locale)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-200 bg-white p-4">
        <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-ink-600">
          {locale === "fa"
            ? "تخفیف‌ها پس از تکمیل ظرفیت به‌صورت خودکار غیرفعال می‌شوند؛ در موارد اضطراری می‌توانید دستی نیز غیرفعال کنید."
            : "Deals auto-deactivate once fully booked; in emergencies you can deactivate them manually too."}
        </p>
        <Button
          variant="outline"
          size="sm"
          icon={<Download size={14} />}
          onClick={() => toast(locale === "fa" ? "گزارش تخفیف‌ها ساخته شد (نمونه)." : "Deals report generated (demo).", "info")}
        >
          {t("ad.bk.export")}
        </Button>
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

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-50 text-deal-700">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-ink-500">{label}</p>
        <p className="tnum truncate text-sm font-black text-ink-950">{value}</p>
      </div>
    </div>
  );
}

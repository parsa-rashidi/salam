"use client";

import { useState } from "react";
import { Accessibility, Building2, Phone, Search, Star, Users, Wallet } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { formatDate, formatMoney, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

type SortKey = "visits" | "spent" | "recent";

export default function ProviderCustomersPage() {
  const { t, tr, locale } = useI18n();
  const { customers, toast } = useStore();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const list = customers
    .filter((c) => tr(c.name).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "visits") return b.visits - a.visits;
      if (sort === "spent") return b.totalSpent - a.totalSpent;
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });

  const totals = customers.reduce(
    (acc, c) => ({
      visits: acc.visits + c.visits,
      spent: acc.spent + c.totalSpent,
      noShows: acc.noShows + c.noShows,
    }),
    { visits: 0, spent: 0, noShows: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          <Users size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.cu.title")}</h1>
          <p className="text-xs text-ink-500">{t("pp.cu.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral" size="md">
            {localDigits(customers.length, locale)} {t("pp.cu.title")}
          </Badge>
          <Badge tone="brand" size="md" icon={<Star size={12} />}>
            {localDigits(totals.visits, locale)} {t("pp.cu.visits")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label={t("pp.cu.visits")} value={localDigits(totals.visits, locale)} icon={<Users size={15} />} tone="brand" />
        <Kpi label={t("pp.cu.totalSpent")} value={formatMoney(totals.spent, locale)} icon={<Wallet size={15} />} tone="violet" />
        <Kpi label={t("pp.cu.noShows")} value={localDigits(totals.noShows, locale)} icon={<Accessibility size={15} />} tone="deal" />
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("pp.cu.searchPlaceholder")}
            className="h-10 ps-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(
            [
              { id: "recent", label: t("pp.cu.lastVisit") },
              { id: "visits", label: t("pp.cu.visits") },
              { id: "spent", label: t("pp.cu.totalSpent") },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => setSort(o.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors",
                sort === o.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title={t("common.noResults")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-start text-[11px] font-bold text-ink-500">
                  <th className="px-4 py-3 text-start font-bold">{t("misc.customer")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("pp.cu.visits")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("pp.cu.lastVisit")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("pp.cu.totalSpent")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("pp.cu.cancellations")}</th>
                  <th className="px-4 py-3 text-start font-bold">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-brand-50/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={tr(c.name)} accent={c.accent} size={34} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-xs font-bold text-ink-950">
                            {tr(c.name)}
                            {c.institutional && <Building2 size={12} className="shrink-0 text-violet-600" />}
                          </p>
                          {c.companionFor && (
                            <p className="truncate text-[10px] text-violet-700">
                              {locale === "fa" ? "همراهِ " : "Companion for "}
                              {tr(c.companionFor)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="tnum px-4 py-3 text-xs font-bold text-ink-900">
                      {localDigits(c.visits, locale)}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-ink-600">
                      {formatRelative(c.lastVisit, locale)}
                      <span className="block text-[10px] text-ink-400">{formatDate(c.lastVisit, locale)}</span>
                    </td>
                    <td className="tnum px-4 py-3 text-xs font-extrabold text-brand-700">
                      {formatMoney(c.totalSpent, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {c.noShows > 0 && (
                          <Badge tone="danger" size="sm">
                            {localDigits(c.noShows, locale)} {t("pp.cu.noShows")}
                          </Badge>
                        )}
                        {c.cancellations > 0 && (
                          <Badge tone="warn" size="sm">
                            {localDigits(c.cancellations, locale)}
                          </Badge>
                        )}
                        {c.noShows === 0 && c.cancellations === 0 && (
                          <Badge tone="success" size="sm">
                            {locale === "fa" ? "بدون لغو" : "No cancellations"}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toast(t("profile.callMaskedHint"), "info")}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                        aria-label={t("bookings.contactProvider")}
                      >
                        <Phone size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "brand" | "violet" | "deal";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    violet: "bg-violet-50 text-violet-700",
    deal: "bg-deal-50 text-deal-700",
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

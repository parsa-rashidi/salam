"use client";

import { useState } from "react";
import { Building2, Check, Globe2, MapPin, Plus, Store, Users } from "lucide-react";
import { ADMIN_CITIES } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Toggle } from "@/components/ui/field";
import { BarChart } from "@/components/ui/chart";
import { formatCompact, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

type City = (typeof ADMIN_CITIES)[number];

export default function AdminCitiesPage() {
  const { t, tr, locale } = useI18n();
  const { toast } = useStore();
  const [cities, setCities] = useState<City[]>(ADMIN_CITIES);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ fa: "", en: "", districts: 1 });

  const active = cities.filter((c) => c.active);
  const maxProviders = Math.max(...cities.map((c) => c.providers), 1);

  const toggle = (id: string) => {
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
    const city = cities.find((c) => c.id === id);
    toast(
      city?.active
        ? locale === "fa"
          ? `${tr(city.name)} غیرفعال شد.`
          : `${tr(city!.name)} deactivated.`
        : locale === "fa"
          ? `${tr(city!.name)} فعال شد.`
          : `${tr(city!.name)} activated.`,
      city?.active ? "warn" : "success",
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          <Globe2 size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.city.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.city.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success" size="md" icon={<Check size={12} />}>
            {localDigits(active.length, locale)} {t("ad.city.active")}
          </Badge>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setAdding(true)}>
            {t("ad.city.add")}
          </Button>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-sm font-extrabold text-ink-950">{t("ad.city.providers")}</h2>
        <div className="mt-4">
          <BarChart
            data={cities.map((c) => c.providers)}
            labels={cities.map((c) => tr(c.name))}
            height={140}
            color="var(--color-brand-500)"
            valueFormatter={(v) => formatCompact(v, locale)}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {cities.map((c) => (
          <article
            key={c.id}
            className={cn("card overflow-hidden", !c.active && "opacity-75")}
          >
            <div className="flex items-start gap-3 p-4">
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
                  c.active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-400",
                )}
              >
                <Building2 size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-extrabold text-ink-950">{tr(c.name)}</h2>
                  {c.active ? (
                    <Badge tone="success" size="sm">{t("ad.city.active")}</Badge>
                  ) : (
                    <Badge tone="warn" size="sm">{t("common.inactive")}</Badge>
                  )}
                </div>
                <p className="tnum mt-1 text-[11px] text-ink-500">
                  {localDigits(c.districts, locale)} {t("ad.city.districts")}
                </p>
              </div>
              <div className="shrink-0">
                <Toggle checked={c.active} onChange={() => toggle(c.id)} />
              </div>
            </div>

            <div className="grid gap-px border-y border-ink-200 bg-ink-200 sm:grid-cols-3">
              <Mini label={t("ad.city.providers")} value={formatCompact(c.providers, locale)} icon={<Store size={12} />} />
              <Mini label={t("ad.users.title")} value={formatCompact(c.users, locale)} icon={<Users size={12} />} />
              <Mini label={t("ad.bookings")} value={formatCompact(c.bookingsThisMonth, locale)} icon={<MapPin size={12} />} />
            </div>

            <div className="px-4 py-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    c.active ? "bg-gradient-to-r from-brand-500 to-sky-500" : "bg-ink-300",
                  )}
                  style={{ width: `${Math.round((c.providers / maxProviders) * 100)}%` }}
                />
              </div>
              <p className="tnum mt-2 text-[10px] text-ink-400">
                {localDigits(Math.round((c.providers / maxProviders) * 100), locale)}٪{" "}
                {locale === "fa" ? "از بیشترین شهر" : "of the largest city"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={t("ad.city.add")}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAdding(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!draft.fa.trim()}
              onClick={() => {
                setCities((prev) => [
                  ...prev,
                  {
                    id: `ct${Date.now()}`,
                    name: { fa: draft.fa, en: draft.en || draft.fa },
                    districts: draft.districts,
                    providers: 0,
                    users: 0,
                    active: false,
                    bookingsThisMonth: 0,
                  },
                ]);
                toast(
                  locale === "fa"
                    ? `شهر «${draft.fa}» افزوده شد؛ برای شروع، باید فعال شود.`
                    : `City “${draft.en || draft.fa}” added — activate it to go live.`,
                  "success",
                );
                setAdding(false);
                setDraft({ fa: "", en: "", districts: 1 });
              }}
            >
              {t("ad.city.add")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={`${t("ad.city.name")} (فارسی)`} required>
            <Input value={draft.fa} onChange={(e) => setDraft({ ...draft, fa: e.target.value })} placeholder="مثلاً: تبریز" />
          </Field>
          <Field label={`${t("ad.city.name")} (English)`}>
            <Input dir="ltr" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} placeholder="e.g. Tabriz" />
          </Field>
          <Field label={t("ad.city.districts")}>
            <Input
              dir="ltr"
              type="number"
              min={1}
              value={draft.districts}
              onChange={(e) => setDraft({ ...draft, districts: Number(e.target.value) || 1 })}
              className="tnum text-start"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function Mini({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-ink-500">
        {icon}
        {label}
      </p>
      <p className="tnum mt-1 text-sm font-black text-ink-950">{value}</p>
    </div>
  );
}

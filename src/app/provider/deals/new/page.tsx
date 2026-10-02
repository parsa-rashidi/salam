"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Clock,
  Flame,
  Home,
  Info,
  MapPinned,
  Megaphone,
  Percent,
  Store,
  Users,
  Zap,
} from "lucide-react";
import type { FlashDeal } from "@/types";
import { CURRENT_PROVIDER } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, ChoiceCard, Field, Input, Select, Textarea } from "@/components/ui/field";
import { RangeInput } from "@/components/customer/filter-panel";
import { DealCard } from "@/components/customer/deal-card";
import {
  buildDayOptions,
  formatClock,
  formatDate,
  formatDuration,
  formatMoney,
  formatMoneyShort,
  localDigits,
} from "@/lib/format";
import { generateSlots } from "@/lib/queries";
import { cn } from "@/lib/cn";

const ProvidersMap = dynamic(() => import("@/components/map/providers-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-100">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-deal-600" />
    </div>
  ),
});

export default function NewDealPage() {
  const { t, tr, locale } = useI18n();
  const { services, addDeal, toast } = useStore();
  const router = useRouter();

  const days = buildDayOptions(7, locale);
  const [dayIndex, setDayIndex] = useState(1);
  const slots = generateSlots(CURRENT_PROVIDER, dayIndex);

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const originalPrice = service?.price ?? 400_000;

  const [time, setTime] = useState(slots[Math.min(2, slots.length - 1)] ?? "09:00");
  const [price, setPrice] = useState(Math.round(originalPrice * 0.6));
  const [capacity, setCapacity] = useState(3);
  const [radius, setRadius] = useState(5);
  const [validMinutes, setValidMinutes] = useState(180);
  const [mode, setMode] = useState<"salon" | "home">("salon");
  const [boost, setBoost] = useState<"basic" | "neighborhood" | "city">("basic");
  const [note, setNote] = useState("");
  const [autoDeactivate, setAutoDeactivate] = useState(true);

  // keep date + time consistent
  const dayISO = new Date();
  dayISO.setDate(dayISO.getDate() + dayIndex);
  dayISO.setHours(Number(time.split(":")[0]), Number(time.split(":")[1]), 0, 0);

  const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const saving = Math.max(0, originalPrice - price);
  const boostFee = boost === "basic" ? 0 : boost === "neighborhood" ? 45_000 : 120_000;
  const reach = boost === "basic" ? 3 : boost === "neighborhood" ? 8 : 25;
  const effectiveRadius = Math.max(radius, reach);

  const priceInvalid = price >= originalPrice || price <= 0;

  const preview: FlashDeal = {
    id: "preview",
    providerId: CURRENT_PROVIDER.id,
    categoryId: service?.categoryId ?? "haircut",
    serviceName: service?.name ?? { fa: "کوتاهی مو", en: "Haircut" },
    originalPrice,
    dealPrice: price,
    dateISO: localISO(dayISO),
    expiresAtISO: localISO(new Date(dayISO.getTime() + validMinutes * 60000)),
    capacity: capacity,
    remaining: capacity,
    radiusKm: effectiveRadius,
    cancellationNote: CANCELLATION_NOTE,
    lat: CURRENT_PROVIDER.lat,
    lng: CURRENT_PROVIDER.lng,
    district: CURRENT_PROVIDER.district,
    mode,
    boost,
    note: note.trim() ? { fa: note, en: note } : undefined,
  };

  const submit = () => {
    addDeal({ ...preview, id: `d${Date.now()}` });
    toast(
      locale === "fa"
        ? `پیشنهاد ویژه ثبت شد و تا ${formatClock(time, locale)} فعال است.`
        : `Flash deal published — active until ${formatClock(time, locale)}.`,
      "success",
      { label: t("pp.deal.title"), href: "/provider/deals" },
    );
    router.push("/provider/deals");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-500 text-white">
          <Flame size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.deal.newTitle")}</h1>
          <p className="text-xs text-ink-500">{t("pp.deal.subtitle")}</p>
        </div>
        <ButtonLink href="/provider/deals" variant="outline" size="sm" icon={<ArrowRight size={14} className="rtl:rotate-180" />}>
          {t("pp.deal.title")}
        </ButtonLink>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* ---------------- form ---------------- */}
        <div className="space-y-5">
          {/* service */}
          <section className="card p-5">
            <StepHead n={1} icon={<Zap size={14} />} title={t("pp.deal.service")} />
            <div className="mt-3">
              <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {tr(s.name)} — {formatMoney(s.price, locale)} · {formatDuration(s.durationMin, locale)}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          {/* price */}
          <section className="card p-5">
            <StepHead n={2} icon={<Percent size={14} />} title={t("pp.deal.price")} />
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label={t("pp.deal.originalPrice")}>
                <Input
                  dir="ltr"
                  type="number"
                  value={originalPrice}
                  readOnly
                  className="tnum bg-ink-50 text-start"
                />
              </Field>
              <Field
                label={t("pp.deal.dealPrice")}
                hint={formatMoney(price, locale)}
                error={priceInvalid ? (locale === "fa" ? "قیمت تخفیف باید کمتر از قیمت اصلی باشد." : "The deal price must be lower than the original.") : undefined}
              >
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  step={5000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className={cn("tnum text-start", priceInvalid && "border-red-400")}
                />
              </Field>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[70, 60, 50, 40].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setPrice(Math.round((originalPrice * pct) / 100 / 1000) * 1000)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-colors",
                    discount === 100 - pct
                      ? "border-deal-600 bg-deal-500 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-deal-400",
                  )}
                >
                  {localDigits(100 - pct, locale)}٪ {locale === "fa" ? "تخفیف" : "off"}
                </button>
              ))}
            </div>

            <div
              className={cn(
                "mt-4 flex items-center gap-3 rounded-2xl border p-3.5",
                priceInvalid ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50",
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                <Percent size={16} className={priceInvalid ? "text-red-600" : "text-emerald-600"} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-extrabold", priceInvalid ? "text-red-900" : "text-emerald-900")}>
                  {localDigits(Math.max(0, discount), locale)}٪ {locale === "fa" ? "تخفیف" : "discount"}
                </p>
                <p className="tnum mt-0.5 text-[11px] text-ink-600">
                  {locale === "fa" ? "صرفه‌جویی مشتری" : "Customer saves"}: {formatMoney(saving, locale)} ·{" "}
                  {locale === "fa" ? "درآمد شما" : "Your revenue"}: {formatMoney(price, locale)}
                </p>
              </div>
            </div>
          </section>

          {/* date & time */}
          <section className="card p-5">
            <StepHead n={3} icon={<Clock size={14} />} title={t("pp.deal.dateTime")} />

            <div className="scroll-thin mt-3 flex gap-2 overflow-x-auto pb-2">
              {days.map((d, i) => (
                <button
                  key={d.iso}
                  onClick={() => {
                    setDayIndex(i);
                    setTime(generateSlots(CURRENT_PROVIDER, i)[2] ?? time);
                  }}
                  className={cn(
                    "w-24 shrink-0 rounded-2xl border-2 p-2.5 text-center transition-all",
                    i === dayIndex
                      ? "border-deal-500 bg-deal-50 shadow-deal"
                      : "border-ink-200 bg-white hover:border-deal-300",
                  )}
                >
                  <span className="block text-[10px] font-bold text-deal-700">{d.weekdayLabel}</span>
                  <span className="tnum mt-1 block text-base font-black text-ink-950">{localDigits(d.date.getDate(), locale)}</span>
                  <span className="block text-[10px] text-ink-500">{d.monthLabel}</span>
                </button>
              ))}
            </div>

            <div className="mt-3">
              <p className="mb-2 text-xs font-bold text-ink-800">{t("booking.pickTime")}</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTime(s)}
                    className={cn(
                      "tnum rounded-xl border-2 py-2.5 text-xs font-extrabold transition-all",
                      s === time
                        ? "border-deal-500 bg-deal-500 text-white shadow-deal"
                        : "border-ink-200 bg-white text-ink-700 hover:border-deal-300",
                    )}
                  >
                    {formatClock(s, locale)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t("pp.deal.validity")} hint={`${localDigits(validMinutes / 60, locale)} ${locale === "fa" ? "ساعت" : "hours"}`}>
                <Select
                  value={String(validMinutes)}
                  onChange={(e) => setValidMinutes(Number(e.target.value))}
                >
                  {[60, 90, 120, 180, 240, 360, 720].map((m) => (
                    <option key={m} value={m}>
                      {formatDuration(m, locale)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("pp.deal.capacity")} hint={`${localDigits(capacity, locale)} ${locale === "fa" ? "رزرو" : "bookings"}`}>
                <Input
                  dir="ltr"
                  type="number"
                  min={1}
                  max={12}
                  value={capacity}
                  onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))}
                  className="tnum text-start"
                />
              </Field>
            </div>

            <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50 p-3.5">
              <Checkbox
                checked={autoDeactivate}
                onChange={setAutoDeactivate}
                label={
                  <span className="text-xs font-bold">{t("pp.deal.autoDeactivate")}</span>
                }
              />
              <p className="mt-2 ps-7 text-[11px] leading-relaxed text-ink-500">
                {t("pp.deal.autoDeactivateHint")}
              </p>
            </div>
          </section>

          {/* mode + radius */}
          <section className="card p-5">
            <StepHead n={4} icon={<MapPinned size={14} />} title={t("pp.deal.visibility")} />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                selected={mode === "salon"}
                onClick={() => setMode("salon")}
                icon={<Store size={18} />}
                title={t("explore.inSalon")}
              />
              <ChoiceCard
                selected={mode === "home"}
                onClick={() => setMode("home")}
                icon={<Home size={18} />}
                title={t("explore.atHome")}
                body={t("profile.homeOnly")}
              />
            </div>

            <div className="mt-4">
              <Field
                label={t("pp.deal.radius")}
                hint={`${localDigits(effectiveRadius, locale)} ${t("common.km")}`}
              >
                <RangeInput min={1} max={25} step={1} value={effectiveRadius} onChange={setRadius} />
              </Field>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-500">
                <Users size={12} />
                {locale === "fa"
                  ? `حدود ${localDigits(effectiveRadius * 320, locale)} کاربر در این شعاع`
                  : `About ${localDigits(effectiveRadius * 320, locale)} users within this radius`}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-800">
                <Megaphone size={13} className="text-deal-600" />
                {t("pp.deal.boost")}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {(
                  [
                    { id: "basic", name: { fa: "پایه", en: "Basic" }, fee: 0, reach: 3 },
                    { id: "neighborhood", name: { fa: "محله", en: "Neighborhood" }, fee: 45_000, reach: 8 },
                    { id: "city", name: { fa: "شهر", en: "City-wide" }, fee: 120_000, reach: 25 },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBoost(b.id);
                      setRadius(Math.max(radius, b.reach));
                    }}
                    className={cn(
                      "rounded-2xl border-2 p-3 text-start transition-all",
                      boost === b.id ? "border-deal-500 bg-deal-50 shadow-deal" : "border-ink-200 bg-white hover:border-deal-300",
                    )}
                  >
                    <span className="block text-xs font-extrabold text-ink-950">{tr(b.name)}</span>
                    <span className="tnum mt-1 block text-sm font-black text-deal-600">
                      {b.fee === 0 ? t("common.free") : formatMoneyShort(b.fee, locale)}
                    </span>
                    <span className="tnum mt-0.5 block text-[10px] text-ink-500">
                      {localDigits(b.reach, locale)} {t("common.km")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* note */}
          <section className="card p-5">
            <StepHead n={5} icon={<Info size={14} />} title={t("misc.notes")} />
            <div className="mt-3">
              <Textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  locale === "fa"
                    ? "مثلاً: فقط برای دو نفر اول — همراه با شست‌وشوی رایگان"
                    : "e.g. First two customers only — includes a free wash"
                }
              />
            </div>
          </section>
        </div>

        {/* ---------------- live preview ---------------- */}
        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="card p-4">
            <h2 className="text-sm font-extrabold text-ink-950">{t("pp.deal.preview")}</h2>
            <p className="mt-0.5 text-[11px] text-ink-500">
              {locale === "fa"
                ? "همان چیزی که مشتری در صفحهٔ تخفیف‌ها و روی نقشه می‌بیند."
                : "Exactly what customers see on the deals page and on the map."}
            </p>
            <div className="mt-3">
              <DealCard deal={preview} variant="compact" />
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="h-56">
              <ProvidersMap
                providers={[CURRENT_PROVIDER]}
                deals={[preview]}
                showDeals
                radiusKm={effectiveRadius}
                center={{ lat: CURRENT_PROVIDER.lat, lng: CURRENT_PROVIDER.lng }}
                zoom={13}
                fitToMarkers={false}
                className="h-full w-full"
              />
            </div>
            <div className="flex items-center gap-2 border-t border-ink-200 bg-ink-50 px-4 py-3 text-[11px] text-ink-600">
              <MapPinned size={13} className="text-deal-600" />
              {t("deals.visibilityRadius", { km: localDigits(effectiveRadius, locale) })}
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-extrabold text-ink-950">{locale === "fa" ? "خلاصهٔ هزینه" : "Cost summary"}</h2>
            <ul className="mt-3 space-y-2 text-xs">
              <Row label={t("pp.deal.originalPrice")} value={formatMoney(originalPrice, locale)} />
              <Row label={t("pp.deal.dealPrice")} value={formatMoney(price, locale)} tone="deal" strong />
              <Row label={t("pp.deal.capacity")} value={`${localDigits(capacity, locale)}`} />
              <Row label={t("pp.deal.boost")} value={boostFee === 0 ? t("common.free") : formatMoney(boostFee, locale)} />
              <div className="my-1 border-t border-dashed border-ink-200" />
              <Row
                label={locale === "fa" ? "درآمد احتمالی کل" : "Potential total revenue"}
                value={formatMoney(price * capacity, locale)}
                tone="brand"
                strong
              />
            </ul>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-ink-200 bg-white p-4 text-[11px] leading-relaxed text-ink-600">
            <Info size={14} className="mt-0.5 shrink-0 text-brand-600" />
            {t("pp.deal.autoNote")}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="deal"
              size="lg"
              disabled={priceInvalid}
              icon={<Flame size={17} />}
              onClick={submit}
              className="justify-center"
            >
              {t("pp.deal.createBtn")}
            </Button>
            <p className="tnum text-center text-[11px] text-ink-500">
              {t("common.validUntil")}: {formatDate(localISO(new Date(dayISO.getTime() + validMinutes * 60000)), locale)} ·{" "}
              {formatClock(
                new Date(dayISO.getTime() + validMinutes * 60000).toTimeString().slice(0, 5),
                locale,
              )}
            </p>
            <Link
              href="/provider/deals"
              className="mt-1 flex h-10 items-center justify-center rounded-xl border border-ink-300 bg-white text-xs font-bold text-ink-700 hover:bg-ink-50"
            >
              {t("common.cancel")}
            </Link>
          </div>

          {!autoDeactivate && (
            <Badge tone="warn" size="md" className="justify-center">
              {t("pp.deal.autoDeactivateHint")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

const CANCELLATION_NOTE = {
  fa: "لغو تا ۲ ساعت قبل بدون جریمه است؛ پس از آن، زمان آزاد دوباره به سایر مشتریان نمایش داده می‌شود.",
  en: "Free cancellation up to 2 hours before; after that the slot is released to other customers again.",
};

function localISO(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function StepHead({ n, icon, title }: { n: number; icon: React.ReactNode; title: string }) {
  const { locale } = useI18n();
  return (
    <h2 className="flex items-center gap-2.5 text-sm font-extrabold text-ink-950">
      <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-deal-500 text-[11px] font-black text-white">
        {localDigits(n, locale)}
      </span>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-deal-50 text-deal-700">{icon}</span>
      {title}
    </h2>
  );
}

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: "deal" | "brand";
  strong?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-ink-500">{label}</span>
      <span
        className={cn(
          "tnum",
          strong ? "text-sm font-black" : "font-bold",
          tone === "deal" ? "text-deal-600" : tone === "brand" ? "text-brand-700" : "text-ink-950",
        )}
      >
        {value}
      </span>
    </li>
  );
}

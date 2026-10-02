"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  Accessibility,
  BadgeCheck,
  Building2,
  Check,
  Clock,
  FileUp,
  Home,
  MapPin,
  Phone,
  Ruler,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { CURRENT_PROVIDER } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChoiceCard, Field, Input, Select, Textarea, Toggle } from "@/components/ui/field";
import { RangeInput } from "@/components/customer/filter-panel";
import { formatMoney, localDigits, weekDayLabels } from "@/lib/format";
import { cn } from "@/lib/cn";

const LocationPicker = dynamic(() => import("@/components/map/location-picker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-100">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
    </div>
  ),
});

export default function ProviderSettingsPage() {
  const { t, tr, locale } = useI18n();
  const { settings, updateSettings, toast } = useStore();
  const [pos, setPos] = useState({ lat: CURRENT_PROVIDER.lat, lng: CURRENT_PROVIDER.lng });
  const [salonAddress, setSalonAddress] = useState(tr(CURRENT_PROVIDER.address));
  const [idStatus, setIdStatus] = useState<"verified" | "pending">("pending");

  const days = weekDayLabels(locale);

  const setDay = (index: number, patch: Partial<{ open: string; close: string; closed: boolean }>) => {
    updateSettings({
      workingHours: settings.workingHours.map((w) => (w.day === index ? { ...w, ...patch } : w)),
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* header */}
      <div className="card flex flex-wrap items-center gap-4 p-4">
        <Avatar name={tr(CURRENT_PROVIDER.name)} accent={CURRENT_PROVIDER.accent} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-base font-extrabold text-ink-950">
            {t("pp.set.title")}
            {CURRENT_PROVIDER.verified && <BadgeCheck size={16} className="text-brand-600" />}
          </h1>
          <p className="text-xs text-ink-500">{t("pp.set.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/providers/${CURRENT_PROVIDER.id}`}
            className="flex h-9 items-center rounded-lg border border-ink-300 bg-white px-3 text-xs font-bold text-ink-700 hover:bg-ink-50"
          >
            {t("pp.viewPublicProfile")}
          </Link>
          <Button
            size="sm"
            icon={<Save size={14} />}
            onClick={() => toast(t("pp.set.savedOk"), "success")}
          >
            {t("common.save")}
          </Button>
        </div>
      </div>

      {/* badge preview */}
      <section className="card p-4">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
          <ShieldCheck size={15} className="text-brand-600" />
          {t("pp.set.badgePreview")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="brand" size="lg" icon={<BadgeCheck size={13} />}>{t("card.verified")}</Badge>
          {settings.seniorFriendly && (
            <Badge tone="violet" size="lg" icon={<Accessibility size={13} />}>{t("card.seniorFriendly")}</Badge>
          )}
          {settings.accessibilityTrained && (
            <Badge tone="info" size="lg" icon={<Accessibility size={13} />}>{t("card.accessibility")}</Badge>
          )}
          {settings.acceptsInstant && (
            <Badge tone="deal" size="lg" icon={<Zap size={13} />}>{t("card.instant")}</Badge>
          )}
          {settings.modes.home && (
            <Badge tone="neutral" size="lg" icon={<Home size={13} />}>{t("explore.atHome")}</Badge>
          )}
          {settings.modes.salon && (
            <Badge tone="neutral" size="lg" icon={<Store size={13} />}>{t("explore.inSalon")}</Badge>
          )}
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500">
          {locale === "fa"
            ? "این نشان‌ها در کارت آرایشگر، پروفایل عمومی و نتایج جست‌وجو نمایش داده می‌شوند."
            : "These badges appear on the stylist card, the public profile and in search results."}
        </p>
      </section>

      {/* basic info */}
      <section className="card p-5">
        <SectionTitle icon={<User size={15} />} title={t("pp.set.basicInfo")} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("pp.set.displayName")} required>
            <Input
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
            />
          </Field>
          <Field label={t("pp.set.kind")}>
            <Select
              value={settings.kind}
              onChange={(e) => updateSettings({ kind: e.target.value as "independent" | "salon" })}
            >
              <option value="independent">{t("pp.set.kindIndependent")}</option>
              <option value="salon">{t("pp.set.kindSalon")}</option>
            </Select>
          </Field>
          <Field label={t("pp.set.gender")}>
            <Select
              value={settings.gender}
              onChange={(e) => updateSettings({ gender: e.target.value as "male" | "female" })}
            >
              <option value="male">{t("pp.set.male")}</option>
              <option value="female">{t("pp.set.female")}</option>
            </Select>
          </Field>
          <Field label={t("auth.phoneLabel")}>
            <Input dir="ltr" value="+98 912 445 6789" readOnly className="tnum bg-ink-50 text-start" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label={t("pp.set.bio")} hint={`${localDigits(settings.bio.length, locale)} / 400`}>
            <Textarea
              rows={4}
              maxLength={400}
              value={settings.bio}
              onChange={(e) => updateSettings({ bio: e.target.value })}
              placeholder={t("pp.set.bioPlaceholder")}
            />
          </Field>
        </div>
      </section>

      {/* modes */}
      <section className="card p-5">
        <SectionTitle icon={<Sparkles size={15} />} title={t("pp.set.modes")} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ChoiceCard
            selected={settings.modes.salon && settings.modes.home}
            onClick={() => updateSettings({ modes: { salon: true, home: true } })}
            icon={<Building2 size={18} />}
            title={t("pp.set.modeBoth")}
          />
          <ChoiceCard
            selected={settings.modes.salon && !settings.modes.home}
            onClick={() => updateSettings({ modes: { salon: true, home: false } })}
            icon={<Store size={18} />}
            title={t("pp.set.modeSalon")}
          />
          <ChoiceCard
            selected={!settings.modes.salon && settings.modes.home}
            onClick={() => updateSettings({ modes: { salon: false, home: true } })}
            icon={<Home size={18} />}
            title={t("pp.set.modeHome")}
          />
        </div>
      </section>

      {/* location */}
      <section className="card p-5">
        <SectionTitle icon={<MapPin size={15} />} title={t("pp.set.locationSection")} />

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Field label={t("pp.set.salonAddress")}>
              <Textarea rows={2} value={salonAddress} onChange={(e) => setSalonAddress(e.target.value)} />
            </Field>

            <Field
              label={t("pp.set.homeRadius")}
              hint={t("profile.homeRadiusValue", { km: localDigits(settings.homeRadiusKm, locale) })}
            >
              <RangeInput
                min={0}
                max={20}
                step={1}
                value={settings.homeRadiusKm}
                onChange={(v) => updateSettings({ homeRadiusKm: v })}
              />
            </Field>

            <Field label={t("pp.set.travelFee")} hint={formatMoney(settings.travelFee, locale)}>
              <Input
                dir="ltr"
                type="number"
                min={0}
                step={10000}
                value={settings.travelFee}
                onChange={(e) => updateSettings({ travelFee: Number(e.target.value) || 0 })}
                className="tnum text-start"
              />
            </Field>
          </div>

          <div>
            <div className="relative h-64 overflow-hidden rounded-2xl border border-ink-200 lg:h-full lg:min-h-[16rem]">
              <LocationPicker
                position={pos}
                radiusKm={settings.modes.home ? settings.homeRadiusKm : null}
                onChange={setPos}
                className="h-full w-full"
              />
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
              <Ruler size={12} className="mt-0.5 shrink-0" />
              {t("pp.set.mapHint")}
            </p>
          </div>
        </div>

        {/* travel zones */}
        <div className="mt-5">
          <h3 className="flex items-center gap-2 text-xs font-extrabold text-ink-900">
            <Wallet size={14} className="text-brand-600" />
            {t("pp.set.travelFeeByZone")}
          </h3>
          <div className="mt-2.5 overflow-hidden rounded-2xl border border-ink-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold text-ink-500">
                  <th className="px-4 py-2.5 text-start">{t("pp.set.zone")}</th>
                  <th className="px-4 py-2.5 text-start">{t("explore.filterDistance")}</th>
                  <th className="px-4 py-2.5 text-start">{t("profile.travelFee")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {settings.travelZones.map((z) => (
                  <tr key={z.zone} className="hover:bg-brand-50/30">
                    <td className="px-4 py-2.5 text-xs font-bold text-ink-900">{z.zone}</td>
                    <td className="tnum px-4 py-2.5 text-xs text-ink-600">
                      ≤ {localDigits(z.km, locale)} {t("common.km")}
                    </td>
                    <td className="tnum px-4 py-2.5 text-xs font-extrabold text-brand-700">
                      {formatMoney(z.fee, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* capabilities */}
      <section className="card border-violet-200 bg-violet-50/30 p-5">
        <SectionTitle icon={<Accessibility size={15} />} title={t("pp.set.capabilities")} tone="violet" />
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-violet-200 bg-white p-4">
            <Toggle
              checked={settings.seniorFriendly}
              onChange={(v) => updateSettings({ seniorFriendly: v })}
              label={t("pp.set.seniorFriendly")}
              hint={t("pp.set.seniorFriendlyHint")}
            />
          </div>
          <div className="rounded-2xl border border-sky-200 bg-white p-4">
            <Toggle
              checked={settings.accessibilityTrained}
              onChange={(v) => updateSettings({ accessibilityTrained: v })}
              label={t("pp.set.accessibilityTrained")}
              hint={t("pp.set.accessibilityHint")}
            />
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <Toggle
              checked={settings.acceptsInstant}
              onChange={(v) => updateSettings({ acceptsInstant: v })}
              label={
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-deal-600" />
                  {t("pp.instantToggle")}
                </span>
              }
              hint={t("pp.instantToggleHint")}
            />
          </div>
        </div>
      </section>

      {/* working hours */}
      <section className="card p-5">
        <SectionTitle icon={<Clock size={15} />} title={t("pp.set.workingHoursTitle")} />
        <div className="mt-4 space-y-2">
          {days.map((d) => {
            const wh = settings.workingHours.find((w) => w.day === d.index);
            const closed = !wh || wh.closed;
            return (
              <div
                key={d.index}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-2xl border p-3 transition-colors",
                  closed ? "border-ink-200 bg-ink-50" : "border-brand-200 bg-brand-50/40",
                )}
              >
                <span className="w-20 shrink-0 text-xs font-extrabold text-ink-800">{d.label}</span>
                <label className="flex items-center gap-2 text-[11px] font-bold text-ink-600">
                  <input
                    type="checkbox"
                    checked={closed}
                    onChange={(e) => setDay(d.index, { closed: e.target.checked })}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {t("pp.set.closedDay")}
                </label>
                <div className={cn("flex flex-1 items-center gap-2", closed && "pointer-events-none opacity-40")}>
                  <Input
                    dir="ltr"
                    type="time"
                    value={wh?.open ?? "09:00"}
                    onChange={(e) => setDay(d.index, { open: e.target.value })}
                    className="tnum h-9 w-32 text-start"
                  />
                  <span className="text-ink-400">—</span>
                  <Input
                    dir="ltr"
                    type="time"
                    value={wh?.close ?? "20:00"}
                    onChange={(e) => setDay(d.index, { close: e.target.value })}
                    className="tnum h-9 w-32 text-start"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500">
          <Clock size={12} />
          {locale === "fa"
            ? "زمان‌های آزاد بر اساس همین ساعات و مدت زمان هر خدمت ساخته می‌شوند."
            : "Free slots are generated from these hours and each service's duration."}
        </div>
      </section>

      {/* verification */}
      <section className="card p-5">
        <SectionTitle icon={<ShieldCheck size={15} />} title={t("pp.set.verification")} />
        <div className="mt-4 space-y-2.5">
          <VerifyRow
            ok
            icon={<Phone size={15} />}
            label={t("pp.set.phoneVerified")}
            value="+98 912 445 6789"
          />
          <VerifyRow
            ok={idStatus === "verified"}
            icon={<BadgeCheck size={15} />}
            label={idStatus === "verified" ? t("pp.set.idVerified") : t("pp.set.idPending")}
            value={locale === "fa" ? "کد ملی: ***۴۵۶۷" : "National ID: ***4567"}
            action={
              idStatus === "pending" ? (
                <Button variant="outline" size="xs" icon={<FileUp size={12} />} onClick={() => setIdStatus("verified")}>
                  {t("pp.set.uploadDocs")}
                </Button>
              ) : undefined
            }
          />
          <VerifyRow
            ok={CURRENT_PROVIDER.verified}
            icon={<ShieldCheck size={15} />}
            label={locale === "fa" ? "تأیید کسب‌وکار توسط تیم مدیریت" : "Business approved by moderation"}
            value={CURRENT_PROVIDER.verified ? t("card.verified") : t("ad.rp.reviewing")}
          />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
          <Settings size={13} className="mt-0.5 shrink-0" />
          {locale === "fa"
            ? "تغییرات پس از ذخیره، در پروفایل عمومی و نتایج جست‌وجو اعمال می‌شوند."
            : "Once saved, changes apply to your public profile and search results."}
        </p>
        <Button icon={<Save size={15} />} onClick={() => toast(t("pp.set.savedOk"), "success")}>
          {t("common.save")}
        </Button>
      </div>

    </div>
  );
}

function SectionTitle({
  icon,
  title,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  tone?: "violet";
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg",
          tone === "violet" ? "bg-violet-100 text-violet-700" : "bg-brand-50 text-brand-700",
        )}
      >
        {icon}
      </span>
      {title}
    </h2>
  );
}

function VerifyRow({
  ok,
  icon,
  label,
  value,
  action,
}: {
  ok: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border p-3.5",
        ok ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          ok ? "bg-emerald-600 text-white" : "bg-amber-500 text-white",
        )}
      >
        {ok ? <Check size={16} /> : icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-extrabold", ok ? "text-emerald-900" : "text-amber-900")}>{label}</p>
        <p className="tnum mt-0.5 text-[11px] text-ink-600">{value}</p>
      </div>
      {action}
    </div>
  );
}

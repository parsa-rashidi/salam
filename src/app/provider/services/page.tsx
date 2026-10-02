"use client";

import { useState } from "react";
import {
  Baby,
  Brush,
  Crown,
  Flower,
  Hand,
  Home,
  Pencil,
  Palette,
  Plus,
  Scissors,
  Sparkles,
  SprayCan,
  Store,
  Trash2,
  Waves,
} from "lucide-react";
import type { CategoryId, ServiceItem } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { Checkbox, Field, Input, Select, Toggle } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { formatDuration, formatMoney, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const CATEGORY_ICON: Record<CategoryId, React.ComponentType<{ size?: number }>> = {
  haircut: Scissors,
  beard: SprayCan,
  color: Palette,
  facial: Sparkles,
  nails: Hand,
  makeup: Brush,
  bridal: Crown,
  kids: Baby,
  epilation: Flower,
  spa: Waves,
};

const BLANK: ServiceItem = {
  id: "",
  categoryId: "haircut",
  name: { fa: "", en: "" },
  price: 400_000,
  durationMin: 45,
  homeAvailable: true,
  homeSurcharge: 80_000,
};

export default function ProviderServicesPage() {
  const { t, tr, locale } = useI18n();
  const { services, saveService, removeService, toast } = useStore();
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [removing, setRemoving] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceItem>(BLANK);
  const [nameEn, setNameEn] = useState("");
  const [quickEdit, setQuickEdit] = useState<string | null>(null);

  const openNew = () => {
    setForm({ ...BLANK, id: `s${Date.now()}` });
    setNameEn("");
    setEditing(form);
  };

  const openEdit = (s: ServiceItem) => {
    setForm(s);
    setNameEn(s.name.en);
    setEditing(s);
  };

  const grouped = services.reduce<Record<string, ServiceItem[]>>((acc, s) => {
    (acc[s.categoryId] ??= []).push(s);
    return acc;
  }, {});

  const homeCount = services.filter((s) => s.homeAvailable).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Scissors size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.svc.title")}</h1>
          <p className="text-xs text-ink-500">{t("pp.svc.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral" size="md">
            {localDigits(services.length, locale)} {t("profile.servicesUnit")}
          </Badge>
          <Badge tone="brand" size="md" icon={<Home size={12} />}>
            {localDigits(homeCount, locale)} {t("explore.atHome")}
          </Badge>
          <Button size="sm" icon={<Plus size={14} />} onClick={openNew}>
            {t("pp.svc.addNew")}
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<Scissors size={28} />}
          title={t("pp.svc.empty")}
          action={<Button size="sm" icon={<Plus size={14} />} onClick={openNew}>{t("pp.svc.addNew")}</Button>}
        />
      ) : (
        Object.entries(grouped).map(([cat, list]) => {
          const Icon = CATEGORY_ICON[cat as CategoryId] ?? Scissors;
          return (
            <section key={cat} className="card overflow-hidden">
              <header className="flex items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-brand-700 shadow-sm">
                  <Icon size={15} />
                </span>
                <h2 className="text-sm font-extrabold text-ink-950">
                  {t(`cat.${cat}` as TranslationKey)}
                </h2>
                <span className="tnum ms-auto text-[11px] font-bold text-ink-500">
                  {localDigits(list.length, locale)}
                </span>
              </header>

              <ul className="divide-y divide-ink-100">
                {list.map((s) => (
                  <li key={s.id} className="group px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink-950">{tr(s.name)}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-500">
                          <span className="tnum">{formatDuration(s.durationMin, locale)}</span>
                          <span>·</span>
                          <span className="tnum">{t("profile.priceHome")}: {formatMoney(s.price + (s.homeSurcharge ?? 0), locale)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {s.homeAvailable ? (
                          <Badge tone="brand" size="sm" icon={<Home size={11} />}>
                            {t("explore.atHome")}
                          </Badge>
                        ) : (
                          <Badge tone="neutral" size="sm" icon={<Store size={11} />}>
                            {t("explore.inSalon")}
                          </Badge>
                        )}
                      </div>

                      {quickEdit === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            dir="ltr"
                            type="number"
                            value={s.price}
                            onChange={(e) =>
                              saveService({ ...s, price: Number(e.target.value) || 0 })
                            }
                            className="tnum h-9 w-32 text-end"
                          />
                          <Button
                            size="xs"
                            onClick={() => {
                              setQuickEdit(null);
                              toast(t("pp.svc.savedOk"), "success");
                            }}
                          >
                            {t("common.save")}
                          </Button>
                        </div>
                      ) : (
                        <p className="tnum w-32 shrink-0 text-end text-sm font-black text-ink-950">
                          {formatMoney(s.price, locale)}
                        </p>
                      )}

                      <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          onClick={() => setQuickEdit(quickEdit === s.id ? null : s.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50"
                          title={t("pp.svc.bulkEdit")}
                        >
                          <span className="tnum text-[10px] font-black">{locale === "fa" ? "٪" : "%"}</span>
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                          aria-label={t("common.edit")}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setRemoving(s)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={t("common.delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {/* ---------------- edit modal ---------------- */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing && services.some((s) => s.id === editing.id) ? t("pp.svc.editService") : t("pp.svc.addNew")}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!form.name[locale === "fa" ? "fa" : "en"].trim()}
              onClick={() => {
                saveService({ ...form, name: { fa: form.name.fa || form.name.en, en: nameEn || form.name.en || form.name.fa } });
                setEditing(null);
                toast(t("pp.svc.savedOk"), "success");
              }}
            >
              {t("common.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${t("pp.svc.name")} (${locale === "fa" ? "فارسی" : "English"})`} required>
              <Input
                value={form.name[locale]}
                onChange={(e) => setForm({ ...form, name: { ...form.name, [locale]: e.target.value } })}
                placeholder={locale === "fa" ? "مثلاً: کوتاهی مو مردانه" : "e.g. Men's haircut"}
              />
            </Field>
            <Field label={locale === "fa" ? "نام انگلیسی" : "Persian name"}>
              <Input
                dir={locale === "fa" ? "ltr" : "rtl"}
                value={locale === "fa" ? nameEn : form.name.fa}
                onChange={(e) => (locale === "fa" ? setNameEn(e.target.value) : setForm({ ...form, name: { ...form.name, fa: e.target.value } }))}
                placeholder={locale === "fa" ? "Men's haircut" : "کوتاهی مو مردانه"}
              />
            </Field>
          </div>

          <Field label={t("pp.svc.category")}>
            <Select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value as CategoryId })}
            >
              {(Object.keys(CATEGORY_ICON) as CategoryId[]).map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}` as TranslationKey)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("pp.svc.price")} hint={formatMoney(form.price, locale)}>
              <Input
                dir="ltr"
                type="number"
                min={0}
                step={10000}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
                className="tnum text-start"
              />
            </Field>
            <Field label={t("pp.svc.duration")} hint={formatDuration(form.durationMin, locale)}>
              <Input
                dir="ltr"
                type="number"
                min={5}
                step={5}
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) || 0 })}
                className="tnum text-start"
              />
            </Field>
          </div>

          <div className={cn("rounded-2xl border p-4", form.homeAvailable ? "border-brand-200 bg-brand-50/50" : "border-ink-200 bg-ink-50")}>
            <Toggle
              checked={form.homeAvailable}
              onChange={(v) => setForm({ ...form, homeAvailable: v })}
              label={
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Home size={15} className={form.homeAvailable ? "text-brand-700" : "text-ink-500"} />
                  {t("pp.svc.homeAvailable")}
                </span>
              }
            />
            {form.homeAvailable && (
              <div className="mt-4 animate-fade-in">
                <Field label={t("pp.svc.homeSurcharge")}>
                  <Input
                    dir="ltr"
                    type="number"
                    min={0}
                    step={10000}
                    value={form.homeSurcharge ?? 0}
                    onChange={(e) => setForm({ ...form, homeSurcharge: Number(e.target.value) || 0 })}
                    className="tnum text-start"
                  />
                </Field>
                <p className="mt-2 text-[11px] text-ink-500">
                  {t("profile.travelFeeHint")}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-ink-200 bg-ink-50 p-3.5">
            <Checkbox
              checked={form.durationMin >= 60}
              onChange={(v) => setForm({ ...form, durationMin: v ? 60 : 30 })}
              label={
                <span className="text-xs font-semibold">
                  {locale === "fa"
                    ? "این خدمت بیش از یک ساعت طول می‌کشد (زمان‌های آزاد بر همین اساس ساخته می‌شوند)."
                    : "This service takes over an hour (free slots are generated accordingly)."}
                </span>
              }
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={t("pp.svc.deleteConfirm")}
        body={removing ? tr(removing.name) : undefined}
        confirmLabel={t("common.delete")}
        onConfirm={() => {
          if (removing) removeService(removing.id);
          toast(t("common.delete"), "warn");
        }}
      />
    </div>
  );
}

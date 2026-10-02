"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Baby,
  Brush,
  Crown,
  Flower,
  Hand,
  Palette,
  Pencil,
  Plus,
  Scissors,
  Sparkles,
  SprayCan,
  Tags,
  Waves,
} from "lucide-react";
import { CATEGORIES, PROVIDERS } from "@/lib/mock-data";
import type { CategoryId } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Toggle } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { localDigits } from "@/lib/format";
import type { TranslationKey } from "@/i18n/dictionary";

const ICONS: Record<CategoryId, React.ComponentType<{ size?: number }>> = {
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

type Row = { id: CategoryId; order: number; active: boolean; nameFa: string; nameEn: string };

export default function AdminCategoriesPage() {
  const { t, locale } = useI18n();
  const { toast } = useStore();
  const [rows, setRows] = useState<Row[]>(
    CATEGORIES.map((c) => ({
      id: c.id,
      order: c.order,
      active: true,
      nameFa: "",
      nameEn: "",
    })),
  );
  const [editing, setEditing] = useState<Row | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ fa: "", en: "", order: 11 });

  const countFor = (id: CategoryId) =>
    PROVIDERS.filter((p) => p.services.some((s) => s.categoryId === id)).length;

  const move = (index: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev].sort((a, b) => a.order - b.order);
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((r, i) => ({ ...r, order: i + 1 }));
    });
  };

  const sorted = [...rows].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Tags size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.cat.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.cat.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral" size="md">
            {localDigits(rows.filter((r) => r.active).length, locale)} / {localDigits(rows.length, locale)}
          </Badge>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setAdding(true)}>
            {t("ad.cat.add")}
          </Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {sorted.map((r, i) => {
            const Icon = ICONS[r.id];
            const count = countFor(r.id);
            return (
              <li
                key={r.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 px-4 py-3 transition-colors",
                  r.active ? "hover:bg-brand-50/30" : "bg-ink-50/60 opacity-70",
                )}
              >
                <span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ink-100 text-[10px] font-black text-ink-500">
                  {localDigits(r.order, locale)}
                </span>
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    r.active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-400",
                  )}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-ink-950">
                    {t(`cat.${r.id}` as TranslationKey)}
                  </p>
                  {(r.nameFa || r.nameEn) && (
                    <p className="truncate text-[10px] text-ink-400">{r.nameFa || r.nameEn}</p>
                  )}
                </div>
                <span className="tnum shrink-0 rounded-lg bg-ink-100 px-2 py-1 text-[10px] font-bold text-ink-600">
                  {localDigits(count, locale)} {t("ad.cat.providers")}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
                    aria-label={t("ad.cat.order")}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === sorted.length - 1}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
                    aria-label={t("ad.cat.order")}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                <div className="w-24 shrink-0">
                  <Toggle
                    checked={r.active}
                    onChange={(v) =>
                      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: v } : x)))
                    }
                    label={
                      <span className="text-[10px] font-bold text-ink-500">
                        {r.active ? t("common.active") : t("common.inactive")}
                      </span>
                    }
                  />
                </div>

                <Button variant="ghost" size="xs" icon={<Pencil size={12} />} onClick={() => setEditing(r)}>
                  {t("common.edit")}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${t("common.edit")} — ${t(`cat.${editing.id}` as TranslationKey)}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (editing) {
                  setRows((prev) =>
                    prev.map((x) =>
                      x.id === editing.id ? { ...x, order: editing.order, nameFa: editing.nameFa, nameEn: editing.nameEn } : x,
                    ),
                  );
                }
                toast(locale === "fa" ? "دسته‌بندی ذخیره شد." : "Category saved.", "success");
                setEditing(null);
              }}
            >
              {t("common.save")}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label={`${t("ad.cat.name")} (فارسی)`}>
              <Input
                value={editing.nameFa || t(`cat.${editing.id}` as TranslationKey)}
                onChange={(e) => setEditing({ ...editing, nameFa: e.target.value })}
              />
            </Field>
            <Field label={`${t("ad.cat.name")} (English)`}>
              <Input
                dir="ltr"
                value={editing.nameEn}
                onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                placeholder={locale === "fa" ? "Haircut" : "کوتاهی مو"}
              />
            </Field>
            <Field label={t("ad.cat.order")}>
              <Input
                dir="ltr"
                type="number"
                min={1}
                max={99}
                value={editing.order}
                onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) || 1 })}
                className="tnum text-start"
              />
            </Field>
          </div>
        )}
      </Modal>

      {/* add modal */}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={t("ad.cat.add")}
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
                toast(
                  locale === "fa"
                    ? `دستهٔ «${draft.fa}» افزوده شد (نمونه).`
                    : `Category “${draft.en || draft.fa}” added (demo).`,
                  "success",
                );
                setAdding(false);
                setDraft({ fa: "", en: "", order: rows.length + 1 });
              }}
            >
              {t("ad.cat.add")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={`${t("ad.cat.name")} (فارسی)`} required>
            <Input value={draft.fa} onChange={(e) => setDraft({ ...draft, fa: e.target.value })} placeholder="مثلاً: ماساژ صورت" />
          </Field>
          <Field label={`${t("ad.cat.name")} (English)`}>
            <Input dir="ltr" value={draft.en} onChange={(e) => setDraft({ ...draft, en: e.target.value })} placeholder="e.g. Face massage" />
          </Field>
          <Field label={t("ad.cat.order")}>
            <Input
              dir="ltr"
              type="number"
              min={1}
              value={draft.order}
              onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 1 })}
              className="tnum text-start"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

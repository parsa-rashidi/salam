"use client";

import { useState } from "react";
import { CheckCircle2, CloudUpload, Images, Info, ShieldCheck } from "lucide-react";
import type { CategoryId, PortfolioItem } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { PortfolioGrid } from "@/components/customer/portfolio-grid";
import { localDigits } from "@/lib/format";
import type { TranslationKey } from "@/i18n/dictionary";

const SAMPLE_IMAGES = [
  "/images/portfolio/fade.jpg",
  "/images/portfolio/beard.jpg",
  "/images/portfolio/color.jpg",
  "/images/portfolio/bridal.jpg",
  "/images/portfolio/nails.jpg",
  "/images/portfolio/facial.jpg",
  "/images/portfolio/kids.jpg",
  "/images/portfolio/senior-home.jpg",
];

export default function ProviderPortfolioPage() {
  const { t, locale } = useI18n();
  const { portfolio, addPortfolioItem, removePortfolioItem, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<CategoryId>("haircut");
  const [picked, setPicked] = useState(SAMPLE_IMAGES[0]);
  const [dragOver, setDragOver] = useState(false);

  const submit = () => {
    const item: PortfolioItem = {
      id: `pf${Date.now()}`,
      image: picked,
      caption: { fa: caption, en: caption },
      categoryId: category,
      likes: 0,
    };
    addPortfolioItem(item);
    setOpen(false);
    setCaption("");
    toast(t("pp.pf.savedOk"), "success");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <Images size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.pf.title")}</h1>
          <p className="text-xs text-ink-500">{t("pp.pf.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success" size="md" icon={<CheckCircle2 size={12} />}>
            {localDigits(portfolio.filter((p) => p.likes > 0).length, locale)} {t("pp.pf.published")}
          </Badge>
          <Badge tone="warn" size="md">
            {localDigits(portfolio.filter((p) => p.likes === 0).length, locale)} {t("pp.pf.pendingReview")}
          </Badge>
          <Button size="sm" icon={<CloudUpload size={14} />} onClick={() => setOpen(true)}>
            {t("pp.pf.upload")}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-ink-200 bg-ink-50 p-3.5 text-[11px] leading-relaxed text-ink-600">
        <Info size={14} className="mt-0.5 shrink-0 text-brand-600" />
        {t("pp.pf.moderationNote")}
      </div>

      {portfolio.length === 0 ? (
        <EmptyState
          icon={<Images size={28} />}
          title={t("profile.portfolioEmpty")}
          body={t("pp.pf.subtitle")}
          action={<Button size="sm" icon={<CloudUpload size={14} />} onClick={() => setOpen(true)}>{t("pp.pf.upload")}</Button>}
        />
      ) : (
        <PortfolioGrid items={portfolio} columns={3} onRemove={removePortfolioItem} />
      )}

      {/* upload modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("pp.pf.upload")}
        description={t("pp.pf.subtitle")}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" disabled={!caption.trim()} onClick={submit}>
              {t("pp.pf.upload")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              toast(locale === "fa" ? "تصویر دریافت شد." : "Image received.", "success");
            }}
            className={`grid place-items-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
              dragOver ? "border-brand-500 bg-brand-50" : "border-ink-300 bg-ink-50"
            }`}
          >
            <CloudUpload size={30} className="text-ink-400" />
            <p className="mt-2 text-xs font-bold text-ink-600">{t("pp.pf.uploadHint")}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-ink-800">
              {locale === "fa" ? "یا یکی از تصاویر نمونه را انتخاب کنید" : "Or pick one of the sample images"}
            </p>
            <div className="scroll-thin flex gap-2 overflow-x-auto pb-2">
              {SAMPLE_IMAGES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPicked(src)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    picked === src ? "border-brand-600 ring-2 ring-brand-200" : "border-ink-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <Field label={t("pp.pf.caption")} required>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t("pp.pf.captionPlaceholder")} />
          </Field>

          <Field label={t("pp.svc.category")}>
            <Select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
              {(
                ["haircut", "beard", "color", "facial", "nails", "makeup", "bridal", "kids", "epilation", "spa"] as CategoryId[]
              ).map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}` as TranslationKey)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-[11px] leading-relaxed text-brand-900">
            <ShieldCheck size={13} className="mt-0.5 shrink-0" />
            {locale === "fa"
              ? "از انتشار تصویر چهرهٔ مشتری بدون رضایت کتبی او خودداری کنید."
              : "Do not publish a client's face without their written consent."}
          </div>
        </div>
      </Modal>
    </div>
  );
}

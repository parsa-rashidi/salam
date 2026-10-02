"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Images,
  MessageSquareQuote,
  Pencil,
  ShieldCheck,
  Star,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { ADMIN_PAGES, PROVIDERS, REVIEWS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/layout";
import { Tabs } from "@/components/ui/tabs";
import { Stars } from "@/components/ui/rating";
import { formatDate, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

type Tab = "portfolio" | "reviews" | "pages";

type PortRow = {
  id: string;
  image: string;
  caption: { fa: string; en: string };
  providerId: string;
  provider: { fa: string; en: string };
  accent: string;
  likes: number;
};

export default function AdminContentPage() {
  const { t, tr, locale } = useI18n();
  const { toast } = useStore();
  const [tab, setTab] = useState<Tab>("portfolio");
  const [hiddenIds, setHiddenIds] = useState<string[]>(["pf-w6"]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState<{ id: string; label: string } | null>(null);

  const portfolioRows: PortRow[] = PROVIDERS.flatMap((p) =>
    p.portfolio.map((pf) => ({
      id: pf.id,
      image: pf.image,
      caption: pf.caption,
      providerId: p.id,
      provider: p.name,
      accent: p.accent,
      likes: pf.likes,
    })),
  ).filter((r) => !deletedIds.includes(r.id));

  const reviewRows = REVIEWS.filter((r) => !deletedIds.includes(r.id));

  const toggleHide = (id: string, label: string) => {
    const isHidden = hiddenIds.includes(id);
    setHiddenIds((prev) => (isHidden ? prev.filter((x) => x !== id) : [...prev, id]));
    toast(isHidden ? `${t("ad.ct.show")}: ${label}` : `${t("ad.ct.hide")}: ${label}`, isHidden ? "success" : "warn");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShieldCheck size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.ct.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.ct.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral" size="md" icon={<Images size={12} />}>
            {localDigits(portfolioRows.length, locale)} {t("ad.ct.tabPortfolio")}
          </Badge>
          <Badge tone="neutral" size="md" icon={<MessageSquareQuote size={12} />}>
            {localDigits(reviewRows.length, locale)} {t("ad.ct.tabReviews")}
          </Badge>
          <Badge tone="danger" size="md" icon={<EyeOff size={12} />}>
            {localDigits(hiddenIds.length, locale)} {t("ad.ct.hidden")}
          </Badge>
        </div>
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: "portfolio", label: t("ad.ct.tabPortfolio"), count: localDigits(portfolioRows.length, locale), icon: <Images size={14} /> },
          { id: "reviews", label: t("ad.ct.tabReviews"), count: localDigits(reviewRows.length, locale), icon: <MessageSquareQuote size={14} /> },
          { id: "pages", label: t("ad.ct.tabPages"), count: localDigits(ADMIN_PAGES.length, locale), icon: <FileText size={14} /> },
        ]}
      />

      {/* ---------------- portfolio ---------------- */}
      {tab === "portfolio" && (
        <>
          <div className="flex items-start gap-2.5 rounded-2xl border border-ink-200 bg-ink-50 p-4 text-[11px] leading-relaxed text-ink-600">
            <Flag size={14} className="mt-0.5 shrink-0 text-brand-600" />
            {locale === "fa"
              ? "تصاویر دارای چهرهٔ قابل تشخیص مشتری، محتوای نامناسب یا تبلیغاتی بدون مجوز، پنهان یا حذف می‌شوند."
              : "Images showing an identifiable client's face, inappropriate content or unlicensed advertising get hidden or removed."}
          </div>

          {portfolioRows.length === 0 ? (
            <EmptyState icon={<Images size={28} />} title={t("ad.ct.deleted")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {portfolioRows.map((r) => {
                const isHidden = hiddenIds.includes(r.id);
                return (
                  <article key={r.id} className="card overflow-hidden">
                    <div className={cn("relative h-40 bg-ink-100", isHidden && "opacity-40")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.image}
                        alt={tr(r.caption)}
                        className={cn("h-full w-full object-cover", isHidden && "blur-[3px]")}
                      />
                      {isHidden && (
                        <span className="absolute inset-0 grid place-items-center bg-ink-950/50 text-[11px] font-bold text-white">
                          <EyeOff size={14} className="me-1.5 inline" />
                          {t("ad.ct.hidden")}
                        </span>
                      )}
                      <span className="tnum absolute top-2 end-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                        <ThumbsUp size={10} />
                        {localDigits(r.likes, locale)}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <p className="truncate text-xs font-bold text-ink-950">{tr(r.caption)}</p>
                      <Link
                        href={`/providers/${r.providerId}`}
                        className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-500 hover:text-brand-700"
                      >
                        <Avatar name={tr(r.provider)} accent={r.accent} size={16} />
                        <span className="truncate font-semibold">{tr(r.provider)}</span>
                      </Link>
                      <div className="mt-3 flex gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                          onClick={() => toggleHide(r.id, tr(r.caption))}
                        >
                          {isHidden ? t("ad.ct.show") : t("ad.ct.hide")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-red-600 hover:bg-red-50"
                          icon={<Trash2 size={12} />}
                          onClick={() => setRemoving({ id: r.id, label: tr(r.caption) })}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ---------------- reviews ---------------- */}
      {tab === "reviews" && (
        <>
          {reviewRows.length === 0 ? (
            <EmptyState icon={<MessageSquareQuote size={28} />} title={t("ad.ct.deleted")} />
          ) : (
            <ul className="space-y-3">
              {reviewRows.map((r) => {
                const p = PROVIDERS.find((x) => x.id === r.providerId);
                const isHidden = hiddenIds.includes(r.id);
                return (
                  <li key={r.id} className={cn("card p-4", isHidden && "opacity-60")}>
                    <div className="flex flex-wrap items-start gap-3">
                      <Avatar name={r.authorName} accent={p?.accent ?? "#0ba68b"} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-extrabold text-ink-950">{r.authorName}</p>
                          <Stars value={r.rating} size={11} />
                          <span className="tnum text-[10px] font-bold text-ink-500">
                            {localDigits(r.rating.toFixed(1), locale)}
                          </span>
                          {p && (
                            <Link href={`/providers/${p.id}`} className="text-[11px] font-semibold text-brand-700 hover:underline">
                              {tr(p.name)}
                            </Link>
                          )}
                          {isHidden && <Badge tone="danger" size="sm" icon={<EyeOff size={10} />}>{t("ad.ct.hidden")}</Badge>}
                          {r.rating <= 2 && (
                            <Badge tone="warn" size="sm" icon={<Star size={10} />}>
                              {locale === "fa" ? "امتیاز پایین" : "Low rating"}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-ink-700">{tr(r.body)}</p>
                        <p className="tnum mt-2 flex flex-wrap items-center gap-x-3 text-[10px] text-ink-400">
                          <span>{formatDate(r.at, locale)}</span>
                          <span>{formatRelative(r.at, locale)}</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={10} />
                            {localDigits(r.helpful, locale)}
                          </span>
                          {r.reply && <span className="text-brand-700">{locale === "fa" ? "پاسخ داده شده" : "Replied"}</span>}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                          onClick={() => toggleHide(r.id, r.authorName)}
                        >
                          {isHidden ? t("ad.ct.show") : t("ad.ct.hide")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-red-600 hover:bg-red-50"
                          icon={<Trash2 size={12} />}
                          onClick={() => setRemoving({ id: r.id, label: r.authorName })}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {/* ---------------- pages ---------------- */}
      {tab === "pages" && (
        <div className="card overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold text-ink-500">
                  <th className="px-4 py-3 text-start">{t("ad.ct.pageTitle")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.ct.pageSlug")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.ct.lastEdit")}</th>
                  <th className="px-4 py-3 text-start">{t("common.status")}</th>
                  <th className="px-4 py-3 text-start">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {ADMIN_PAGES.map((pg) => (
                  <tr key={pg.id} className="transition-colors hover:bg-brand-50/30">
                    <td className="px-4 py-3 text-xs font-bold text-ink-950">{tr(pg.title)}</td>
                    <td className="tnum px-4 py-3 text-[11px] text-ink-500" dir="ltr">
                      {pg.slug}
                    </td>
                    <td className="px-4 py-3">
                      <p className="tnum text-[11px] font-semibold text-ink-800">{formatDate(pg.updated, locale)}</p>
                      <p className="text-[10px] text-ink-400">{formatRelative(pg.updated, locale)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="success" size="sm" icon={<Check size={10} />}>{t("ad.ct.visible")}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={<Pencil size={12} />}
                          onClick={() => toast(`${t("common.edit")}: ${tr(pg.title)}`, "info")}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={<EyeOff size={12} />}
                          onClick={() => toggleHide(pg.id, tr(pg.title))}
                        >
                          {t("ad.ct.hide")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={t("ad.rp.removeContent")}
        body={removing?.label}
        confirmLabel={t("common.delete")}
        onConfirm={() => {
          if (removing) setDeletedIds((prev) => [...prev, removing.id]);
          toast(t("ad.ct.deleted"), "warn");
        }}
      />
    </div>
  );
}

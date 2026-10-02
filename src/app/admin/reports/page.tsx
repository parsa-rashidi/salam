"use client";

import { useState } from "react";
import {
  Ban,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  Images,
  MessageSquareQuote,
  ShieldCheck,
  Store,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { ADMIN_REPORTS } from "@/lib/mock-data";
import type { ReportItem } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/layout";
import { Tabs } from "@/components/ui/tabs";
import { formatDate, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

type Tab = "open" | "reviewing" | "resolved";

const TYPE_ICON: Record<ReportItem["type"], React.ComponentType<{ size?: number }>> = {
  review: MessageSquareQuote,
  portfolio: Images,
  provider: Store,
  booking: Clock3,
  user: UserRound,
};

const TYPE_LABEL: Record<ReportItem["type"], TranslationKey> = {
  review: "review.title",
  portfolio: "profile.tabPortfolio",
  provider: "ad.providers",
  booking: "ad.bookings",
  user: "ad.users.title",
};

export default function AdminReportsPage() {
  const { t, tr, locale } = useI18n();
  const { toast } = useStore();
  const [tab, setTab] = useState<Tab>("open");
  const [items, setItems] = useState<ReportItem[]>(ADMIN_REPORTS);
  const [detail, setDetail] = useState<ReportItem | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  const groups: Record<Tab, ReportItem[]> = {
    open: items.filter((r) => r.status === "open"),
    reviewing: items.filter((r) => r.status === "reviewing"),
    resolved: items.filter((r) => r.status === "resolved"),
  };
  const list = groups[tab];

  const setStatus = (id: string, status: ReportItem["status"]) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700">
          <Flag size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.rp.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.rp.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="danger" size="md">{localDigits(groups.open.length, locale)} {t("ad.rp.open")}</Badge>
          <Badge tone="warn" size="md">{localDigits(groups.reviewing.length, locale)} {t("ad.rp.reviewing")}</Badge>
          <Badge tone="success" size="md">{localDigits(groups.resolved.length, locale)} {t("ad.rp.resolved")}</Badge>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-ink-200 bg-ink-50 p-4 text-[11px] leading-relaxed text-ink-600">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-600" />
        <span>
          {locale === "fa"
            ? "گزارش‌ها در صف بررسی نگه داشته می‌شوند تا محتوای نامناسب، تصاویر بدون رضایت و رفتارهای نامناسب بررسی و در صورت لزوم حذف شوند."
            : "Reports stay in the moderation queue so inappropriate content, non-consensual images and abusive behaviour can be reviewed and removed when needed."}
        </span>
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: "open", label: t("ad.rp.open"), count: localDigits(groups.open.length, locale), icon: <TriangleAlert size={14} /> },
          { id: "reviewing", label: t("ad.rp.reviewing"), count: localDigits(groups.reviewing.length, locale), icon: <Eye size={14} /> },
          { id: "resolved", label: t("ad.rp.resolved"), count: localDigits(groups.resolved.length, locale), icon: <Check size={14} /> },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={28} />} title={t("ad.rp.empty")} />
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const Icon = TYPE_ICON[r.type];
            const isHidden = hidden.includes(r.id);
            return (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 text-sm font-extrabold text-ink-950">{tr(r.subject)}</h2>
                      <Badge tone="neutral" size="sm">{t(TYPE_LABEL[r.type])}</Badge>
                      {r.status === "open" && <Badge tone="danger" size="sm">{t("ad.rp.open")}</Badge>}
                      {r.status === "reviewing" && <Badge tone="warn" size="sm">{t("ad.rp.reviewing")}</Badge>}
                      {r.status === "resolved" && <Badge tone="success" size="sm">{t("ad.rp.resolved")}</Badge>}
                      {isHidden && <Badge tone="neutral" size="sm" icon={<EyeOff size={10} />}>{t("ad.ct.hidden")}</Badge>}
                    </div>
                    <div className="mt-2 flex items-start gap-2 rounded-xl border-s-2 border-red-300 bg-red-50 p-2.5">
                      <Flag size={13} className="mt-0.5 shrink-0 text-red-600" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-red-700">{t("ad.rp.reason")}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-700">{tr(r.reason)}</p>
                      </div>
                    </div>
                    <p className="tnum mt-2 flex flex-wrap items-center gap-x-3 text-[10px] text-ink-400">
                      <span>{t("ad.bl.at")}: {formatDate(r.at, locale)}</span>
                      <span>{formatRelative(r.at, locale)}</span>
                      <span>{locale === "fa" ? "گزارش‌دهنده" : "Reporter"}: {r.reporter}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <Button variant="ghost" size="xs" icon={<Eye size={12} />} onClick={() => setDetail(r)}>
                    {t("common.details")}
                  </Button>
                  {r.status === "open" && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setStatus(r.id, "reviewing");
                        toast(t("ad.rp.reviewing"), "info");
                      }}
                    >
                      {t("ad.rp.reviewing")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="xs"
                    icon={isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                    onClick={() => {
                      setHidden((prev) => (isHidden ? prev.filter((x) => x !== r.id) : [...prev, r.id]));
                      toast(isHidden ? t("ad.ct.show") : t("ad.ct.hide"), isHidden ? "success" : "warn");
                    }}
                  >
                    {isHidden ? t("ad.ct.show") : t("ad.ct.hide")}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-red-600 hover:bg-red-50"
                    icon={<Ban size={12} />}
                    onClick={() => toast(t("ad.rp.warnUser"), "warn")}
                  >
                    {t("ad.rp.warnUser")}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    size="xs"
                    icon={<Check size={12} />}
                    onClick={() => {
                      setStatus(r.id, "resolved");
                      toast(t("ad.rp.resolved"), "success");
                    }}
                  >
                    {t("ad.rp.resolve")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? tr(detail.subject) : undefined}
        description={detail ? `${t(TYPE_LABEL[detail.type])} · ${formatDate(detail.at, locale)}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDetail(null)}>
              {t("common.close")}
            </Button>
            {detail && detail.status !== "resolved" && (
              <Button
                size="sm"
                icon={<Check size={14} />}
                onClick={() => {
                  setStatus(detail.id, "resolved");
                  toast(t("ad.rp.resolved"), "success");
                  setDetail(null);
                }}
              >
                {t("ad.rp.resolve")}
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
              <p className="text-[11px] font-bold text-ink-500">{t("ad.rp.reason")}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-800">{tr(detail.reason)}</p>
            </div>

            {detail.type === "portfolio" && (
              <div className={cn("relative overflow-hidden rounded-2xl border border-ink-200", hidden.includes(detail.id) && "opacity-40 blur-[2px]")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/portfolio/color.jpg" alt="" className="h-48 w-full object-cover" />
                {hidden.includes(detail.id) && (
                  <span className="absolute inset-0 grid place-items-center bg-ink-950/60 text-xs font-bold text-white">
                    {t("ad.ct.hidden")}
                  </span>
                )}
              </div>
            )}

            {detail.type === "review" && (
              <div className="rounded-2xl border border-ink-200 p-4">
                <p className="text-xs italic leading-relaxed text-ink-700">
                  «{locale === "fa"
                    ? "اصلاً راضی نبودم، هیچ‌وقت سر ساعت نیامد و کارش بی‌کیفیت بود.»"
                    : "Not satisfied at all — never showed up on time and the work was poor quality.»"}
                </p>
                <p className="tnum mt-2 text-[10px] text-ink-400">
                  {locale === "fa" ? "ناشناس ۹۹۲" : "Unknown 992"} · {formatDate(detail.at, locale)}
                </p>
              </div>
            )}

            <div className="rounded-xl bg-ink-50 p-3.5 text-[11px] leading-relaxed text-ink-600">
              {locale === "fa"
                ? "اقدامات ممکن: هشدار به کاربر، پنهان‌سازی محتوا، حذف محتوا یا رد گزارش."
                : "Possible actions: warn the user, hide the content, remove it, or dismiss the report."}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

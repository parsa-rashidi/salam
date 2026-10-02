"use client";

import Link from "next/link";
import { useState } from "react";
import { Ban, Check, Clock3, Flag, ShieldAlert, TriangleAlert, Users } from "lucide-react";
import { ADMIN_USERS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout";
import { formatDate, formatRelative, localDigits } from "@/lib/format";

const REASONS: Record<string, { fa: string; en: string }> = {
  u4: {
    fa: "سه مورد عدم مراجعه بدون اطلاع و لغو دیرهنگام",
    en: "Three no-shows without notice and late cancellations",
  },
  u8: {
    fa: "ارسال ۱۴ درخواست تکراری در یک ساعت (اسپم)",
    en: "14 duplicate requests within one hour (spam)",
  },
};

export default function AdminBlockedPage() {
  const { t, tr, locale } = useI18n();
  const { blockedUsers, toggleBlockUser, toast } = useStore();
  const [busy, setBusy] = useState<string | null>(null);

  const rows = ADMIN_USERS.filter((u) => blockedUsers.includes(u.id));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700">
          <Ban size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.bl.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.bl.subtitle")}</p>
        </div>
        <Badge tone="danger" size="md">
          {localDigits(rows.length, locale)} {t("ad.users.blocked")}
        </Badge>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-900">
        <TriangleAlert size={14} className="mt-0.5 shrink-0" />
        <span>
          {locale === "fa"
            ? "کاربر مسدودشده نمی‌تواند درخواست نوبت ثبت کند یا تخفیف فوری ببیند؛ نوبت‌های تأییدشدهٔ قبلی لغو نمی‌شوند."
            : "A blocked user cannot request bookings or see flash deals; their already-confirmed appointments are not cancelled."}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<ShieldAlert size={28} />} title={t("ad.bl.empty")} />
      ) : (
        <ul className="space-y-3">
          {rows.map((u) => {
            const reason = REASONS[u.id] ?? {
              fa: "نقض قوانین استفاده از سامانه",
              en: "Violation of the platform's terms of use",
            };
            return (
              <li key={u.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <Avatar name={tr(u.name)} accent={u.accent} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-extrabold text-ink-950">{tr(u.name)}</h2>
                      <Badge tone="danger" size="sm" icon={<Ban size={10} />}>
                        {t("ad.users.blocked")}
                      </Badge>
                    </div>
                    <p className="tnum mt-1 text-[11px] text-ink-500" dir="ltr">
                      {u.phone}
                    </p>
                    <div className="mt-2.5 flex items-start gap-2 rounded-xl border-s-2 border-red-300 bg-red-50 p-2.5">
                      <Flag size={13} className="mt-0.5 shrink-0 text-red-600" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-red-700">{t("ad.bl.reason")}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-700">{tr(reason)}</p>
                      </div>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[10px] text-ink-400">
                      <span className="tnum flex items-center gap-1">
                        <Clock3 size={10} />
                        {t("ad.bl.at")}: {formatDate(u.joined, locale)}
                      </span>
                      <span>{formatRelative(u.joined, locale)}</span>
                      <span className="tnum flex items-center gap-1">
                        <Users size={10} />
                        {localDigits(u.bookings, locale)} {t("ad.users.bookings")}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === u.id}
                      icon={<Check size={14} />}
                      onClick={() => {
                        setBusy(u.id);
                        toggleBlockUser(u.id);
                        toast(t("ad.bl.unblock"), "success");
                        setBusy(null);
                      }}
                    >
                      {t("ad.bl.unblock")}
                    </Button>
                    <Link
                      href="/admin/reports"
                      className="flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold text-ink-600 hover:bg-ink-100"
                    >
                      {t("ad.reports")}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

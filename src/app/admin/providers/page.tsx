"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  Clock3,
  FileCheck2,
  FileX2,
  IdCard,
  Phone,
  Search,
  ShieldCheck,
  Store,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/layout";
import { Tabs } from "@/components/ui/tabs";
import { formatDate, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PendingProvider } from "@/types";

type Tab = "pending" | "approved" | "rejected";

export default function AdminProvidersPage() {
  const { t, tr, locale } = useI18n();
  const { pending, resolvePending, toast } = useStore();
  const [tab, setTab] = useState<Tab>("pending");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<PendingProvider | null>(null);
  const [rejecting, setRejecting] = useState<PendingProvider | null>(null);
  const [reason, setReason] = useState("docs");
  const [note, setNote] = useState("");

  const groups: Record<Tab, PendingProvider[]> = {
    pending: pending.filter((p) => p.status === "pending"),
    approved: pending.filter((p) => p.status === "approved"),
    rejected: pending.filter((p) => p.status === "rejected"),
  };

  const list = groups[tab].filter((p) =>
    tr(p.name).toLowerCase().includes(q.trim().toLowerCase()),
  );

  const readyCount = groups.pending.filter((p) => p.docsSubmitted && p.nationalIdVerified).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
          <BadgeCheck size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.pend.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.pend.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="deal" size="md" icon={<Clock3 size={12} />}>
            {localDigits(groups.pending.length, locale)} {t("ad.pend.title")}
          </Badge>
          <Badge tone="success" size="md" icon={<ShieldCheck size={12} />}>
            {localDigits(readyCount, locale)} {locale === "fa" ? "آمادهٔ تأیید" : "Ready to approve"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("ad.users.search")}
            className="h-10 ps-9"
          />
        </div>
        <div className="flex-1">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            variant="pill"
            items={[
              { id: "pending", label: t("ad.pending"), count: localDigits(groups.pending.length, locale) },
              { id: "approved", label: t("ad.pend.approved"), count: localDigits(groups.approved.length, locale) },
              { id: "rejected", label: t("ad.pend.rejected"), count: localDigits(groups.rejected.length, locale) },
            ]}
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<BadgeCheck size={28} />} title={t("ad.pend.empty")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((p) => {
            const ready = p.docsSubmitted && p.nationalIdVerified && p.phoneVerified;
            return (
              <article key={p.id} className="card overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <Avatar name={tr(p.name)} accent={p.accent} size={46} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="truncate text-sm font-extrabold text-ink-950">{tr(p.name)}</h2>
                      <Badge tone="neutral" size="sm" icon={p.kind === "salon" ? <Store size={10} /> : <UserRound size={10} />}>
                        {p.kind === "salon" ? t("pp.set.kindSalon") : t("pp.set.kindIndependent")}
                      </Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-500">
                      <span className="flex items-center gap-1">
                        <Building2 size={11} />
                        {tr(p.city)}
                      </span>
                      <span>·</span>
                      <span className="tnum">
                        {localDigits(p.servicesCount, locale)} {t("profile.servicesUnit")}
                      </span>
                      <span>·</span>
                      <span className="tnum">{t("ad.pend.submitted")}: {formatDate(p.submittedAt, locale)}</span>
                    </p>
                  </div>
                  {p.status === "approved" && <Badge tone="success" size="md" icon={<Check size={12} />}>{t("ad.pend.approved")}</Badge>}
                  {p.status === "rejected" && <Badge tone="danger" size="md" icon={<X size={12} />}>{t("ad.pend.rejected")}</Badge>}
                  {p.status === "pending" && !ready && (
                    <Badge tone="warn" size="md" icon={<TriangleAlert size={12} />}>{t("ad.pend.needMore")}</Badge>
                  )}
                </div>

                <div className="grid gap-px border-y border-ink-200 bg-ink-200 sm:grid-cols-3">
                  <CheckCell
                    ok={p.docsSubmitted}
                    icon={p.docsSubmitted ? <FileCheck2 size={14} /> : <FileX2 size={14} />}
                    label={t("ad.pend.docs")}
                  />
                  <CheckCell ok={p.nationalIdVerified} icon={<IdCard size={14} />} label={t("ad.pend.nationalId")} />
                  <CheckCell ok={p.phoneVerified} icon={<Phone size={14} />} label={t("ad.pend.phone")} />
                </div>

                <div className="flex flex-wrap items-center gap-2 p-3.5">
                  <span className="tnum text-[11px] text-ink-400">{formatRelative(p.submittedAt, locale)}</span>
                  <div className="flex-1" />
                  <Button variant="ghost" size="xs" onClick={() => setDetail(p)}>
                    {t("ad.pend.viewProfile")}
                  </Button>
                  {p.status === "pending" && (
                    <>
                      <Button
                        size="xs"
                        icon={<Check size={13} />}
                        onClick={() => {
                          resolvePending(p.id, "approved");
                          toast(t("ad.pend.approved"), "success");
                        }}
                      >
                        {t("ad.pend.approve")}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        icon={<X size={13} />}
                        onClick={() => setRejecting(p)}
                      >
                        {t("ad.pend.reject")}
                      </Button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? tr(detail.name) : undefined}
        description={t("ad.pend.subtitle")}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDetail(null)}>
              {t("common.close")}
            </Button>
            {detail?.status === "pending" && (
              <Button
                size="sm"
                icon={<Check size={14} />}
                onClick={() => {
                  resolvePending(detail.id, "approved");
                  toast(t("ad.pend.approved"), "success");
                  setDetail(null);
                }}
              >
                {t("ad.pend.approve")}
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-4">
              <Avatar name={tr(detail.name)} accent={detail.accent} size={52} ring />
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-ink-950">{tr(detail.name)}</p>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  {detail.kind === "salon" ? t("pp.set.kindSalon") : t("pp.set.kindIndependent")} · {tr(detail.city)}
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs">
              <Row label={t("ad.pend.docs")} value={detail.docsSubmitted ? t("common.yes") : t("common.no")} ok={detail.docsSubmitted} />
              <Row label={t("ad.pend.nationalId")} value={detail.nationalIdVerified ? t("common.yes") : t("common.no")} ok={detail.nationalIdVerified} />
              <Row label={t("ad.pend.phone")} value={detail.phoneVerified ? t("common.yes") : t("common.no")} ok={detail.phoneVerified} />
              <Row label={t("profile.servicesUnit")} value={localDigits(detail.servicesCount, locale)} />
              <Row label={t("ad.pend.submitted")} value={formatDate(detail.submittedAt, locale)} />
            </ul>

            <div className="rounded-2xl border border-ink-200 p-4">
              <p className="text-[11px] font-bold text-ink-500">{locale === "fa" ? "مدارک بارگذاری‌شده" : "Uploaded documents"}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { fa: "تصویر کارت ملی", en: "National ID card scan" },
                  { fa: "پروانهٔ کسب / جواز صنفی", en: "Business licence" },
                  { fa: "عکس محیط کار", en: "Workplace photo" },
                  { fa: "گواهی دورهٔ فنی‌وحرفه‌ای", en: "Vocational certificate" },
                ].map((d, i) => (
                  <div
                    key={d.en}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold",
                      detail.docsSubmitted || i < 2
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-amber-200 bg-amber-50 text-amber-900",
                    )}
                  >
                    {detail.docsSubmitted || i < 2 ? <FileCheck2 size={13} /> : <FileX2 size={13} />}
                    <span className="min-w-0 truncate">{tr(d)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-600">
              <TriangleAlert size={13} className="mt-0.5 shrink-0 text-amber-600" />
              {locale === "fa"
                ? "پس از تأیید، پروفایل در جست‌وجو و نقشه نمایش داده می‌شود و آرایشگر به پنل خود دسترسی پیدا می‌کند."
                : "Once approved the profile appears in search and on the map, and the stylist gets access to their panel."}
            </div>
          </div>
        )}
      </Modal>

      {/* reject modal */}
      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={t("ad.pend.reject")}
        description={rejecting ? tr(rejecting.name) : undefined}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejecting(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<X size={14} />}
              onClick={() => {
                if (rejecting) resolvePending(rejecting.id, "rejected");
                toast(t("ad.pend.rejected"), "warn");
                setRejecting(null);
              }}
            >
              {t("ad.pend.reject")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={t("ad.pend.rejectReason")}>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="docs">{t("ad.pend.needMore")}</option>
              <option value="identity">{t("ad.pend.nationalId")}</option>
              <option value="duplicate">{locale === "fa" ? "پروفایل تکراری" : "Duplicate profile"}</option>
              <option value="other">{t("pp.req.rejectOther")}</option>
            </Select>
          </Field>
          <Field label={t("misc.notes")} hint={locale === "fa" ? "برای متقاضی ارسال می‌شود." : "Sent to the applicant."}>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Link
        href="/admin/users"
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-ink-200 bg-white py-3 text-xs font-bold text-brand-700 hover:bg-brand-50"
      >
        {t("ad.users.title")}
        <BadgeCheck size={13} />
      </Link>
    </div>
  );
}

function CheckCell({ ok, icon, label }: { ok: boolean; icon: React.ReactNode; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 bg-white px-3.5 py-2.5", ok ? "" : "bg-amber-50/40")}>
      <span className={cn("shrink-0", ok ? "text-emerald-600" : "text-amber-600")}>{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-ink-700">{label}</span>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 px-3 py-2.5">
      <span className="text-ink-500">{label}</span>
      <span
        className={cn(
          "tnum font-extrabold",
          ok === undefined ? "text-ink-950" : ok ? "text-emerald-700" : "text-amber-700",
        )}
      >
        {value}
      </span>
    </li>
  );
}

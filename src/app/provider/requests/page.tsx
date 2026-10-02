"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  BadgeCheck,
  CalendarCheck2,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Home,
  Inbox,
  Lock,
  MapPin,
  MessageSquareText,
  Phone,
  Repeat,
  Store,
  UserRoundPlus,
  UserX,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type { ProviderRequest } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Select, Textarea, Toggle } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/layout";
import {
  formatClock,
  formatDate,
  formatDateShort,
  formatMoney,
  formatRelative,
  localDigits,
} from "@/lib/format";

type Tab = "new" | "upcoming" | "past";

export default function ProviderRequestsPage() {
  const { t, tr, locale } = useI18n();
  const { requests, setRequestStatus, toast, customers } = useStore();
  const [tab, setTab] = useState<Tab>("new");
  const [rejectTarget, setRejectTarget] = useState<ProviderRequest | null>(null);
  const [counterTarget, setCounterTarget] = useState<ProviderRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("busy");
  const [rejectNote, setRejectNote] = useState("");
  const [proposed, setProposed] = useState("18:30");
  const [revealed, setRevealed] = useState<string[]>([]);

  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);

  const groups: Record<Tab, ProviderRequest[]> = {
    new: requests.filter((r) => r.status === "requested" || r.status === "countered"),
    upcoming: requests.filter((r) => r.status === "confirmed"),
    past: requests.filter((r) => r.status === "rejected"),
  };

  const list = groups[tab];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-50 text-deal-700">
            <Inbox size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold text-ink-950">{t("pp.req.title")}</h1>
            <p className="text-xs text-ink-500">{t("pp.req.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="deal" size="md">
              {localDigits(groups.new.length, locale)} {t("pp.req.tabNew")}
            </Badge>
            <Badge tone="success" size="md">
              {localDigits(groups.upcoming.length, locale)} {t("pp.req.tabUpcoming")}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: "new", label: t("pp.req.tabNew"), count: localDigits(groups.new.length, locale), icon: <Zap size={14} /> },
          { id: "upcoming", label: t("pp.req.tabUpcoming"), count: localDigits(groups.upcoming.length, locale), icon: <CalendarCheck2 size={14} /> },
          { id: "past", label: t("pp.req.tabPast"), count: localDigits(groups.past.length, locale), icon: <Repeat size={14} /> },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={28} />} title={t("pp.req.empty")} />
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const history = customers.find((c) => c.name.fa === r.customer.fa);
            const isRevealed = revealed.includes(r.id);
            return (
              <article key={r.id} className="card overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
                  <Avatar name={tr(r.customer)} accent={r.avatarAccent} size={50} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[15px] font-extrabold text-ink-950">{tr(r.customer)}</h2>
                      {r.status === "confirmed" && (
                        <Badge tone="success" size="sm" icon={<BadgeCheck size={11} />}>
                          {t("status.confirmed")}
                        </Badge>
                      )}
                      {r.status === "countered" && (
                        <Badge tone="warn" size="sm" icon={<Clock size={11} />}>
                          {t("status.counter")}
                        </Badge>
                      )}
                      {r.status === "rejected" && (
                        <Badge tone="danger" size="sm" icon={<UserX size={11} />}>
                          {t("status.rejected")}
                        </Badge>
                      )}
                      {r.senior && (
                        <Badge tone="violet" size="sm" icon={<Accessibility size={11} />}>
                          {t("pp.req.seniorBadge")}
                        </Badge>
                      )}
                      {r.beneficiaryIsOther && (
                        <Badge tone="info" size="sm" icon={<UserRoundPlus size={11} />}>
                          {t("pp.req.forOther", { name: tr(r.customer) })}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm font-semibold text-ink-800">{tr(r.service)}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-500">
                      <span className="tnum flex items-center gap-1 font-bold text-ink-800">
                        <Clock size={11} />
                        {formatDate(r.dateISO, locale)} · {formatClock(hhmm(r.dateISO), locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        {r.mode === "home" ? <Home size={11} /> : <Store size={11} />}
                        {r.mode === "home" ? t("misc.home") : t("misc.salon")}
                      </span>
                      <span className="tnum flex items-center gap-1">
                        <MapPin size={11} />
                        {t("pp.req.distance")}: {localDigits(r.distanceKm.toFixed(1), locale)} {t("common.km")}
                      </span>
                      <span className="text-ink-400">{formatRelative(r.dateISO, locale)}</span>
                    </div>

                    {/* address */}
                    <div className="mt-3 rounded-xl border border-ink-200 bg-ink-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-500">
                            {isRevealed ? <Eye size={11} /> : <Lock size={11} />}
                            {r.mode === "home" ? t("booking.addressTitle") : t("profile.address")}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-ink-900">
                            {r.mode === "salon"
                              ? tr({ fa: "سالن خودتان — ولنجک، خیابان بیست‌وسوم، پلاک ۱۴", en: "Your salon — Velenjak, 23rd St., No. 14" })
                              : isRevealed
                                ? tr({
                                    fa: "پاسداران، گلستان هفتم، کوچهٔ نرگس، پلاک ۳، طبقهٔ همکف — زنگ واحد ۲",
                                    en: "Pasdaran, 7th Golestan, Narges Alley, No. 3, Ground floor — ring unit 2",
                                  })
                                : tr({ fa: "پاسداران — محدودهٔ کلی", en: "Pasdaran — general area" })}
                          </p>
                        </div>
                        {r.mode === "home" && !isRevealed && (
                          <Button
                            variant="outline"
                            size="xs"
                            icon={<Eye size={12} />}
                            onClick={() => {
                              setRevealed((prev) => [...prev, r.id]);
                              toast(
                                locale === "fa"
                                  ? "نشانی کامل نمایش داده شد."
                                  : "Full address revealed.",
                                "info",
                              );
                            }}
                          >
                            {t("pp.req.showAddress")}
                          </Button>
                        )}
                      </div>
                      {!isRevealed && r.mode === "home" && (
                        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-400">
                          <Lock size={10} />
                          {t("pp.req.addressHiddenHint")}
                        </p>
                      )}
                    </div>

                    {/* notes */}
                    {r.notes && (
                      <div className="mt-3 flex items-start gap-2.5 rounded-xl border-s-2 border-violet-300 bg-violet-50 p-3">
                        <Accessibility size={15} className="mt-0.5 shrink-0 text-violet-600" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-violet-800">{t("pp.req.notes")}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-700">{tr(r.notes)}</p>
                        </div>
                      </div>
                    )}

                    {/* customer history */}
                    {history && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="rounded-lg bg-ink-100 px-2 py-1 font-bold text-ink-700">
                          {t("pp.cu.visits")}: {localDigits(history.visits, locale)}
                        </span>
                        <span className="tnum rounded-lg bg-ink-100 px-2 py-1 font-bold text-ink-700">
                          {t("pp.cu.totalSpent")}: {formatMoneyShort(history.totalSpent, locale)}
                        </span>
                        {history.noShows > 0 && (
                          <span className="rounded-lg bg-red-50 px-2 py-1 font-bold text-red-700">
                            {t("pp.cu.noShows")}: {localDigits(history.noShows, locale)}
                          </span>
                        )}
                        {history.cancellations > 0 && (
                          <span className="rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-700">
                            {t("pp.cu.cancellations")}: {localDigits(history.cancellations, locale)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* earnings */}
                  <div className="shrink-0 rounded-2xl border border-brand-200 bg-brand-50/70 p-3.5 text-center sm:w-40">
                    <p className="text-[10px] font-bold text-brand-700">{t("pp.req.earnings")}</p>
                    <p className="tnum mt-1 text-lg font-black text-brand-900">
                      {formatMoneyShort(r.price + r.travelFee, locale)}
                    </p>
                    <p className="tnum text-[10px] text-brand-700">{t("common.toman")}</p>
                    {r.travelFee > 0 && (
                      <p className="tnum mt-2 border-t border-brand-200 pt-2 text-[10px] font-semibold text-brand-800">
                        {t("profile.travelFee")}: {formatMoneyShort(r.travelFee, locale)}
                      </p>
                    )}
                  </div>
                </div>

                {/* actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 bg-ink-50/70 px-4 py-3 sm:px-5">
                  {r.status === "requested" && (
                    <>
                      <Button
                        size="sm"
                        icon={<Check size={14} />}
                        onClick={() => {
                          setRequestStatus(r.id, "confirmed");
                          toast(t("pp.req.accepted"), "success");
                        }}
                      >
                        {t("pp.req.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Clock size={14} />}
                        onClick={() => {
                          setCounterTarget(r);
                          setProposed(hhmm(r.dateISO));
                        }}
                      >
                        {t("pp.req.counter")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        icon={<X size={14} />}
                        onClick={() => setRejectTarget(r)}
                      >
                        {t("pp.req.reject")}
                      </Button>
                    </>
                  )}
                  {r.status === "countered" && (
                    <>
                      <Badge tone="warn" size="md" icon={<Clock size={12} />}>
                        {t("pp.req.proposeTime")}: {formatClock(r.proposedTime ?? "—", locale)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Check size={14} />}
                        onClick={() => {
                          setRequestStatus(r.id, "confirmed");
                          toast(t("pp.req.accepted"), "success");
                        }}
                      >
                        {t("common.confirm")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        icon={<X size={14} />}
                        onClick={() => setRejectTarget(r)}
                      >
                        {t("pp.req.reject")}
                      </Button>
                    </>
                  )}
                  {r.status === "confirmed" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<CheckCircle2 size={14} />}
                        onClick={() => {
                          setRequestStatus(r.id, "confirmed");
                          toast(t("pp.req.markDone"), "success");
                        }}
                      >
                        {t("pp.req.markDone")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<UserX size={14} />}
                        onClick={() => toast(t("status.no_show"), "warn")}
                      >
                        {t("pp.req.markNoShow")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Phone size={14} />}
                        onClick={() => toast(t("profile.callMaskedHint"), "info")}
                      >
                        {t("bookings.contactProvider")}
                      </Button>
                    </>
                  )}
                  {r.status === "rejected" && (
                    <>
                      <Badge tone="danger" size="md" icon={<EyeOff size={12} />}>
                        {t("status.rejected")}
                      </Badge>
                      <span className="text-[11px] text-ink-500">
                        {formatRelative(r.dateISO, locale)}
                      </span>
                    </>
                  )}

                  <div className="flex-1" />
                  <Button variant="ghost" size="sm" icon={<MessageSquareText size={14} />}>
                    {locale === "fa" ? "پیام به مشتری" : "Message customer"}
                  </Button>
                  <Link
                    href="/provider/customers"
                    className="flex h-9 items-center rounded-lg px-3 text-xs font-bold text-brand-700 hover:bg-brand-50"
                  >
                    {t("pp.req.history")}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* reject modal */}
      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={t("pp.req.reject")}
        description={rejectTarget ? `${tr(rejectTarget.customer)} · ${formatDateShort(rejectTarget.dateISO, locale)}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<X size={14} />}
              onClick={() => {
                if (rejectTarget) setRequestStatus(rejectTarget.id, "rejected");
                toast(t("pp.req.rejected"), "warn");
                setRejectTarget(null);
              }}
            >
              {t("pp.req.reject")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={t("pp.req.rejectReason")}>
            <Select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}>
              <option value="busy">{t("pp.req.rejectBusy")}</option>
              <option value="far">{t("pp.req.rejectFar")}</option>
              <option value="other">{t("pp.req.rejectOther")}</option>
            </Select>
          </Field>
          <Field label={t("misc.notes")} hint={locale === "fa" ? "این متن برای مشتری ارسال می‌شود." : "This message is sent to the customer."}>
            <Textarea rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
          </Field>
          <div className="rounded-xl bg-ink-50 p-3">
            <Toggle
              checked
              onChange={() => undefined}
              label={<span className="text-xs font-bold">{t("pp.req.counter")}</span>}
              hint={locale === "fa" ? "به‌جای رد کردن، می‌توانید زمان جایگزین پیشنهاد دهید." : "Instead of declining you can propose another time."}
            />
          </div>
        </div>
      </Modal>

      {/* counter modal */}
      <Modal
        open={!!counterTarget}
        onClose={() => setCounterTarget(null)}
        title={t("pp.req.counter")}
        description={counterTarget ? `${tr(counterTarget.customer)} · ${tr(counterTarget.service)}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCounterTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              icon={<Clock size={14} />}
              onClick={() => {
                if (counterTarget) setRequestStatus(counterTarget.id, "countered", proposed);
                toast(t("pp.req.countered"), "info");
                setCounterTarget(null);
              }}
            >
              {t("pp.req.sendProposal")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-xs">
            <p className="font-bold text-ink-800">{t("booking.summaryDate")}</p>
            <p className="tnum mt-1 text-ink-600">
              {counterTarget
                ? `${formatDate(counterTarget.dateISO, locale)} · ${formatClock(hhmm(counterTarget.dateISO), locale)}`
                : "—"}
            </p>
          </div>
          <Field label={t("pp.req.proposeTime")}>
            <Select value={proposed} onChange={(e) => setProposed(e.target.value)}>
              {TIME_OPTIONS.map((tt) => (
                <option key={tt} value={tt}>
                  {formatClock(tt, locale)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("misc.date")}>
            <Select defaultValue="0">
              {[0, 1, 2].map((d) => (
                <option key={d} value={String(d)}>
                  {d === 0 ? t("common.today") : d === 1 ? t("common.tomorrow") : formatDateShort(new Date(Date.now() + d * 86400000).toISOString(), locale)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-[11px] leading-relaxed text-brand-900">
            <Wallet size={13} className="mt-0.5 shrink-0" />
            {locale === "fa"
              ? "قیمت نهایی و هزینهٔ رفت‌وآمد بدون تغییر برای مشتری ارسال می‌شود."
              : "The final price and travel fee are sent to the customer unchanged."}
          </div>
        </div>
      </Modal>
    </div>
  );
}

const TIME_OPTIONS = Array.from({ length: 26 }, (_, i) => {
  const total = 8 * 60 + i * 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});

function formatMoneyShort(n: number, locale: "fa" | "en") {
  return formatMoney(n, locale, false);
}

function hhmm(isoString: string) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

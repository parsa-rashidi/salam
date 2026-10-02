"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Home,
  Lock,
  MapPin,
  MessageSquareText,
  Phone,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  UserRoundPlus,
  Wallet,
  XCircle,
} from "lucide-react";
import type { BookingStatus } from "@/types";
import { PROVIDERS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { STATUS_TONE } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { WriteReviewForm } from "@/components/customer/review-list";
import { formatClock, formatDate, formatMoney, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const ProvidersMap = dynamic(() => import("@/components/map/providers-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-100">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
    </div>
  ),
});

const STATUS_ICON: Record<BookingStatus, React.ComponentType<{ size?: number }>> = {
  free: Clock,
  requested: MessageSquareText,
  pending: Clock,
  confirmed: CheckCircle2,
  rejected: XCircle,
  cancelled: XCircle,
  done: Check,
  no_show: XCircle,
};

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, locale, dir } = useI18n();
  const { bookings, cancelBooking, toast } = useStore();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const booking = bookings.find((b) => b.id === params?.id);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (!booking) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <EmptyState
          icon={<CalendarClock size={28} />}
          title={t("misc.notFoundTitle")}
          body={t("misc.notFoundBody")}
          action={<ButtonLink href="/bookings">{t("common.back")}</ButtonLink>}
        />
      </div>
    );
  }

  const provider = PROVIDERS.find((p) => p.id === booking.providerId)!;
  const service = provider.services.find((s) => s.id === booking.serviceId) ?? provider.services[0];
  const cancellable = ["requested", "pending", "confirmed"].includes(booking.status);
  const discount = booking.dealId ? Math.max(0, booking.price - (booking.price * 0.6)) : 0;
  const total = booking.price + booking.travelFee;

  return (
    <div className="pb-12">
      {/* ---------------- status hero ---------------- */}
      <div
        className={cn(
          "relative overflow-hidden text-white",
          booking.status === "cancelled" || booking.status === "rejected" || booking.status === "no_show"
            ? "bg-gradient-to-br from-ink-700 to-ink-950"
            : booking.status === "done"
              ? "bg-gradient-to-br from-violet-600 to-brand-800"
              : "bg-gradient-to-br from-brand-600 to-brand-900",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 70% at 85% 15%, #000, transparent)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/bookings")}
            className="flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <Back size={14} />
            {t("bookings.title")}
          </button>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                {t("bookings.bookingCode")}
              </p>
              <p className="tnum mt-1 text-2xl font-black tracking-wide sm:text-3xl">{booking.code}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-extrabold backdrop-blur">
                  {(() => {
                    const Icon = STATUS_ICON[booking.status];
                    return <Icon size={15} />;
                  })()}
                  {t(`status.${booking.status}` as TranslationKey)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/85 backdrop-blur">
                  <CalendarClock size={13} />
                  {formatDate(booking.dateISO, locale)} · {formatClock(hhmm(booking.dateISO), locale)}
                </span>
              </div>
            </div>
            <div className="text-end">
              <p className="text-[11px] font-bold text-white/60">{t("booking.costTotal")}</p>
              <p className="tnum mt-1 text-2xl font-black sm:text-3xl">{formatMoney(total, locale)}</p>
              <Button
                variant="outline"
                size="xs"
                className="mt-2 border-white/30 bg-transparent text-white hover:bg-white/10"
                icon={<Copy size={12} />}
                onClick={() => toast(locale === "fa" ? "کد پیگیری کپی شد." : "Tracking code copied.", "info")}
              >
                {locale === "fa" ? "کپی کد" : "Copy code"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="min-w-0 space-y-5">
          {/* provider */}
          <section className="card overflow-hidden">
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <Avatar name={tr(provider.name)} accent={provider.accent} size={52} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/providers/${provider.id}`}
                  className="flex items-center gap-1.5 truncate text-[15px] font-extrabold text-ink-950 hover:text-brand-700"
                >
                  {tr(provider.name)}
                  {provider.verified && (
                    <ShieldCheck size={14} className="shrink-0 text-brand-600" />
                  )}
                </Link>
                <p className="truncate text-xs text-ink-500">
                  {tr(provider.district)} · {booking.mode === "home" ? t("explore.modeHome") : t("explore.modeSalon")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Phone size={14} />}
                onClick={() => toast(t("profile.callMaskedHint"), "info")}
              >
                {t("profile.call")}
              </Button>
            </div>

            <div className="h-52 border-t border-ink-200">
              <ProvidersMap
                providers={[provider]}
                deals={[]}
                showDeals={false}
                userLocation={booking.mode === "home" ? { lat: provider.lat + 0.008, lng: provider.lng + 0.008 } : null}
                fitToMarkers
                zoom={14}
                staticMode={false}
              />
            </div>

            <div className="space-y-2 border-t border-ink-200 p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-ink-400">
                  {booking.mode === "home" ? <Home size={15} /> : <Store size={15} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink-500">
                    {booking.mode === "home" ? t("booking.addressTitle") : t("profile.address")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-900">
                    {booking.mode === "home"
                      ? booking.addressVisible
                        ? tr(booking.address!)
                        : t("bookings.addressHidden")
                      : tr(provider.address)}
                  </p>
                  {booking.mode === "home" && !booking.addressVisible && (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-500">
                      <Lock size={11} className="text-brand-600" />
                      {t("booking.privacyNote")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* timeline */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
              <Clock size={15} className="text-brand-600" />
              {t("bookings.timeline")}
            </h2>
            <ol className="mt-5 space-y-0">
              {booking.timeline.map((entry, i) => {
                const Icon = STATUS_ICON[entry.status];
                const last = i === booking.timeline.length - 1;
                return (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && (
                      <span
                        className="absolute top-9 bottom-0 w-px bg-ink-200"
                        style={{ insetInlineStart: "17px" }}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 bg-white",
                        last ? "border-brand-600 text-brand-700" : "border-ink-200 text-ink-400",
                        entry.status === "confirmed" && "border-emerald-500 text-emerald-600",
                        (entry.status === "cancelled" || entry.status === "rejected") && "border-red-400 text-red-500",
                        last && STATUS_TONE[entry.status] === "danger" && "border-red-500 text-red-600",
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-ink-950">
                          {t(`status.${entry.status}` as TranslationKey)}
                        </p>
                        <p className="text-[11px] font-semibold text-ink-400">
                          {formatRelative(entry.at, locale)}
                        </p>
                      </div>
                      {entry.note && (
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{tr(entry.note)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
              {cancellable && (
                <li className="relative flex gap-4">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-dashed border-ink-300 bg-white text-ink-300"
                    aria-hidden="true"
                  >
                    <Clock size={15} />
                  </span>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-ink-500">
                      {booking.status === "pending" ? t("status.pending") : t("booking.supportLine")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      {t("booking.pendingHint", { min: localDigits(provider.responseTimeMin, locale) })}
                    </p>
                  </div>
                </li>
              )}
            </ol>
          </section>

          {/* beneficiary */}
          {!booking.beneficiary.isSelf && (
            <section className="card border-violet-200 bg-violet-50/40 p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-violet-900">
                <UserRoundPlus size={15} className="text-violet-600" />
                {t("booking.forOther")}
              </h2>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <Fact label={t("booking.beneficiaryName")} value={tr(booking.beneficiary.name)} icon={<UserRoundPlus size={13} />} />
                <Fact label={t("booking.relation")} value={tr(booking.beneficiary.relation)} icon={<Sparkles size={13} />} />
              </dl>
              {booking.beneficiary.notes && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-violet-200 bg-white p-3.5">
                  <Accessibility size={15} className="mt-0.5 shrink-0 text-violet-600" />
                  <div>
                    <p className="text-[11px] font-bold text-violet-800">{t("misc.notes")}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-700">
                      {tr(booking.beneficiary.notes)}
                    </p>
                  </div>
                </div>
              )}
              {booking.companionShared && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-violet-800 ring-1 ring-violet-200">
                  <Share2 size={11} />
                  {t("bookings.companionShared")}
                </p>
              )}
            </section>
          )}

          {/* review */}
          {booking.status === "done" && (
            <section>
              <WriteReviewForm />
            </section>
          )}
        </div>

        {/* ---------------- sidebar ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <header className="flex items-center gap-2 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <Wallet size={15} className="text-ink-500" />
              <h2 className="text-sm font-extrabold text-ink-950">{t("booking.costBreakdown")}</h2>
            </header>
            <ul className="space-y-2.5 px-4 py-4 text-sm">
              <li className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-600">
                  <Scissors size={13} className="shrink-0 text-ink-400" />
                  {tr(service?.name ?? { fa: "—", en: "—" })}
                </span>
                <span className="tnum shrink-0 text-xs font-extrabold text-ink-900">
                  {formatMoney(booking.price - (booking.mode === "home" ? service?.homeSurcharge ?? 0 : 0), locale)}
                </span>
              </li>
              {booking.mode === "home" && service?.homeSurcharge ? (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-ink-600">
                    {locale === "fa" ? "هزینهٔ ارائه در محل" : "At-home surcharge"}
                  </span>
                  <span className="tnum text-xs font-extrabold text-ink-900">
                    {formatMoney(service.homeSurcharge, locale)}
                  </span>
                </li>
              ) : null}
              {booking.travelFee > 0 && (
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-600">
                    <MapPin size={13} className="shrink-0 text-ink-400" />
                    {t("booking.costTravel")}
                  </span>
                  <span className="tnum text-xs font-extrabold text-ink-900">
                    {formatMoney(booking.travelFee, locale)}
                  </span>
                </li>
              )}
              {discount > 0 && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-deal-700">{t("booking.costDiscount")}</span>
                  <span className="tnum text-xs font-extrabold text-deal-600">
                    − {formatMoney(discount, locale)}
                  </span>
                </li>
              )}
            </ul>
            <div className="flex items-center justify-between border-t border-ink-200 bg-brand-50/60 px-4 py-3.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-brand-900">
                <Banknote size={14} />
                {t("booking.costTotal")}
              </span>
              <span className="tnum text-lg font-black text-brand-800">{formatMoney(total, locale)}</span>
            </div>
            <p className="border-t border-ink-200 px-4 py-3 text-[11px] leading-relaxed text-ink-500">
              {t("booking.paymentHint")}
            </p>
          </div>

          <div className="card space-y-2 p-4">
            <ButtonLink href={`/book/${provider.id}`} fullWidth variant="secondary" icon={<Scissors size={15} />}>
              {t("bookings.rebook")}
            </ButtonLink>
            {cancellable && (
              <>
                <Button fullWidth variant="outline" icon={<XCircle size={15} />} onClick={() => setCancelOpen(true)}>
                  {t("bookings.cancelBooking")}
                </Button>
                <Button
                  fullWidth
                  variant="ghost"
                  size="sm"
                  icon={<CalendarClock size={14} />}
                  onClick={() => toast(locale === "fa" ? "درخواست تغییر زمان ارسال شد." : "Reschedule request sent.", "info")}
                >
                  {t("bookings.reschedule")}
                </Button>
              </>
            )}
            {booking.status === "done" && (
              <ButtonLink href={`/providers/${provider.id}`} fullWidth variant="deal" icon={<MessageSquareText size={15} />}>
                {t("bookings.rateService")}
              </ButtonLink>
            )}
          </div>

          <div className="card p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold text-ink-950">
              <Phone size={14} className="text-brand-600" />
              {t("bookings.needHelp")}
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-600">{t("booking.supportLine")}</p>
            <Button
              fullWidth
              variant="outline"
              size="sm"
              className="tnum mt-3"
              onClick={() => toast(`${t("booking.supportLine")}: ${booking.supportPhone}`, "info")}
            >
              {booking.supportPhone}
            </Button>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="brand" size="sm" icon={<ShieldCheck size={11} />}>
                {t("card.verified")}
              </Badge>
              <Badge tone="neutral" size="sm" icon={<Lock size={11} />}>
                {booking.addressVisible ? t("bookings.addressVisible") : t("bookings.addressHidden")}
              </Badge>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t("bookings.cancelConfirmTitle")}
        body={t("bookings.cancelConfirmBody")}
        confirmLabel={t("bookings.cancelBooking")}
        onConfirm={() => {
          cancelBooking(booking.id, reason);
          toast(t("bookings.cancelled"), "warn");
        }}
      >
        <Textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("bookings.cancelReason")}
        />
      </ConfirmModal>
    </div>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-violet-200 bg-white px-3 py-2.5">
      <span className="shrink-0 text-violet-600">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold text-ink-500">{label}</span>
        <span className="block truncate text-xs font-extrabold text-ink-900">{value}</span>
      </span>
    </div>
  );
}

function hhmm(isoString: string) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

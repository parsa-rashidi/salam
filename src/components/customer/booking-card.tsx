"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarClock,
  Home,
  Lock,
  MapPin,
  Phone,
  Repeat,
  Share2,
  Star,
  Store,
  UserRoundPlus,
  XCircle,
} from "lucide-react";
import type { Booking } from "@/types";
import { PROVIDERS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/field";
import { formatClock, formatDate, formatMoney, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

export function BookingCard({ booking }: { booking: Booking }) {
  const { t, tr, locale } = useI18n();
  const { cancelBooking, toast } = useStore();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const provider = PROVIDERS.find((p) => p.id === booking.providerId);
  if (!provider) return null;

  const cancellable = booking.status === "requested" || booking.status === "pending" || booking.status === "confirmed";
  const ratable = booking.status === "done";

  return (
    <>
      <article className="card overflow-hidden">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
          <Link href={`/providers/${provider.id}`} className="shrink-0">
            <Avatar name={tr(provider.name)} accent={provider.accent} size={52} />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/providers/${provider.id}`}
                  className="truncate text-[15px] font-extrabold text-ink-950 hover:text-brand-700"
                >
                  {tr(provider.name)}
                </Link>
                <p className="tnum mt-0.5 text-[11px] text-ink-500">
                  {t("bookings.bookingCode")}: <span className="font-bold">{booking.code}</span>
                </p>
              </div>
              <StatusPill status={booking.status} />
            </div>

            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              <Line icon={<CalendarClock size={13} />}>
                {formatDate(booking.dateISO, locale)} — {formatClock(hhmm(booking.dateISO), locale)}
                <span className="text-ink-400">
                  {" "}· {localDigits(booking.durationMin, locale)} {t("common.min")}
                </span>
              </Line>
              <Line icon={booking.mode === "home" ? <Home size={13} /> : <Store size={13} />}>
                {booking.mode === "home" ? t("explore.modeHome") : t("explore.modeSalon")}
              </Line>
              {!booking.beneficiary.isSelf && (
                <Line icon={<UserRoundPlus size={13} />} tone="violet">
                  {t("bookings.forOther", { name: tr(booking.beneficiary.name) })}
                </Line>
              )}
              <Line icon={<MapPin size={13} />}>
                {booking.mode === "home" ? (
                  booking.addressVisible ? (
                    <span className="line-clamp-1">{tr(booking.address!)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-ink-500">
                      <Lock size={11} />
                      {t("bookings.addressHidden")}
                    </span>
                  )
                ) : (
                  <span className="line-clamp-1">{tr(provider.address)}</span>
                )}
              </Line>
            </div>

            {booking.companionShared && (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-800">
                <Share2 size={11} />
                {t("bookings.companionShared")}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <p className="tnum text-base font-black text-ink-950">
              {formatMoney(booking.price + booking.travelFee, locale)}
            </p>
            {booking.travelFee > 0 && (
              <p className="tnum text-[10px] text-ink-400">
                {t("profile.travelFee")}: {formatMoney(booking.travelFee, locale, false)}
              </p>
            )}
          </div>
        </div>

        <div className="scroll-thin flex flex-wrap items-center gap-2 overflow-x-auto border-t border-ink-100 bg-ink-50/70 px-4 py-3 sm:px-5">
          <Link
            href={`/bookings/${booking.id}`}
            className="flex h-9 items-center rounded-lg border border-ink-300 bg-white px-3 text-xs font-bold text-ink-800 transition-colors hover:border-ink-400"
          >
            {t("common.details")}
          </Link>
          {cancellable && (
            <Button variant="outline" size="sm" icon={<XCircle size={14} />} onClick={() => setCancelOpen(true)}>
              {t("bookings.cancelBooking")}
            </Button>
          )}
          {cancellable && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CalendarClock size={14} />}
              onClick={() => toast(locale === "fa" ? "درخواست تغییر زمان ارسال شد." : "Reschedule request sent.", "info")}
            >
              {t("bookings.reschedule")}
            </Button>
          )}
          {ratable && (
            <ButtonLinkLike href={`/providers/${provider.id}?tab=reviews`} icon={<Star size={14} />}>
              {t("bookings.rateService")}
            </ButtonLinkLike>
          )}
          {(booking.status === "done" || booking.status === "cancelled" || booking.status === "rejected") && (
            <Link
              href={`/book/${provider.id}`}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-bold text-white transition-colors hover:bg-brand-700"
            >
              <Repeat size={14} />
              {t("bookings.rebook")}
            </Link>
          )}
          {booking.companionShared && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Share2 size={14} />}
              onClick={() => toast(locale === "fa" ? "جزئیات نوبت برای همراه ارسال شد." : "Details sent to the companion.", "success")}
            >
              {t("bookings.shareWithCompanion")}
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            icon={<Phone size={14} />}
            onClick={() => toast(t("booking.supportLine") + " · " + booking.supportPhone, "info")}
          >
            {t("bookings.callSupport")}
          </Button>
        </div>
      </article>

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
        <div className="space-y-2">
          <Textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("bookings.cancelReason")}
          />
          <p className={cn("rounded-xl border border-ink-200 bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-600")}>
            <strong>{t("bookings.cancelPolicy")}:</strong> {t("bookings.cancelPolicyBody")}
          </p>
        </div>
      </ConfirmModal>
    </>
  );
}

function ButtonLinkLike({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-9 items-center gap-1.5 rounded-lg bg-deal-500 px-3 text-xs font-bold text-white transition-colors hover:bg-deal-600"
    >
      {icon}
      {children}
    </Link>
  );
}

function Line({
  icon,
  children,
  tone,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "violet";
}) {
  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-xs font-semibold",
        tone === "violet" ? "text-violet-700" : "text-ink-700",
      )}
    >
      <span className={cn("shrink-0", tone === "violet" ? "text-violet-500" : "text-ink-400")}>{icon}</span>
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

function hhmm(isoString: string) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

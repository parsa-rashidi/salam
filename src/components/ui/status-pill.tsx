"use client";

import type { BookingStatus } from "@/types";
import { Badge, type BadgeTone } from "./badge";
import { useI18n } from "@/i18n/provider";
import type { TranslationKey } from "@/i18n/dictionary";

export const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  free: "neutral",
  requested: "info",
  pending: "warn",
  confirmed: "success",
  rejected: "danger",
  cancelled: "neutral",
  done: "brand",
  no_show: "danger",
};

const STATUS_KEY: Record<BookingStatus, TranslationKey> = {
  free: "status.free",
  requested: "status.requested",
  pending: "status.pending",
  confirmed: "status.confirmed",
  rejected: "status.rejected",
  cancelled: "status.cancelled",
  done: "status.done",
  no_show: "status.no_show",
};

export function StatusPill({
  status,
  size = "md",
}: {
  status: BookingStatus;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useI18n();
  return (
    <Badge tone={STATUS_TONE[status]} size={size}>
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        aria-hidden="true"
      />
      {t(STATUS_KEY[status])}
    </Badge>
  );
}

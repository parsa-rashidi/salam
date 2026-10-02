import type { Locale } from "@/types";
import { gregorianToJalali, jalaliMonthLength, iranianWeekday } from "./jalali";

/* ------------------------------------------------------------------ *
 * Digits & numbers
 * ------------------------------------------------------------------ */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert ASCII digits in a string to Persian digits. */
export function toFaDigits(input: string | number): string {
  const s = String(input);
  return s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

export function localDigits(value: string | number, locale: Locale): string {
  const s = String(value);
  return locale === "fa" ? toFaDigits(s) : s;
}

const nf = (locale: Locale, maxFraction = 0) =>
  new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    maximumFractionDigits: maxFraction,
    minimumFractionDigits: 0,
  });

export function formatNumber(n: number, locale: Locale, maxFraction = 0): string {
  return nf(locale, maxFraction).format(n);
}

export function formatDecimal(n: number, locale: Locale, digits = 1): string {
  return nf(locale, digits).format(n);
}

/** Money in Toman, e.g. ۵۰۰٬۰۰۰ تومان / 500,000 Toman */
export function formatMoney(n: number, locale: Locale, withUnit = true): string {
  const value = nf(locale, 0).format(Math.round(n));
  return withUnit ? `${value} ${locale === "fa" ? "تومان" : "Toman"}` : value;
}

/** Compact money for cards, e.g. ۵۰۰ هزار تومان / 500K Toman */
export function formatMoneyShort(n: number, locale: Locale): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return locale === "fa"
      ? `${toFaDigits(v % 1 === 0 ? v.toFixed(0) : v.toFixed(1))} میلیون`
      : `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    return locale === "fa"
      ? `${toFaDigits(v % 1 === 0 ? v.toFixed(0) : v.toFixed(0))} هزار`
      : `${v.toFixed(0)}K`;
  }
  return nf(locale, 0).format(n);
}

export function formatCompact(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

/** Saturday-first, Iranian week order (index 0 = Saturday). */
const FA_DAYS_SHORT_LABEL = [
  "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه",
];

const FA_DAYS_SHORT_SINGLE = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** Indexed by Date#getDay() (0 = Sunday). */
const EN_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EN_DAYS_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const EN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDate(iso: string | Date): Date {
  return typeof iso === "string" ? new Date(iso) : iso;
}

/** "شنبه ۱۲ مهر" / "Sat, Oct 4" */
export function formatDate(iso: string | Date, locale: Locale): string {
  const d = toDate(iso);
  if (locale === "fa") {
    const j = gregorianToJalali(d);
    return `${FA_DAYS_SHORT_LABEL[iranianWeekday(d)]} ${toFaDigits(j.jd)} ${FA_MONTHS[j.jm]}`;
  }
  return `${EN_DAYS_SHORT[d.getDay()]}, ${EN_MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** "۱۲ مهر" / "Oct 4" */
export function formatDateShort(iso: string | Date, locale: Locale): string {
  const d = toDate(iso);
  if (locale === "fa") {
    const j = gregorianToJalali(d);
    return `${toFaDigits(j.jd)} ${FA_MONTHS[j.jm]}`;
  }
  return `${EN_MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** "۱۴۰۴/۰۷/۱۲" / "2025-10-04" */
export function formatDateNumeric(iso: string | Date, locale: Locale): string {
  const d = toDate(iso);
  if (locale === "fa") {
    const j = gregorianToJalali(d);
    return toFaDigits(
      `${j.jy}/${String(j.jm + 1).padStart(2, "0")}/${String(j.jd).padStart(2, "0")}`,
    );
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Weekday only: "شنبه" / "Saturday" */
export function formatWeekday(iso: string | Date, locale: Locale): string {
  const d = toDate(iso);
  return locale === "fa"
    ? FA_DAYS_SHORT_LABEL[iranianWeekday(d)]
    : EN_DAYS_LONG[d.getDay()];
}

/** Formats an "HH:MM" string: "۱۸:۳۰" / "6:30 PM" */
export function formatClock(hhmm: string, locale: Locale): string {
  const [hRaw, mRaw] = hhmm.split(":");
  const h = Number(hRaw);
  const m = mRaw ?? "00";
  if (!Number.isFinite(h)) return hhmm;
  if (locale === "fa") return toFaDigits(`${String(h).padStart(2, "0")}:${m}`);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

/** Time part of an ISO datetime: "۱۸:۳۰" / "6:30 PM" */
export function formatTime(iso: string | Date, locale: Locale): string {
  const d = toDate(iso);
  return formatClock(
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    locale,
  );
}

/** "شنبه ۱۲ مهر، ۱۸:۳۰" / "Sat, Oct 4, 6:30 PM" */
export function formatDateTime(iso: string | Date, locale: Locale): string {
  return `${formatDate(iso, locale)} · ${formatTime(iso, locale)}`;
}

/** Relative time: ۲ ساعت پیش / 3 hours ago */
export function formatRelative(iso: string | Date, locale: Locale, now = new Date()): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = now.getTime() - d.getTime();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  const future = diffMs < 0;

  let value: string;
  if (mins < 1) value = locale === "fa" ? "هم‌اکنون" : "just now";
  else if (mins < 60) {
    value =
      locale === "fa"
        ? `${toFaDigits(mins)} دقیقه ${future ? "بعد" : "پیش"}`
        : `${mins} min${mins === 1 ? "" : "s"} ${future ? "from now" : "ago"}`;
  } else {
    const hours = Math.round(mins / 60);
    if (hours < 24) {
      value =
        locale === "fa"
          ? `${toFaDigits(hours)} ساعت ${future ? "بعد" : "پیش"}`
          : `${hours} hour${hours === 1 ? "" : "s"} ${future ? "from now" : "ago"}`;
    } else {
      const days = Math.round(hours / 24);
      if (days < 30) {
        value =
          locale === "fa"
            ? `${toFaDigits(days)} روز ${future ? "بعد" : "پیش"}`
            : `${days} day${days === 1 ? "" : "s"} ${future ? "from now" : "ago"}`;
      } else {
        return formatDate(d, locale);
      }
    }
  }
  return value;
}

/** Countdown for flash deals: ۰۲:۴۵:۱۰ / 2h 45m */
export function formatCountdown(iso: string, locale: Locale, now = new Date()): string {
  const target = new Date(iso).getTime();
  let diff = Math.max(0, target - now.getTime());
  const h = Math.floor(diff / 3_600_000);
  diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000);
  diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  const text = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return locale === "fa" ? toFaDigits(text) : text;
}

export function formatDuration(min: number, locale: Locale): string {
  if (min < 60) {
    return locale === "fa" ? `${toFaDigits(min)} دقیقه` : `${min} min`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return locale === "fa" ? `${toFaDigits(h)} ساعت` : `${h}h`;
  return locale === "fa"
    ? `${toFaDigits(h)} ساعت و ${toFaDigits(m)} دقیقه`
    : `${h}h ${m}m`;
}

/* ------------------------------------------------------------------ *
 * Calendar helpers (Iranian week: Saturday = 0)
 * ------------------------------------------------------------------ */

export interface DayOption {
  iso: string; // yyyy-mm-dd
  date: Date;
  weekdayIndex: number; // Iranian week index
  weekdayLabel: string;
  dayLabel: string; // "14" (Persian digits when fa)
  monthLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function buildDayOptions(count: number, locale: Locale): DayOption[] {
  const today = startOfToday();
  const out: DayOption[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const idx = iranianWeekday(d);
    const jalali = gregorianToJalali(d);
    out.push({
      iso: toISODate(d),
      date: d,
      weekdayIndex: idx,
      weekdayLabel: locale === "fa" ? FA_DAYS_SHORT_SINGLE[idx] : EN_DAYS_SHORT[d.getDay()],
      dayLabel: locale === "fa" ? toFaDigits(d.getDate()) : String(d.getDate()),
      monthLabel: locale === "fa" ? FA_MONTHS[jalali.jm] : EN_MONTHS_SHORT[d.getMonth()],
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }
  return out;
}

/** Iranian-week ordered day list for settings screens. */
export function weekDayLabels(locale: Locale): { index: number; label: string; short: string }[] {
  if (locale === "fa") {
    return FA_DAYS_SHORT_LABEL.map((label, index) => ({
      index,
      label,
      short: FA_DAYS_SHORT_SINGLE[index],
    }));
  }
  // Same Saturday-first ordering, English labels.
  return [
    { index: 0, label: "Saturday", short: "Sa" },
    { index: 1, label: "Sunday", short: "Su" },
    { index: 2, label: "Monday", short: "Mo" },
    { index: 3, label: "Tuesday", short: "Tu" },
    { index: 4, label: "Wednesday", short: "We" },
    { index: 5, label: "Thursday", short: "Th" },
    { index: 6, label: "Friday", short: "Fr" },
  ];
}

export function jalaliMonthLengthFor(year: number, month: number) {
  return jalaliMonthLength(year, month);
}

/* ------------------------------------------------------------------ *
 * Geo
 * ------------------------------------------------------------------ */

const R = 6371;

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number, locale: Locale): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return locale === "fa" ? `${toFaDigits(m)} متر` : `${m} m`;
  }
  const value = formatDecimal(km, locale, km < 10 ? 1 : 0);
  return locale === "fa" ? `${value} کیلومتر` : `${value} km`;
}

/** Estimated driving time from distance (rough city heuristic). */
export function travelMinutes(km: number): number {
  return Math.max(5, Math.round(km * 3.2));
}

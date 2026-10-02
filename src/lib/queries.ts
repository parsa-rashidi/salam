import type { BookingStatus, FlashDeal, Provider, ServiceMode } from "@/types";
import { distanceKm } from "./format";
import { DISTRICTS } from "./mock-data";

export interface Filters {
  query: string;
  categories: string[];
  modes: ServiceMode[] | "all";
  maxPrice: number;
  minRating: number;
  maxDistanceKm: number;
  availableToday: boolean;
  availableTomorrow: boolean;
  instantOnly: boolean;
  verifiedOnly: boolean;
  seniorFriendly: boolean;
  accessibilityTrained: boolean;
  districtId: string | "all";
  dealsOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  categories: [],
  modes: "all",
  maxPrice: 20_000_000,
  minRating: 0,
  maxDistanceKm: 20,
  availableToday: false,
  availableTomorrow: false,
  instantOnly: false,
  verifiedOnly: false,
  seniorFriendly: false,
  accessibilityTrained: false,
  districtId: "all",
  dealsOnly: false,
};

export function minServicePrice(p: Provider): number {
  if (!p.services.length) return 0;
  return Math.min(...p.services.map((s) => s.price));
}

export function maxServicePrice(p: Provider): number {
  if (!p.services.length) return 0;
  return Math.max(...p.services.map((s) => s.price));
}

export function dealsForProvider(deals: FlashDeal[], providerId: string): FlashDeal[] {
  return deals.filter((d) => d.providerId === providerId && d.remaining > 0);
}

export function bestDeal(deals: FlashDeal[], providerId: string): FlashDeal | undefined {
  const list = dealsForProvider(deals, providerId);
  if (!list.length) return undefined;
  return [...list].sort(
    (a, b) =>
      1 - b.dealPrice / b.originalPrice - (1 - a.dealPrice / a.originalPrice),
  )[0];
}

export function discountPercent(deal: FlashDeal): number {
  return Math.round((1 - deal.dealPrice / deal.originalPrice) * 100);
}

export function isDealActive(deal: FlashDeal, now = new Date()): boolean {
  return new Date(deal.dateISO).getTime() > now.getTime() && deal.remaining > 0;
}

export function providerDistance(
  p: Provider,
  loc: { lat: number; lng: number },
): number {
  return distanceKm({ lat: p.lat, lng: p.lng }, loc);
}

export function slotIsToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function slotIsTomorrow(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export function filterAndSort(
  providers: Provider[],
  deals: FlashDeal[],
  filters: Filters,
  loc: { lat: number; lng: number },
  sort: SortKey,
): Provider[] {
  const q = filters.query.trim().toLowerCase();

  const result = providers.filter((p) => {
    const dist = providerDistance(p, loc);
    if (dist > filters.maxDistanceKm) return false;
    if (filters.minRating && p.rating < filters.minRating) return false;
    if (minServicePrice(p) > filters.maxPrice) return false;
    if (filters.verifiedOnly && !p.verified) return false;
    if (filters.instantOnly && !p.acceptsInstant) return false;
    if (filters.seniorFriendly && !p.seniorFriendly) return false;
    if (filters.accessibilityTrained && !p.accessibilityTrained) return false;
    if (filters.dealsOnly && !dealsForProvider(deals, p.id).length) return false;

    if (filters.modes !== "all" && filters.modes.length) {
      const wanted = filters.modes;
      if (!wanted.some((m) => p.modes.includes(m))) return false;
    }

    if (filters.categories.length) {
      const cats = new Set(p.services.map((s) => s.categoryId));
      if (!filters.categories.some((c) => cats.has(c as never))) return false;
    }

    if (filters.availableToday && !slotIsToday(p.nextFreeSlot)) return false;
    if (filters.availableTomorrow && !slotIsTomorrow(p.nextFreeSlot)) return false;

    if (filters.districtId !== "all") {
      if (p.district.fa !== districtFaById(filters.districtId) &&
          p.district.en !== districtEnById(filters.districtId)) {
        return false;
      }
    }

    if (q) {
      const haystack = [
        p.name.fa, p.name.en, p.district.fa, p.district.en,
        p.bio.fa, p.bio.en,
        ...p.services.flatMap((s) => [s.name.fa, s.name.en]),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const sorted = [...result];
  switch (sort) {
    case "nearest":
      sorted.sort((a, b) => providerDistance(a, loc) - providerDistance(b, loc));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "priceLow":
      sorted.sort((a, b) => minServicePrice(a) - minServicePrice(b));
      break;
    case "priceHigh":
      sorted.sort((a, b) => minServicePrice(b) - minServicePrice(a));
      break;
    case "deals":
      sorted.sort((a, b) => {
        const da = dealsForProvider(deals, a.id).length;
        const db = dealsForProvider(deals, b.id).length;
        return db - da || providerDistance(a, loc) - providerDistance(b, loc);
      });
      break;
    case "soonest":
      sorted.sort(
        (a, b) => new Date(a.nextFreeSlot).getTime() - new Date(b.nextFreeSlot).getTime(),
      );
      break;
  }
  return sorted;
}

export type SortKey =
  | "nearest"
  | "rating"
  | "priceLow"
  | "priceHigh"
  | "deals"
  | "soonest";

function districtFaById(id: string) {
  return DISTRICTS.find((d) => d.id === id)?.name.fa ?? "";
}
function districtEnById(id: string) {
  return DISTRICTS.find((d) => d.id === id)?.name.en ?? "";
}

/** Status ordering used by the "upcoming / history" tabs. */
export function isUpcoming(status: BookingStatus): boolean {
  return status === "requested" || status === "pending" || status === "confirmed";
}

/** Generate deterministic free slots for a provider/day (prototype). */
export function generateSlots(provider: Provider, dayOffset: number): string[] {
  const wh = provider.workingHours.find((w) => w.day === weekdayOf(dayOffset));
  if (!wh || wh.closed) return [];
  const [oh, om] = wh.open.split(":").map(Number);
  const [ch] = wh.close.split(":").map(Number);
  const step = Math.max(30, Math.round(provider.services[0]?.durationMin ?? 45));
  const out: string[] = [];
  let minutes = oh * 60 + om;
  let i = 0;
  while (minutes + step <= ch * 60) {
    // deterministic pseudo-random skip so grids look organic
    const seed = (provider.id.charCodeAt(1) + dayOffset * 7 + i * 13) % 5;
    if (seed !== 2) {
      out.push(
        `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
      );
    }
    minutes += step;
    i += 1;
  }
  return out;
}

function weekdayOf(dayOffset: number): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return (d.getDay() + 1) % 7;
}

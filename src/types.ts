/**
 * Shared domain types for the prototype.
 * Everything here mirrors the data model described in the project brief,
 * but is intentionally kept simple because this is a UI prototype
 * driven by mock data (no backend).
 */

export type Locale = "fa" | "en";

/** Localised string */
export type L10n = Record<Locale, string>;

/** How a provider delivers services */
export type ServiceMode = "salon" | "home";

/** Provider business type */
export type ProviderKind = "independent" | "salon";

/** Service categories (managed by admin in the real system) */
export type CategoryId =
  | "haircut"
  | "beard"
  | "color"
  | "facial"
  | "nails"
  | "makeup"
  | "bridal"
  | "kids"
  | "epilation"
  | "spa";

export interface ServiceItem {
  id: string;
  categoryId: CategoryId;
  name: L10n;
  /** price in Toman */
  price: number;
  durationMin: number;
  homeAvailable: boolean;
  /** extra fee when delivered at the customer's location (Toman) */
  homeSurcharge?: number;
}

export interface WorkingDay {
  /** 0 = Saturday (Iranian week start) … 6 = Friday */
  day: number;
  open: string; // "09:00"
  close: string; // "20:00"
  closed?: boolean;
}

export interface PortfolioItem {
  id: string;
  image: string;
  caption: L10n;
  categoryId: CategoryId;
  likes: number;
}

export interface Provider {
  id: string;
  name: L10n;
  kind: ProviderKind;
  gender: "male" | "female";
  verified: boolean;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  address: L10n;
  district: L10n;
  city: L10n;
  modes: ServiceMode[];
  /** radius in km for at-home services */
  homeRadiusKm: number;
  /** base travel fee in Toman */
  travelFee: number;
  openNow: boolean;
  acceptsInstant: boolean;
  seniorFriendly: boolean;
  accessibilityTrained: boolean;
  yearsExperience: number;
  priceLevel: 1 | 2 | 3;
  /** average minutes to answer a request */
  responseTimeMin: number;
  nextFreeSlot: string; // ISO datetime
  bio: L10n;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  workingHours: WorkingDay[];
  accent: string; // tailwind-friendly hex for the avatar
  bookingsCount: number;
  phoneMasked: string;
}

/**
 * Appointment lifecycle from the brief:
 * آزاد / درخواست‌شده / در انتظار تأیید / تأییدشده / ردشده / لغوشده / انجام‌شده / عدم مراجعه
 */
export type BookingStatus =
  | "free"
  | "requested"
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "done"
  | "no_show";

export interface Beneficiary {
  name: L10n;
  relation: L10n;
  isSelf: boolean;
  /** notes for the provider, e.g. mobility limitations */
  notes?: L10n;
}

export interface Booking {
  id: string;
  code: string;
  providerId: string;
  customerName: L10n;
  beneficiary: Beneficiary;
  serviceId: string;
  mode: ServiceMode;
  status: BookingStatus;
  dateISO: string;
  durationMin: number;
  price: number;
  travelFee: number;
  dealId?: string;
  address?: L10n;
  addressVisible: boolean;
  createdAtISO: string;
  timeline: { at: string; status: BookingStatus; note?: L10n }[];
  companionShared: boolean;
  supportPhone: string;
}

export interface FlashDeal {
  id: string;
  providerId: string;
  categoryId: CategoryId;
  serviceName: L10n;
  originalPrice: number;
  dealPrice: number;
  dateISO: string;
  expiresAtISO: string;
  capacity: number;
  remaining: number;
  /** visibility radius in km */
  radiusKm: number;
  cancellationNote: L10n;
  lat: number;
  lng: number;
  district: L10n;
  /** where the deal is delivered (defaults to the provider's own modes) */
  mode?: ServiceMode;
  /** paid visibility tier chosen by the provider */
  boost?: "basic" | "neighborhood" | "city";
  note?: L10n;
}

export interface Review {
  id: string;
  providerId: string;
  authorName: string;
  rating: number;
  at: string;
  body: L10n;
  mode: ServiceMode;
  helpful: number;
  reply?: L10n;
}

/** Provider calendar cell */
export interface Slot {
  id: string;
  time: string; // "14:30"
  state: "free" | "requested" | "confirmed" | "blocked";
  customer?: string;
  service?: string;
  mode?: ServiceMode;
}

export interface ProviderRequest {
  id: string;
  customer: L10n;
  service: L10n;
  dateISO: string;
  mode: ServiceMode;
  price: number;
  travelFee: number;
  beneficiaryIsOther: boolean;
  senior: boolean;
  notes?: L10n;
  distanceKm: number;
  status: "requested" | "confirmed" | "rejected" | "countered";
  proposedTime?: string;
  avatarAccent: string;
}

/** Admin: providers awaiting verification */
export interface PendingProvider {
  id: string;
  name: L10n;
  kind: ProviderKind;
  city: L10n;
  submittedAt: string;
  docsSubmitted: boolean;
  nationalIdVerified: boolean;
  phoneVerified: boolean;
  status: "pending" | "approved" | "rejected";
  accent: string;
  servicesCount: number;
}

export interface ReportItem {
  id: string;
  type: "review" | "portfolio" | "provider" | "booking" | "user";
  subject: L10n;
  reporter: string;
  reason: L10n;
  at: string;
  status: "open" | "reviewing" | "resolved";
}

export interface NotificationItem {
  id: string;
  title: L10n;
  body: L10n;
  at: string;
  kind: "booking" | "deal" | "system" | "review";
  read: boolean;
}

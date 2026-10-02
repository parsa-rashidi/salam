"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Booking,
  FlashDeal,
  NotificationItem,
  PendingProvider,
  PortfolioItem,
  ProviderRequest,
  ServiceItem,
  Slot,
} from "@/types";
import {
  BOOKINGS,
  CALENDAR_DAYS,
  FLASH_DEALS,
  NOTIFICATIONS,
  PENDING_PROVIDERS,
  PROVIDER_CUSTOMERS,
  PROVIDER_REQUESTS,
} from "@/lib/mock-data";
import { DEMO_CUSTOMER, CURRENT_PROVIDER } from "@/lib/mock-data";

export interface Toast {
  id: number;
  message: string;
  kind: "success" | "info" | "warn" | "error";
  action?: { label: string; href: string };
}

interface CalendarDay {
  offset: number;
  iso: string;
  slots: Slot[];
}

export interface ProviderSettings {
  displayName: string;
  kind: "independent" | "salon";
  gender: "male" | "female";
  bio: string;
  modes: { salon: boolean; home: boolean };
  homeRadiusKm: number;
  travelFee: number;
  acceptsInstant: boolean;
  online: boolean;
  seniorFriendly: boolean;
  accessibilityTrained: boolean;
  workingHours: { day: number; open: string; close: string; closed: boolean }[];
  travelZones: { zone: string; km: number; fee: number }[];
}

interface StoreValue {
  /* session */
  signedIn: boolean;
  user: { name: string; phone: string };
  signIn: (phone: string) => void;
  signOut: () => void;

  /* favourites */
  favorites: string[];
  toggleFavorite: (providerId: string) => boolean;
  isFavorite: (providerId: string) => boolean;

  /* bookings (customer side) */
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string, reason?: string) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;

  /* flash deals */
  deals: FlashDeal[];
  addDeal: (d: FlashDeal) => void;
  deactivateDeal: (id: string) => void;
  dealNotificationOptIn: string[];
  optInDealNotification: (districtId: string) => void;

  /* provider panel */
  requests: ProviderRequest[];
  setRequestStatus: (
    id: string,
    status: ProviderRequest["status"],
    proposedTime?: string,
  ) => void;
  calendar: CalendarDay[];
  setSlotState: (dayOffset: number, slotId: string, state: Slot["state"]) => void;
  services: ServiceItem[];
  saveService: (s: ServiceItem) => void;
  removeService: (id: string) => void;
  portfolio: PortfolioItem[];
  addPortfolioItem: (p: PortfolioItem) => void;
  removePortfolioItem: (id: string) => void;
  customers: typeof PROVIDER_CUSTOMERS;
  settings: ProviderSettings;
  updateSettings: (patch: Partial<ProviderSettings>) => void;

  /* notifications */
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;

  /* admin */
  pending: PendingProvider[];
  resolvePending: (id: string, status: "approved" | "rejected") => void;
  blockedUsers: string[];
  toggleBlockUser: (id: string) => void;

  /* toasts */
  toasts: Toast[];
  toast: (message: string, kind?: Toast["kind"], action?: Toast["action"]) => void;
  dismissToast: (id: number) => void;

  /* customer location used across the app */
  userLocation: { lat: number; lng: number };
  setUserLocation: (loc: { lat: number; lng: number }) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(true); // demo starts signed in
  const [user, setUser] = useState({ name: DEMO_CUSTOMER.name.fa, phone: DEMO_CUSTOMER.phone });

  const [favorites, setFavorites] = useState<string[]>(["p3", "p9"]);
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [deals, setDeals] = useState<FlashDeal[]>(FLASH_DEALS);
  const [dealNotificationOptIn, setDealNotificationOptIn] = useState<string[]>([]);
  const [requests, setRequests] = useState<ProviderRequest[]>(PROVIDER_REQUESTS);
  const [calendar, setCalendar] = useState<CalendarDay[]>(CALENDAR_DAYS);
  const [services, setServices] = useState<ServiceItem[]>(CURRENT_PROVIDER.services);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(CURRENT_PROVIDER.portfolio);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [pending, setPending] = useState<PendingProvider[]>(PENDING_PROVIDERS);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(["u4", "u8"]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userLocation, setUserLocation] = useState({
    lat: DEMO_CUSTOMER.lat,
    lng: DEMO_CUSTOMER.lng,
  });
  const [settings, setSettings] = useState<ProviderSettings>({
    displayName: CURRENT_PROVIDER.name.fa,
    kind: CURRENT_PROVIDER.kind,
    gender: CURRENT_PROVIDER.gender,
    bio: CURRENT_PROVIDER.bio.fa,
    modes: { salon: true, home: true },
    homeRadiusKm: CURRENT_PROVIDER.homeRadiusKm,
    travelFee: CURRENT_PROVIDER.travelFee,
    acceptsInstant: CURRENT_PROVIDER.acceptsInstant,
    online: true,
    seniorFriendly: CURRENT_PROVIDER.seniorFriendly,
    accessibilityTrained: CURRENT_PROVIDER.accessibilityTrained,
    workingHours: CURRENT_PROVIDER.workingHours.map((w) => ({ ...w, closed: !!w.closed })),
    travelZones: [
      { zone: "تا ۳ کیلومتر", km: 3, fee: 90_000 },
      { zone: "۳ تا ۶ کیلومتر", km: 6, fee: 120_000 },
      { zone: "۶ تا ۱۰ کیلومتر", km: 10, fee: 180_000 },
    ],
  });

  const toastId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<StoreValue["toast"]>(
    (message, kind = "success", action) => {
      toastId.current += 1;
      const id = toastId.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, kind, action }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
    },
    [],
  );

  const toggleFavorite = useCallback((providerId: string) => {
    let added = false;
    setFavorites((prev) => {
      added = !prev.includes(providerId);
      return added ? [...prev, providerId] : prev.filter((id) => id !== providerId);
    });
    return added;
  }, []);

  const isFavorite = useCallback(
    (providerId: string) => favorites.includes(providerId),
    [favorites],
  );

  const addBooking = useCallback((b: Booking) => {
    setBookings((prev) => [b, ...prev]);
  }, []);

  const cancelBooking = useCallback((id: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "cancelled",
              timeline: [
                ...b.timeline,
                {
                  at: new Date().toISOString(),
                  status: "cancelled",
                  note: reason ? { fa: reason, en: reason } : undefined,
                },
              ],
            }
          : b,
      ),
    );
  }, []);

  const updateBookingStatus = useCallback((id: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              timeline: [...b.timeline, { at: new Date().toISOString(), status }],
            }
          : b,
      ),
    );
  }, []);

  const addDeal = useCallback((d: FlashDeal) => {
    setDeals((prev) => [d, ...prev]);
  }, []);

  const deactivateDeal = useCallback((id: string) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, remaining: 0 } : d)));
  }, []);

  const optInDealNotification = useCallback((districtId: string) => {
    setDealNotificationOptIn((prev) =>
      prev.includes(districtId) ? prev : [...prev, districtId],
    );
  }, []);

  const setRequestStatus = useCallback<StoreValue["setRequestStatus"]>(
    (id, status, proposedTime) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, proposedTime: proposedTime ?? r.proposedTime } : r,
        ),
      );
    },
    [],
  );

  const setSlotState = useCallback<StoreValue["setSlotState"]>((dayOffset, slotId, state) => {
    setCalendar((prev) =>
      prev.map((day) =>
        day.offset === dayOffset
          ? { ...day, slots: day.slots.map((s) => (s.id === slotId ? { ...s, state } : s)) }
          : day,
      ),
    );
  }, []);

  const saveService = useCallback((s: ServiceItem) => {
    setServices((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
  }, []);

  const removeService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addPortfolioItem = useCallback((p: PortfolioItem) => {
    setPortfolio((prev) => [p, ...prev]);
  }, []);

  const removePortfolioItem = useCallback((id: string) => {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const resolvePending = useCallback((id: string, status: "approved" | "rejected") => {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const toggleBlockUser = useCallback((id: string) => {
    setBlockedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const signIn = useCallback((phone: string) => {
    setSignedIn(true);
    setUser({ name: DEMO_CUSTOMER.name.fa, phone });
  }, []);

  const signOut = useCallback(() => setSignedIn(false), []);

  const updateSettings = useCallback((patch: Partial<ProviderSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      signedIn,
      user,
      signIn,
      signOut,
      favorites,
      toggleFavorite,
      isFavorite,
      bookings,
      addBooking,
      cancelBooking,
      updateBookingStatus,
      deals,
      addDeal,
      deactivateDeal,
      dealNotificationOptIn,
      optInDealNotification,
      requests,
      setRequestStatus,
      calendar,
      setSlotState,
      services,
      saveService,
      removeService,
      portfolio,
      addPortfolioItem,
      removePortfolioItem,
      customers: PROVIDER_CUSTOMERS,
      settings,
      updateSettings,
      notifications,
      markAllNotificationsRead,
      pending,
      resolvePending,
      blockedUsers,
      toggleBlockUser,
      toasts,
      toast,
      dismissToast,
      userLocation,
      setUserLocation,
    }),
    [
      signedIn, user, signIn, signOut, favorites, toggleFavorite, isFavorite,
      bookings, addBooking, cancelBooking, updateBookingStatus, deals, addDeal,
      deactivateDeal, dealNotificationOptIn, optInDealNotification, requests,
      setRequestStatus, calendar, setSlotState, services, saveService, removeService,
      portfolio, addPortfolioItem, removePortfolioItem, settings, updateSettings,
      notifications, markAllNotificationsRead, pending, resolvePending, blockedUsers,
      toggleBlockUser, toasts, toast, dismissToast, userLocation,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <AppStoreProvider>");
  return ctx;
}

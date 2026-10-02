"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, CalendarX2, History, MapPinOff, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { BookingCard } from "@/components/customer/booking-card";
import { PageHeader, EmptyState } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { isUpcoming } from "@/lib/queries";
import { localDigits } from "@/lib/format";

type Tab = "upcoming" | "history" | "cancelled";

export default function BookingsPage() {
  const { t, locale } = useI18n();
  const { bookings } = useStore();
  const [tab, setTab] = useState<Tab>("upcoming");

  const groups = useMemo(() => {
    const upcoming = bookings
      .filter((b) => isUpcoming(b.status))
      .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
    const history = bookings
      .filter((b) => b.status === "done" || b.status === "no_show")
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    const cancelled = bookings
      .filter((b) => b.status === "cancelled" || b.status === "rejected")
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    return { upcoming, history, cancelled };
  }, [bookings]);

  const list = groups[tab];

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white">
              <CalendarCheck2 size={20} />
            </span>
            {t("bookings.title")}
          </span>
        }
        subtitle={t("bookings.subtitle")}
        actions={
          <ButtonLink href="/explore" variant="outline" size="md">
            {t("bookings.findProvider")}
          </ButtonLink>
        }
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { id: "upcoming", label: t("bookings.tabUpcoming"), count: localDigits(groups.upcoming.length, locale), icon: <CalendarCheck2 size={14} /> },
            { id: "history", label: t("bookings.tabHistory"), count: localDigits(groups.history.length, locale), icon: <History size={14} /> },
            { id: "cancelled", label: t("bookings.tabCancelled"), count: localDigits(groups.cancelled.length, locale), icon: <CalendarX2 size={14} /> },
          ]}
        />

        <div className="mt-5 space-y-4">
          {list.length === 0 ? (
            <EmptyState
              icon={tab === "upcoming" ? <Sparkles size={28} /> : tab === "history" ? <History size={28} /> : <MapPinOff size={28} />}
              title={t("bookings.emptyTitle")}
              body={t("bookings.emptyBody")}
              action={<ButtonLink href="/explore">{t("bookings.findProvider")}</ButtonLink>}
            />
          ) : (
            list.map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </div>
      </div>
    </>
  );
}

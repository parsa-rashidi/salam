"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { BellRing, Flame, Layers, Map as MapIcon, Percent, Rows3, Sparkles } from "lucide-react";
import type { MapApi } from "@/components/map/providers-map";
import { PROVIDERS } from "@/lib/mock-data";
import { discountPercent, isDealActive } from "@/lib/queries";
import { distanceKm, localDigits } from "@/lib/format";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { DealCard } from "@/components/customer/deal-card";
import { PageHeader, EmptyState } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";

const ProvidersMap = dynamic(() => import("@/components/map/providers-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-100">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
    </div>
  ),
});

type Sort = "nearest" | "discount" | "ending";
type View = "grid" | "map";

export default function DealsPage() {
  const { t, locale } = useI18n();
  const { deals, userLocation, toast, optInDealNotification } = useStore();
  const [sort, setSort] = useState<Sort>("nearest");
  const [view, setView] = useState<View>("grid");
  const [onlyActive, setOnlyActive] = useState(true);
  const [mapApi, setMapApi] = useState<MapApi | null>(null);

  const list = useMemo(() => {
    const base = deals.filter((d) => (onlyActive ? isDealActive(d) : true));
    return [...base].sort((a, b) => {
      if (sort === "discount") return discountPercent(b) - discountPercent(a);
      if (sort === "ending") return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
      return (
        distanceKm(a, userLocation) - distanceKm(b, userLocation)
      );
    });
  }, [deals, sort, userLocation, onlyActive]);

  const providersWithDeals = useMemo(
    () => PROVIDERS.filter((p) => list.some((d) => d.providerId === p.id)),
    [list],
  );

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-deal-500 text-white">
              <Flame size={20} />
            </span>
            {t("deals.title")}
          </span>
        }
        subtitle={t("deals.subtitle")}
        actions={
          <>
            <Segmented<View>
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { id: "grid", label: <Rows3 size={14} /> },
                { id: "map", label: <MapIcon size={14} /> },
              ]}
            />
            <Button
              variant="outline"
              size="md"
              icon={<BellRing size={15} />}
              onClick={() => {
                optInDealNotification("all");
                toast(t("deals.toastSubscribed"), "success");
              }}
            >
              {t("deals.notifyMe")}
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "nearest", key: "deals.filterNearest" },
                { id: "discount", key: "deals.filterBiggestDiscount" },
                { id: "ending", key: "deals.filterEndingSoon" },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                onClick={() => setSort(o.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                  sort === o.id
                    ? "border-deal-500 bg-deal-500 text-white"
                    : "border-ink-300 bg-white text-ink-700 hover:border-ink-400",
                )}
              >
                {t(o.key)}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="h-3.5 w-3.5 accent-brand-600"
            />
            {t("common.active")}
          </label>
          <span className="tnum rounded-full bg-ink-100 px-3 py-1.5 text-xs font-bold text-ink-600">
            {localDigits(list.length, locale)} {t("common.results")}
          </span>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<Percent size={28} />}
            title={t("deals.empty")}
            body={t("deals.emptyBody")}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setOnlyActive(false)}>
                  {t("common.all")}
                </Button>
                <ButtonLink href="/explore" size="sm">
                  {t("nav.explore")}
                </ButtonLink>
              </div>
            }
          />
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((d) => (
              <DealCard
                key={d.id}
                deal={d}
                provider={PROVIDERS.find((p) => p.id === d.providerId)}
                userLocation={userLocation}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative h-[60vh] overflow-hidden rounded-2xl border border-ink-200 shadow-card lg:h-[70vh]">
              {mapApi && (
                <button
                  onClick={() => mapApi.recenter()}
                  className="absolute bottom-3 start-3 z-[500] flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white/95 px-3 py-2 text-xs font-bold text-ink-800 shadow-card backdrop-blur hover:bg-white"
                >
                  <Layers size={13} />
                  {t("explore.recenter")}
                </button>
              )}
              <ProvidersMap
                providers={providersWithDeals}
                deals={list}
                showDeals
                userLocation={userLocation}
                onReady={setMapApi}
                zoom={12}
              />
            </div>
            <div className="scroll-thin max-h-[70vh] space-y-3 overflow-y-auto pe-1">
              {list.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  provider={PROVIDERS.find((p) => p.id === d.providerId)}
                  userLocation={userLocation}
                  variant="compact"
                />
              ))}
            </div>
            {mapApi && <span className="sr-only"><Layers size={1} /></span>}
          </div>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-deal-200 bg-deal-50/60 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-500 text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-deal-900">{t("deals.badge")}</p>
            <p className="mt-1 text-xs leading-relaxed text-deal-800">{t("deals.autoDeactivate")}</p>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Crosshair,
  ListFilter,
  Map as MapIcon,
  MapPinOff,
  Rows3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { MapApi } from "@/components/map/providers-map";
import { PROVIDERS, DISTRICTS } from "@/lib/mock-data";
import { useStore } from "@/store/app-store";
import { useI18n } from "@/i18n/provider";
import {
  DEFAULT_FILTERS,
  filterAndSort,
  type Filters,
  type SortKey,
} from "@/lib/queries";
import { localDigits } from "@/lib/format";
import { FilterPanel, countActive } from "@/components/customer/filter-panel";
import { ProviderCard, ProviderMiniCard } from "@/components/customer/provider-card";
import { EmptyState, Chip } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/tabs";
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

type ViewMode = "split" | "list" | "map";

const SORTS: { id: SortKey; key: TranslationKey }[] = [
  { id: "nearest", key: "explore.sortNearest" },
  { id: "rating", key: "explore.sortRating" },
  { id: "priceLow", key: "explore.sortPriceLow" },
  { id: "deals", key: "explore.sortDeals" },
  { id: "soonest", key: "explore.sortSoonest" },
];

function ExploreInner() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const { deals, userLocation, setUserLocation, toast } = useStore();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("nearest");
  const [view, setView] = useState<ViewMode>("split");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mapApi, setMapApi] = useState<MapApi | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const didInit = useRef(false);

  /* -------- read URL params once -------- */
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const patch: Partial<Filters> = {};
    const q = params.get("q");
    if (q) patch.query = q;
    const mode = params.get("mode");
    if (mode === "home" || mode === "salon") patch.modes = [mode];
    const cat = params.get("cat");
    if (cat) patch.categories = [cat];
    if (params.get("senior") === "1") {
      patch.seniorFriendly = true;
      patch.accessibilityTrained = true;
    }
    if (params.get("deals") === "1") patch.dealsOnly = true;
    if (Object.keys(patch).length) setFilters((f) => ({ ...f, ...patch }));

    if (typeof window !== "undefined" && window.innerWidth < 1024) setView("list");
  }, [params]);

  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const reset = () => setFilters(DEFAULT_FILTERS);

  const results = useMemo(
    () => filterAndSort(PROVIDERS, deals, filters, userLocation, sort),
    [deals, filters, userLocation, sort],
  );

  const activeProvider = results.find((p) => p.id === activeId) ?? results[0];
  const activeFilters = countActive(filters);

  const selectProvider = (id: string) => {
    setActiveId(id);
    const p = PROVIDERS.find((x) => x.id === id);
    if (p) mapApi?.focusOn(p.lat, p.lng, 15);
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast(
            locale === "fa"
              ? "موقعیت واقعی شما دریافت شد و نتایج به‌روزرسانی شدند."
              : "Got your real location — results updated.",
            "success",
          );
          mapApi?.invalidate();
        },
        () => {
          setUserLocation({ lat: 35.7952, lng: 51.4181 });
          toast(
            locale === "fa"
              ? "دسترسی به موقعیت داده نشد؛ موقعیت نمونه (الهیه) استفاده شد."
              : "Location permission denied — using the demo location (Elahieh).",
            "warn",
          );
        },
        { timeout: 6000 },
      );
    } else {
      setUserLocation({ lat: 35.7952, lng: 51.4181 });
    }
  };

  const showMap = view !== "list";
  const showList = view !== "map";

  return (
    <div className="pb-4">
      {/* ---------------- toolbar ---------------- */}
      <div className="sticky top-16 z-30 border-b border-ink-200 bg-white/95 backdrop-blur lg:top-[72px]">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-2.5 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3" />
              <input
                value={filters.query}
                onChange={(e) => patch({ query: e.target.value })}
                placeholder={t("explore.searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-ink-300 bg-white pe-8 ps-9 text-sm font-medium text-ink-950 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                aria-label={t("common.search")}
              />
              {filters.query && (
                <button
                  onClick={() => patch({ query: "" })}
                  className="absolute top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 end-2.5"
                  aria-label={t("misc.clear")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Button variant="outline" size="md" onClick={useMyLocation} icon={<Crosshair size={15} />} className="shrink-0 px-3">
              <span className="hidden sm:inline">{t("explore.myLocation")}</span>
            </Button>

            <div className="hidden sm:block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 rounded-xl border border-ink-300 bg-white px-2.5 text-xs font-bold text-ink-800 focus:border-brand-500 focus:outline-none"
                aria-label={t("common.sort")}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(s.key)}
                  </option>
                ))}
              </select>
            </div>

            <Segmented<ViewMode>
              size="sm"
              value={view}
              onChange={setView}
              className="hidden md:inline-flex"
              options={[
                { id: "split", label: <Rows3 size={14} /> },
                { id: "list", label: <ListFilter size={14} /> },
                { id: "map", label: <MapIcon size={14} /> },
              ]}
            />

            <Button
              variant={activeFilters ? "secondary" : "outline"}
              size="md"
              className="relative shrink-0 px-3 xl:hidden"
              onClick={() => setSheetOpen(true)}
              icon={<SlidersHorizontal size={15} />}
            >
              <span className="hidden sm:inline">{t("common.filters")}</span>
              {activeFilters > 0 && (
                <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {localDigits(activeFilters, locale)}
                </span>
              )}
            </Button>
          </div>

          {/* active filter chips */}
          {activeFilters > 0 && (
            <div className="scroll-thin mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {filters.categories.map((c) => (
                <Chip
                  key={c}
                  active
                  onClick={() => patch({ categories: filters.categories.filter((x) => x !== c) })}
                  icon={<X size={11} />}
                >
                  {t(`cat.${c}` as TranslationKey)}
                </Chip>
              ))}
              {filters.modes !== "all" &&
                filters.modes.map((m) => (
                  <Chip
                    key={m}
                    active
                    onClick={() => {
                      if (filters.modes === "all") return;
                      const next = filters.modes.filter((x) => x !== m);
                      patch({ modes: next.length ? next : "all" });
                    }}
                    icon={<X size={11} />}
                  >
                    {m === "home" ? t("explore.modeHome") : t("explore.modeSalon")}
                  </Chip>
                ))}
              {filters.seniorFriendly && (
                <Chip active onClick={() => patch({ seniorFriendly: false })} icon={<X size={11} />}>
                  {t("explore.seniorFriendly")}
                </Chip>
              )}
              {filters.accessibilityTrained && (
                <Chip active onClick={() => patch({ accessibilityTrained: false })} icon={<X size={11} />}>
                  {t("explore.accessibilityTrained")}
                </Chip>
              )}
              {filters.verifiedOnly && (
                <Chip active onClick={() => patch({ verifiedOnly: false })} icon={<X size={11} />}>
                  {t("explore.onlyVerified")}
                </Chip>
              )}
              {filters.dealsOnly && (
                <Chip active onClick={() => patch({ dealsOnly: false })} icon={<X size={11} />}>
                  {t("explore.sortDeals")}
                </Chip>
              )}
              {filters.districtId !== "all" && (
                <Chip active onClick={() => patch({ districtId: "all" })} icon={<X size={11} />}>
                  {DISTRICTS.find((d) => d.id === filters.districtId)?.name[locale]}
                </Chip>
              )}
              <button
                onClick={reset}
                className="shrink-0 rounded-full px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50"
              >
                {t("common.resetFilters")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- body ---------------- */}
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-4 lg:px-6">
        <div
          className={cn(
            "grid gap-4 pt-4",
            view === "split" && "xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.05fr)]",
            view === "list" && "xl:grid-cols-[280px_minmax(0,1fr)]",
            view === "map" && "xl:grid-cols-1",
          )}
        >
          {/* filters sidebar */}
          <aside className="hidden xl:block">
            <div className="card sticky top-40 max-h-[calc(100dvh-11rem)] overflow-y-auto p-5 scroll-thin">
              <FilterPanel filters={filters} onChange={patch} onReset={reset} resultCount={results.length} />
            </div>
          </aside>

          {/* results list */}
          {showList && (
            <div ref={listRef} className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-ink-600">
                  {t("explore.resultsCount", { count: localDigits(results.length, locale) })}
                </p>
                <div className="md:hidden">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-8 rounded-lg border border-ink-300 bg-white px-2 text-[11px] font-bold text-ink-800"
                    aria-label={t("common.sort")}
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {t(s.key)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {results.length === 0 ? (
                <EmptyState
                  icon={<MapPinOff size={28} />}
                  title={t("explore.noResultsTitle")}
                  body={t("explore.noResultsBody")}
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={reset}>
                        {t("common.resetFilters")}
                      </Button>
                      <Button size="sm" onClick={() => patch({ maxDistanceKm: 25 })}>
                        {t("explore.expandRadius")}
                      </Button>
                    </div>
                  }
                />
              ) : (
                <div className={cn("space-y-3", view === "split" && "2xl:grid 2xl:grid-cols-1 2xl:space-y-3")}>
                  {results.map((p) => (
                    <ProviderCard
                      key={p.id}
                      provider={p}
                      deals={deals}
                      userLocation={userLocation}
                      active={activeId === p.id}
                      onHover={(id) => id && setActiveId(id)}
                      onClick={() => selectProvider(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* map */}
          {showMap && (
            <div className="min-w-0">
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-ink-200 shadow-card",
                  view === "map" ? "h-[70vh]" : "h-[58vh] xl:sticky xl:top-40 xl:h-[calc(100dvh-11rem)]",
                )}
              >
                <ProvidersMap
                  providers={results}
                  deals={deals}
                  showDeals
                  userLocation={userLocation}
                  radiusKm={filters.maxDistanceKm}
                  activeId={activeId}
                  onActiveChange={setActiveId}
                  onReady={setMapApi}
                  fitToMarkers={false}
                />

                {/* map overlay: legend + recenter */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
                  <span className="pointer-events-auto rounded-lg border border-ink-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-ink-700 shadow-sm backdrop-blur">
                    {t("explore.radiusHint", { km: localDigits(filters.maxDistanceKm, locale) })}
                  </span>
                  <button
                    onClick={() => mapApi?.recenter()}
                    className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-ink-700 shadow-sm backdrop-blur hover:bg-white"
                  >
                    <Crosshair size={12} />
                    {t("explore.recenter")}
                  </button>
                </div>

                {/* map overlay: active provider mini list */}
                {view === "map" && results.length > 0 && (
                  <div className="pointer-events-auto absolute inset-x-2.5 bottom-2.5 max-h-56 overflow-y-auto rounded-2xl border border-ink-200 bg-white/95 p-1.5 shadow-pop backdrop-blur scroll-thin">
                    {results.slice(0, 8).map((p) => (
                      <ProviderMiniCard
                        key={p.id}
                        provider={p}
                        deals={deals}
                        userLocation={userLocation}
                        active={activeId === p.id}
                        onSelect={() => selectProvider(p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {activeProvider && (
                <div className="mt-3 xl:hidden">
                  <ProviderMiniCard
                    provider={activeProvider}
                    deals={deals}
                    userLocation={userLocation}
                    active
                    onSelect={() => selectProvider(activeProvider.id)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- mobile filter sheet ---------------- */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[9998] xl:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/45 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-fade-up flex-col rounded-t-3xl bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
                <Sparkles size={15} className="text-brand-600" />
                {t("misc.filterSheet")}
              </h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-500 hover:bg-ink-100"
                aria-label={t("common.close")}
              >
                <X size={16} />
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
              <FilterPanel filters={filters} onChange={patch} onReset={reset} compact />
            </div>
            <div className="flex items-center gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                {t("common.resetFilters")}
              </Button>
              <Button className="flex-[1.4]" onClick={() => setSheetOpen(false)}>
                {t("common.apply")} · {localDigits(results.length, locale)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-500">…</div>}>
      <ExploreInner />
    </Suspense>
  );
}

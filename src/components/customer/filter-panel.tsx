"use client";

import { Baby, Brush, Crown, Flower, Hand, Palette, Scissors, Sparkles, SprayCan, Waves, X } from "lucide-react";
import type { CategoryId, ServiceMode } from "@/types";
import { useI18n } from "@/i18n/provider";
import { DISTRICTS } from "@/lib/mock-data";
import { DEFAULT_FILTERS, type Filters } from "@/lib/queries";
import { formatMoney, localDigits } from "@/lib/format";
import { Checkbox, Select } from "@/components/ui/field";
import { Chip } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const CATEGORY_ICON: Record<CategoryId, React.ComponentType<{ size?: number; className?: string }>> = {
  haircut: Scissors,
  beard: SprayCan,
  color: Palette,
  facial: Sparkles,
  nails: Hand,
  makeup: Brush,
  bridal: Crown,
  kids: Baby,
  epilation: Flower,
  spa: Waves,
};

export function FilterPanel({
  filters,
  onChange,
  onReset,
  resultCount,
  className,
  compact = false,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset?: () => void;
  resultCount?: number;
  className?: string;
  compact?: boolean;
}) {
  const { t, locale } = useI18n();

  const toggleCategory = (id: CategoryId) => {
    const has = filters.categories.includes(id);
    onChange({
      categories: has
        ? filters.categories.filter((c) => c !== id)
        : [...filters.categories, id],
    });
  };

  const toggleMode = (m: ServiceMode) => {
    const current = filters.modes === "all" ? [] : filters.modes;
    const next = current.includes(m) ? current.filter((x) => x !== m) : [...current, m];
    onChange({ modes: next.length ? next : "all" });
  };

  const activeCount = countActive(filters);

  return (
    <div className={cn("space-y-6", className)}>
      {/* header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
          {t("common.filters")}
          {activeCount > 0 && (
            <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
              {localDigits(activeCount, locale)}
            </span>
          )}
        </h2>
        {onReset && activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-bold text-ink-500 transition-colors hover:text-red-600"
          >
            <X size={12} />
            {t("common.resetFilters")}
          </button>
        )}
      </div>

      {resultCount !== undefined && (
        <p className="-mt-4 rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-800">
          {t("explore.resultsCount", { count: localDigits(resultCount, locale) })}
        </p>
      )}

      {/* district */}
      <FilterGroup label={t("misc.districtLabel")}>
        <Select
          value={filters.districtId}
          onChange={(e) => onChange({ districtId: e.target.value })}
        >
          <option value="all">{t("misc.allDistricts")}</option>
          {DISTRICTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name[locale]}
            </option>
          ))}
        </Select>
      </FilterGroup>

      {/* mode */}
      <FilterGroup label={t("explore.filterMode")}>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filters.modes !== "all" && filters.modes.includes("salon")}
            onClick={() => toggleMode("salon")}
          >
            {t("explore.modeSalon")}
          </Chip>
          <Chip
            active={filters.modes !== "all" && filters.modes.includes("home")}
            onClick={() => toggleMode("home")}
          >
            {t("explore.modeHome")}
          </Chip>
        </div>
      </FilterGroup>

      {/* categories */}
      <FilterGroup label={t("explore.filterService")}>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_ICON) as CategoryId[]).map((id) => {
            const Icon = CATEGORY_ICON[id];
            const active = filters.categories.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleCategory(id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50",
                )}
              >
                <Icon size={13} className={active ? "" : "text-ink-400"} />
                {t(`cat.${id}` as TranslationKey)}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* price */}
      <FilterGroup
        label={t("explore.filterPrice")}
        value={`${t("common.to")} ${formatMoney(filters.maxPrice, locale)}`}
      >
        <RangeInput
          min={300_000}
          max={20_000_000}
          step={100_000}
          value={filters.maxPrice}
          onChange={(v) => onChange({ maxPrice: v })}
        />
      </FilterGroup>

      {/* rating */}
      <FilterGroup label={t("explore.filterRating")}>
        <div className="flex flex-wrap gap-1.5">
          {[0, 4, 4.5, 4.8].map((r) => (
            <Chip key={r} active={filters.minRating === r} onClick={() => onChange({ minRating: r })}>
              {r === 0 ? t("common.all") : `${localDigits(r.toFixed(1), locale)}+ ★`}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {/* distance */}
      <FilterGroup
        label={t("explore.filterDistance")}
        value={`${localDigits(filters.maxDistanceKm, locale)} ${t("common.km")}`}
      >
        <RangeInput
          min={1}
          max={25}
          step={1}
          value={filters.maxDistanceKm}
          onChange={(v) => onChange({ maxDistanceKm: v })}
        />
      </FilterGroup>

      {/* availability */}
      <FilterGroup label={t("explore.filterAvailability")}>
        <div className="space-y-2.5">
          <Checkbox
            checked={filters.availableToday}
            onChange={(v) => onChange({ availableToday: v })}
            label={t("explore.availableToday")}
          />
          <Checkbox
            checked={filters.availableTomorrow}
            onChange={(v) => onChange({ availableTomorrow: v })}
            label={t("explore.availableTomorrow")}
          />
          <Checkbox
            checked={filters.instantOnly}
            onChange={(v) => onChange({ instantOnly: v })}
            label={t("explore.instantRequests")}
          />
        </div>
      </FilterGroup>

      {/* trust & accessibility */}
      <FilterGroup label={t("footer.safety")}>
        <div className="space-y-2.5">
          <Checkbox
            checked={filters.verifiedOnly}
            onChange={(v) => onChange({ verifiedOnly: v })}
            label={t("explore.onlyVerified")}
          />
          <Checkbox
            checked={filters.seniorFriendly}
            onChange={(v) => onChange({ seniorFriendly: v })}
            label={t("explore.seniorFriendly")}
          />
          <Checkbox
            checked={filters.accessibilityTrained}
            onChange={(v) => onChange({ accessibilityTrained: v })}
            label={t("explore.accessibilityTrained")}
          />
          <Checkbox
            checked={filters.dealsOnly}
            onChange={(v) => onChange({ dealsOnly: v })}
            label={t("explore.sortDeals")}
          />
        </div>
      </FilterGroup>

      {!compact && onReset && (
        <button
          onClick={() => onReset()}
          className="w-full rounded-xl border border-ink-300 bg-white py-2.5 text-xs font-bold text-ink-700 transition-colors hover:bg-ink-50"
        >
          {t("common.resetFilters")}
        </button>
      )}

    </div>
  );
}

function FilterGroup({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-ink-800">{label}</h3>
        {value && <span className="tnum text-[11px] font-semibold text-brand-700">{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function RangeInput({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative py-1">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-ink-200">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="relative h-6 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-600"
      />
    </div>
  );
}

export function countActive(f: Filters): number {
  let n = 0;
  if (f.query.trim()) n += 1;
  if (f.categories.length) n += 1;
  if (f.modes !== "all") n += 1;
  if (f.maxPrice !== DEFAULT_FILTERS.maxPrice) n += 1;
  if (f.minRating !== 0) n += 1;
  if (f.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm) n += 1;
  if (f.availableToday) n += 1;
  if (f.availableTomorrow) n += 1;
  if (f.instantOnly) n += 1;
  if (f.verifiedOnly) n += 1;
  if (f.seniorFriendly) n += 1;
  if (f.accessibilityTrained) n += 1;
  if (f.districtId !== "all") n += 1;
  if (f.dealsOnly) n += 1;
  return n;
}

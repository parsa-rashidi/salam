"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDecimal, localDigits } from "@/lib/format";
import { useI18n } from "@/i18n/provider";

/**
 * Star rating. Uses a clipped overlay to render fractional stars
 * without needing half-star icon variants.
 */
export function Stars({
  value,
  size = 16,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const { locale, t } = useI18n();
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="relative inline-flex" aria-hidden="true" dir="ltr">
        <span className="flex gap-0.5 text-ink-300">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={size} strokeWidth={1.6} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-deal-400"
          style={{ width: `${pct}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={size}
              strokeWidth={1.6}
              className="shrink-0 fill-deal-400"
              style={{ width: size, height: size }}
            />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="tnum text-sm font-bold text-ink-900">
          {formatDecimal(value, locale, 1)}
        </span>
      )}
      <span className="sr-only">{t("a11y.starN", { n: localDigits(value.toFixed(1), locale) })}</span>
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} stars`}
          className="rounded-md p-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={size}
            strokeWidth={1.5}
            className={cn(
              n <= value ? "fill-deal-400 text-deal-400" : "text-ink-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}

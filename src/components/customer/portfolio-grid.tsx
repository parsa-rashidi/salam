"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import type { PortfolioItem } from "@/types";
import { useI18n } from "@/i18n/provider";
import { SmartImage } from "@/components/ui/smart-image";
import { localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PortfolioGrid({
  items,
  columns = 3,
  onRemove,
  className,
}: {
  items: PortfolioItem[];
  columns?: 2 | 3 | 4;
  onRemove?: (id: string) => void;
  className?: string;
}) {
  const { t, tr, locale } = useI18n();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const step = (delta: number) =>
    setLightbox((i) => (i === null ? null : (i + delta + items.length) % items.length));

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3", cols, className)}>
        {items.map((item, i) => (
          <figure
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-ink-200 bg-white"
          >
            <button
              onClick={() => setLightbox(i)}
              className="block w-full text-start"
              aria-label={tr(item.caption)}
            >
              <SmartImage
                src={item.image}
                alt={tr(item.caption)}
                className="aspect-square w-full"
                imgClassName="transition-transform duration-500 group-hover:scale-[1.06]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent p-3 pt-8">
                <span className="block truncate text-xs font-bold text-white">
                  {tr(item.caption)}
                </span>
              </span>
            </button>

            <span className="absolute top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-ink-700 backdrop-blur end-2.5">
              <Heart size={10} className="fill-red-500 text-red-500" />
              <span className="tnum">{localDigits(item.likes, locale)}</span>
            </span>

            {onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="absolute top-2.5 grid h-7 w-7 place-items-center rounded-full bg-ink-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100 start-2.5"
                aria-label={t("common.delete")}
              >
                <X size={13} />
              </button>
            )}
          </figure>
        ))}
      </div>

      {lightbox !== null && items[lightbox] && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm">
          <button
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setLightbox(null)}
            aria-label={t("common.close")}
          />
          <div className="relative w-full max-w-2xl animate-fade-up">
            <SmartImage
              src={items[lightbox].image}
              alt={tr(items[lightbox].caption)}
              className="w-full overflow-hidden rounded-2xl"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-white">{tr(items[lightbox].caption)}</p>
              <p className="tnum text-xs text-white/60">
                {localDigits(lightbox + 1, locale)} {t("common.of")} {localDigits(items.length, locale)}
              </p>
            </div>
          </div>

          <button
            onClick={() => step(-1)}
            className="absolute grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 start-4"
            aria-label={t("common.prev")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => step(1)}
            className="absolute grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 end-4"
            aria-label={t("common.next")}
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 end-4"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}

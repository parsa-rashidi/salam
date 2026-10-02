"use client";

import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export function PrototypeBanner() {
  const { t, locale } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-ink-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-1.5 sm:px-6 lg:px-8">
        <FlaskConical size={14} className="shrink-0 text-deal-300" />
        <p className="min-w-0 flex-1 truncate text-[11px] font-medium leading-relaxed sm:text-xs">
          {locale === "fa" ? t("common.prototypeBanner") : t("common.prototypeBanner")}
        </p>
        <span
          className={cn(
            "hidden shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 sm:block",
          )}
        >
          {t("common.prototypeNote")}
        </span>
        <button
          onClick={() => setDismissed(true)}
          aria-label={t("common.close")}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-900/25",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7.5-4.35-7.5-10A4.5 4.5 0 0 1 12 7.5 4.5 4.5 0 0 1 19.5 11c0 5.65-7.5 10-7.5 10Z" />
        <path d="M9.5 11.5h5" />
      </svg>
      <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-deal-400" />
    </span>
  );
}

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label={t("brand.name")}>
      <LogoMark size={compact ? 32 : 38} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-ink-950">
            {t("brand.name")}
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-ink-500">
            {t("brand.tagline")}
          </span>
        </span>
      )}
    </Link>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "brand"
  | "deal"
  | "neutral"
  | "success"
  | "warn"
  | "danger"
  | "info"
  | "violet";

const TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  deal: "bg-deal-50 text-deal-800 border-deal-200",
  neutral: "bg-ink-100 text-ink-700 border-ink-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
  violet: "bg-violet-50 text-violet-800 border-violet-200",
};

const SOLID: Record<BadgeTone, string> = {
  brand: "bg-brand-600 text-white border-brand-600",
  deal: "bg-deal-500 text-white border-deal-500",
  neutral: "bg-ink-900 text-white border-ink-900",
  success: "bg-emerald-600 text-white border-emerald-600",
  warn: "bg-amber-500 text-white border-amber-500",
  danger: "bg-red-600 text-white border-red-600",
  info: "bg-sky-600 text-white border-sky-600",
  violet: "bg-violet-600 text-white border-violet-600",
};

export function Badge({
  tone = "neutral",
  solid = false,
  icon,
  children,
  className,
  size = "md",
}: {
  tone?: BadgeTone;
  solid?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        solid ? SOLID[tone] : TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

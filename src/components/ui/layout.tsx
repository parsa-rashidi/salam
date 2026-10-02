"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Section({
  children,
  className,
  id,
  containerClassName,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20", className)}>
      <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "start" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <span className="mb-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-ink-200 bg-white", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-ink-600 sm:text-base">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-ink-500">
        {icon}
      </span>
      <h3 className="text-base font-bold text-ink-950 sm:text-lg">{title}</h3>
      {body && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{body}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "brand",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: { value: number; label?: string };
  icon?: ReactNode;
  tone?: "brand" | "deal" | "neutral" | "violet";
  className?: string;
}) {
  const toneMap = {
    brand: "bg-brand-50 text-brand-700",
    deal: "bg-deal-50 text-deal-700",
    neutral: "bg-ink-100 text-ink-700",
    violet: "bg-violet-50 text-violet-700",
  } as const;

  return (
    <div className={cn("card p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-ink-500 sm:text-sm">{label}</p>
        {icon && (
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneMap[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="tnum mt-2 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
        {value}
      </p>
      {delta && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold">
          <span className={cn(delta.value >= 0 ? "text-emerald-600" : "text-red-600")}>
            {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value)}%
          </span>
          {delta.label && <span className="text-ink-400">{delta.label}</span>}
        </p>
      )}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  icon,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-ink-300 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

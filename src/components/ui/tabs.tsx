"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  count?: number | string;
  icon?: ReactNode;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
  size = "md",
  variant = "underline",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
  variant?: "underline" | "pill";
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "scroll-thin no-scrollbar flex items-center gap-1 overflow-x-auto",
        variant === "underline" && "border-b border-ink-200",
        variant === "pill" && "rounded-xl bg-ink-100 p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap transition-colors",
              size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
              variant === "underline" &&
                (active
                  ? "text-brand-700"
                  : "text-ink-500 hover:text-ink-800"),
              variant === "pill" &&
                (active
                  ? "rounded-lg bg-white text-ink-950 shadow-sm"
                  : "rounded-lg text-ink-600 hover:text-ink-900"),
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "tnum rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active ? "bg-brand-600 text-white" : "bg-ink-200 text-ink-600",
                )}
              >
                {item.count}
              </span>
            )}
            {variant === "underline" && active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: { id: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl bg-ink-100 p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-1.5 rounded-lg font-semibold transition-all",
              size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
              active
                ? "bg-white text-ink-950 shadow-sm"
                : "text-ink-500 hover:text-ink-800",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

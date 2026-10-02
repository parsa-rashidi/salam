"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "deal" | "dark";
type Size = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm shadow-brand-900/10",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200",
  outline:
    "border border-ink-300 bg-white text-ink-900 hover:border-ink-400 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-950",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  deal: "bg-deal-500 text-white hover:bg-deal-600 active:bg-deal-700 shadow-sm shadow-deal-900/20",
  dark: "bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-800",
};

const SIZES: Record<Size, string> = {
  xs: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-7 text-base gap-2.5 rounded-xl",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
}

const BASE =
  "inline-flex items-center justify-center font-semibold transition-all duration-150 " +
  "disabled:opacity-45 disabled:pointer-events-none select-none whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  icon,
  iconPosition = "start",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {iconPosition === "start" && icon}
      {children}
      {iconPosition === "end" && icon}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  icon,
  iconPosition = "start",
  href,
  ...rest
}: CommonProps & { href: string } & Omit<
    React.ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {iconPosition === "start" && icon}
      {children}
      {iconPosition === "end" && icon}
    </Link>
  );
}

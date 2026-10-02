"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-semibold text-ink-800"
        >
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs leading-relaxed text-ink-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xl border border-ink-300 bg-white px-3.5 text-sm text-ink-950 " +
  "placeholder:text-ink-400 transition-colors " +
  "hover:border-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none " +
  "disabled:bg-ink-100 disabled:text-ink-400";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "h-11", className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "py-2.5 leading-relaxed", className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "h-11 appearance-none pe-9 bg-no-repeat", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239c9080' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "left 0.75rem center",
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand-600" : "bg-ink-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
            checked ? "start-[22px]" : "start-0.5",
          )}
        />
      </button>
      {(label || hint) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-semibold text-ink-900">{label}</span>}
          {hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{hint}</span>}
        </span>
      )}
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
          checked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 bg-white",
        )}
      >
        {checked && <Check size={13} strokeWidth={3.4} />}
      </button>
      <span className="text-sm text-ink-800">{label}</span>
    </label>
  );
}

/** Selectable card used for "salon vs at-home", "for me vs someone else", etc. */
export function ChoiceCard({
  selected,
  disabled,
  onClick,
  icon,
  title,
  body,
  trailing,
  className,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-start transition-all",
        selected
          ? "border-brand-600 bg-brand-50/70 shadow-sm"
          : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50",
        disabled && "cursor-not-allowed opacity-50 hover:border-ink-200 hover:bg-white",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            selected ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600",
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink-950">{title}</span>
        {body && <span className="mt-1 block text-xs leading-relaxed text-ink-600">{body}</span>}
      </span>
      {trailing}
      <span
        className={cn(
          "absolute top-3 grid h-5 w-5 place-items-center rounded-full border-2 transition-colors",
          "end-3",
          selected ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300",
        )}
      >
        {selected && <Check size={12} strokeWidth={3.4} />}
      </span>
    </button>
  );
}

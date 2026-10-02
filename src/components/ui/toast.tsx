"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/store/app-store";

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
};

const TONES = {
  success: "border-brand-300 bg-brand-50 text-brand-900",
  info: "border-sky-300 bg-sky-50 text-sky-900",
  warn: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-red-300 bg-red-50 text-red-900",
};

const ICON_TONES = {
  success: "text-brand-600",
  info: "text-sky-600",
  warn: "text-amber-600",
  error: "text-red-600",
};

export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[10000] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:top-4 sm:items-end">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.kind];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border px-4 py-3 shadow-pop",
              TONES[toast.kind],
            )}
          >
            <Icon size={19} className={cn("mt-0.5 shrink-0", ICON_TONES[toast.kind])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
              {toast.action && (
                <Link
                  href={toast.action.href}
                  className="mt-1 inline-block text-xs font-bold underline underline-offset-2"
                  onClick={() => dismissToast(toast.id)}
                >
                  {toast.action.label}
                </Link>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="close"
              className="-m-1 grid h-7 w-7 shrink-0 place-items-center rounded-full opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

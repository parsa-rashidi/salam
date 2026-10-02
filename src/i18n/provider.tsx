"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, fa, type TranslationKey } from "./dictionary";
import type { Locale } from "@/types";

const LOCALE_COOKIE = "salam_locale";
const SENIOR_COOKIE = "salam_senior";

interface PreferencesValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /** senior / high-readability mode */
  senior: boolean;
  setSenior: (v: boolean) => void;
  toggleSenior: () => void;
  /** pick the right string out of an L10n object */
  tr: (v: Record<Locale, string>) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function PreferencesProvider({
  children,
  initialLocale = "fa",
  initialSenior = false,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  initialSenior?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [senior, setSeniorState] = useState<boolean>(initialSenior);
  const [mounted, setMounted] = useState(false);

  // Adopt persisted values from the browser once mounted (cookie may be stale).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_COOKIE);
      if (stored === "fa" || stored === "en") setLocaleState(stored);
      const storedSenior = localStorage.getItem(SENIOR_COOKIE);
      if (storedSenior === "1") setSeniorState(true);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const dir: "rtl" | "ltr" = locale === "fa" ? "rtl" : "ltr";

  // Reflect preferences on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    root.classList.toggle("senior-mode", senior);
    root.dataset.senior = senior ? "on" : "off";
    try {
      localStorage.setItem(LOCALE_COOKIE, locale);
      localStorage.setItem(SENIOR_COOKIE, senior ? "1" : "0");
      document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
      document.cookie = `${SENIOR_COOKIE}=${senior ? 1 : 0};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* ignore */
    }
  }, [locale, dir, senior, mounted]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = useCallback(
    () => setLocaleState((prev) => (prev === "fa" ? "en" : "fa")),
    [],
  );
  const setSenior = useCallback((v: boolean) => setSeniorState(v), []);
  const toggleSenior = useCallback(() => setSeniorState((v) => !v), []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const dict = dictionaries[locale];
      const raw = dict[key] ?? fa[key] ?? key;
      return interpolate(raw, params);
    },
    [locale],
  );

  const tr = useCallback(
    (v?: Record<Locale, string>) => v?.[locale] ?? v?.fa ?? "",
    [locale],
  );

  const value = useMemo<PreferencesValue>(
    () => ({ locale, dir, setLocale, toggleLocale, t, senior, setSenior, toggleSenior, tr }),
    [locale, dir, setLocale, toggleLocale, t, senior, setSenior, toggleSenior, tr],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}

/** Convenience alias used across the UI. */
export function useI18n() {
  return usePreferences();
}

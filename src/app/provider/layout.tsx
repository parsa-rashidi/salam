"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronLeft,
  Flame,
  Gauge,
  Images,
  Inbox,
  Languages,
  LayoutGrid,
  Menu,
  MessageSquareQuote,
  Scissors,
  Settings,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { CURRENT_PROVIDER } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/field";
import { Stars } from "@/components/ui/rating";
import { localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const NAV: { href: string; key: TranslationKey; icon: React.ComponentType<{ size?: number }> }[] = [
  { href: "/provider", key: "pp.dashboard", icon: Gauge },
  { href: "/provider/requests", key: "pp.requests", icon: Inbox },
  { href: "/provider/calendar", key: "pp.calendar", icon: CalendarDays },
  { href: "/provider/services", key: "pp.services", icon: Scissors },
  { href: "/provider/deals", key: "pp.deals", icon: Flame },
  { href: "/provider/portfolio", key: "pp.portfolio", icon: Images },
  { href: "/provider/reviews", key: "pp.reviews", icon: MessageSquareQuote },
  { href: "/provider/customers", key: "pp.customers", icon: Users },
  { href: "/provider/settings", key: "pp.settings", icon: Settings },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, tr, locale, toggleLocale, senior, toggleSenior } = useI18n();
  const { settings, updateSettings, requests, notifications } = useStore();
  const [navOpen, setNavOpen] = useState(false);

  const current =
    NAV.find((n) => (n.href === "/provider" ? pathname === "/provider" : pathname.startsWith(n.href))) ??
    NAV[0];
  const pending = requests.filter((r) => r.status === "requested").length;
  const unread = notifications.filter((n) => !n.read).length;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
          <Scissors size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-white">{t("nav.providerPanel")}</p>
          <p className="truncate text-[11px] text-white/55">{t("brand.name")}</p>
        </div>
        <button
          onClick={() => setNavOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
          aria-label={t("common.close")}
        >
          <X size={16} />
        </button>
      </div>

      {/* provider identity */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={tr(CURRENT_PROVIDER.name)} accent={CURRENT_PROVIDER.accent} size={42} ring />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{tr(CURRENT_PROVIDER.name)}</p>
            <p className="mt-0.5 flex items-center gap-1.5">
              <Stars value={CURRENT_PROVIDER.rating} size={10} />
              <span className="tnum text-[11px] font-bold text-white/70">
                {localDigits(CURRENT_PROVIDER.rating.toFixed(1), locale)}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="rounded-xl bg-white/10 p-3">
            <Toggle
              checked={settings.online}
              onChange={(v) => updateSettings({ online: v })}
              label={
                <span className={cn("text-xs font-bold", settings.online ? "text-white" : "text-white/60")}>
                  {settings.online ? t("pp.online") : t("pp.offline")}
                </span>
              }
            />
          </div>
        </div>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto p-2.5">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/provider"
                ? pathname === "/provider"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-white text-brand-800 shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon size={16} />
                  <span className="min-w-0 flex-1 truncate">{t(item.key)}</span>
                  {item.href === "/provider/requests" && pending > 0 && (
                    <span
                      className={cn(
                        "tnum grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold",
                        active ? "bg-deal-500 text-white" : "bg-deal-500 text-white",
                      )}
                    >
                      {localDigits(pending, locale)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Link
          href={`/providers/${CURRENT_PROVIDER.id}`}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15"
        >
          <ArrowUpRight size={14} />
          {t("pp.viewPublicProfile")}
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/55 transition-colors hover:text-white"
        >
          <LayoutGrid size={14} />
          {t("misc.backHome")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-ink-100">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-ink-950 lg:block xl:w-72">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-[9997] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setNavOpen(false)} />
          <aside className="absolute inset-y-0 w-72 max-w-[85vw] animate-fade-up bg-ink-950 start-0">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-ink-200 bg-white/95 px-3 backdrop-blur sm:px-5">
          <button
            onClick={() => setNavOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-300 text-ink-700 lg:hidden"
            aria-label={t("a11y.openMenu")}
          >
            <Menu size={16} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-extrabold text-ink-950 sm:text-base">
              {t(current.key)}
            </h1>
            <p className="truncate text-[11px] text-ink-500">
              {t("pp.welcome", { name: tr(CURRENT_PROVIDER.name) })}
            </p>
          </div>

          <span className="hidden items-center gap-1.5 sm:flex">
            <Badge tone={settings.online ? "success" : "neutral"} size="md">
              <span className={cn("h-1.5 w-1.5 rounded-full", settings.online ? "bg-emerald-500 animate-pulse-ring" : "bg-ink-400")} />
              {settings.online ? t("common.active") : t("common.inactive")}
            </Badge>
          </span>

          <button
            onClick={toggleSenior}
            title={t("a11y.seniorMode")}
            aria-pressed={senior}
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
              senior ? "border-deal-300 bg-deal-50 text-deal-700" : "border-ink-300 text-ink-600 hover:bg-ink-50",
            )}
          >
            <Sun size={15} />
          </button>

          <button
            onClick={toggleLocale}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-ink-300 px-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
            title={t("a11y.language")}
          >
            <Languages size={14} />
            {locale === "fa" ? "EN" : "فا"}
          </button>

          <Link
            href="/bookings"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-300 text-ink-600 hover:bg-ink-50"
            aria-label={t("nav.notifications")}
          >
            <Bell size={15} />
            {unread > 0 && (
              <span className="tnum absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-deal-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {localDigits(unread, locale)}
              </span>
            )}
          </Link>

          <Link href="/provider/deals/new" className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-deal-500 px-3 py-2 text-xs font-bold text-white hover:bg-deal-600 md:flex">
            <Zap size={14} />
            {t("pp.deal.createNew")}
            <ChevronLeft size={13} className={cn(locale === "fa" ? "rotate-180" : "")} />
          </Link>
        </header>

        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

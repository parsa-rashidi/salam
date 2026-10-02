"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  Ban,
  Bell,
  Building2,
  CalendarCheck2,
  Flag,
  Gauge,
  Home,
  Languages,
  LayoutGrid,
  Megaphone,
  Menu,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Tags,
  TriangleAlert,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

type NavItem = {
  href: string;
  key: TranslationKey;
  icon: React.ComponentType<{ size?: number }>;
  badge?: "pending" | "reports";
};

const GROUPS: { label: TranslationKey; items: NavItem[] }[] = [
  {
    label: "ad.dashboard",
    items: [{ href: "/admin", key: "ad.dashboard", icon: Gauge }],
  },
  {
    label: "misc.operations",
    items: [
      { href: "/admin/providers", key: "ad.pending", icon: BadgeCheck, badge: "pending" },
      { href: "/admin/bookings", key: "ad.bookings", icon: CalendarCheck2 },
      { href: "/admin/reports", key: "ad.reports", icon: Flag, badge: "reports" },
      { href: "/admin/content", key: "ad.content", icon: ShieldCheck },
    ],
  },
  {
    label: "misc.people",
    items: [
      { href: "/admin/users", key: "ad.users", icon: Users },
      { href: "/admin/blocked", key: "ad.blocked", icon: Ban },
    ],
  },
  {
    label: "misc.catalog",
    items: [
      { href: "/admin/categories", key: "ad.categories", icon: Tags },
      { href: "/admin/cities", key: "ad.cities", icon: Building2 },
      { href: "/admin/deals", key: "ad.deals", icon: Zap },
    ],
  },
  {
    label: "misc.business",
    items: [
      { href: "/admin/revenue", key: "ad.revenue", icon: Wallet },
      { href: "/admin/notifications", key: "ad.notifications", icon: Megaphone },
      { href: "/admin/settings", key: "ad.settings", icon: Settings },
    ],
  },
];

const FLAT = GROUPS.flatMap((g) => g.items);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, locale, toggleLocale, senior, toggleSenior } = useI18n();
  const { pending, notifications } = useStore();
  const [navOpen, setNavOpen] = useState(false);

  const current =
    FLAT.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href))) ??
    FLAT[0];
  const pendingCount = pending.filter((p) => p.status === "pending").length;
  const openReports = notifications.filter((n) => n.kind === "system" && !n.read).length;

  const badgeFor = (item: NavItem) =>
    item.badge === "pending" ? pendingCount : item.badge === "reports" ? openReports : 0;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
          <ShieldCheck size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-white">{t("ad.title")}</p>
          <p className="truncate text-[11px] text-white/55">{t("ad.subtitle")}</p>
        </div>
        <button
          onClick={() => setNavOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
          aria-label={t("common.close")}
        >
          <X size={16} />
        </button>
      </div>

      {/* admin identity */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={locale === "fa" ? "مدیر سامانه" : "Platform admin"}
            accent="#4f46e5"
            size={42}
            ring
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {locale === "fa" ? "نگار رستگار" : "Negar Rastegar"}
            </p>
            <p className="truncate text-[11px] text-white/55">{t("ad.users.roleAdmin")}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="tnum flex flex-1 items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-[11px] text-white/70">
            {t("ad.statPending")}
            <b className="font-black text-deal-300">{localDigits(pendingCount, locale)}</b>
          </span>
          <span className="tnum flex flex-1 items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-[11px] text-white/70">
            {t("ad.statReports")}
            <b className="font-black text-red-300">{localDigits(openReports, locale)}</b>
          </span>
        </div>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto p-2.5">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-3 pb-1.5 text-[10px] font-extrabold tracking-wide text-white/35">
              {t(group.label)}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const count = badgeFor(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                        active
                          ? "bg-white text-indigo-800 shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon size={16} />
                      <span className="min-w-0 flex-1 truncate">{t(item.key)}</span>
                      {count > 0 && (
                        <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-deal-500 px-1 text-[10px] font-bold text-white">
                          {localDigits(count, locale)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Link
          href="/provider"
          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15"
        >
          <Store size={14} />
          {t("nav.providerPanel")}
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
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-[#1e1b34] lg:block xl:w-72">
        {sidebar}
      </aside>

      {navOpen && (
        <div className="fixed inset-0 z-[9997] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <aside className="absolute inset-y-0 w-72 max-w-[85vw] animate-fade-up bg-[#1e1b34] start-0">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
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
            <p className="truncate text-[11px] text-ink-500">{t("ad.subtitle")}</p>
          </div>

          <span className="hidden items-center gap-1.5 md:flex">
            <Badge tone="violet" size="md" icon={<TriangleAlert size={12} />}>
              {locale === "fa" ? "محیط نمونه" : "Demo environment"}
            </Badge>
          </span>

          <button
            onClick={toggleSenior}
            title={t("a11y.seniorMode")}
            aria-pressed={senior}
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors",
              senior
                ? "border-deal-300 bg-deal-50 text-deal-700"
                : "border-ink-300 text-ink-600 hover:bg-ink-50",
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
            href="/admin/notifications"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-300 text-ink-600 hover:bg-ink-50"
            aria-label={t("nav.notifications")}
          >
            <Bell size={15} />
            {openReports > 0 && (
              <span className="tnum absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-deal-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {localDigits(openReports, locale)}
              </span>
            )}
          </Link>

          <Link
            href="/"
            className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 md:flex"
          >
            <Home size={14} />
            {t("misc.backHome")}
          </Link>
        </header>

        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

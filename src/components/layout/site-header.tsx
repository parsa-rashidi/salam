"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Heart,
  LogOut,
  MapPinned,
  Menu,
  Percent,
  Scissors,
  Settings2,
  Shield,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Logo } from "./logo";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";

const MAIN_LINKS = [
  { href: "/explore", key: "nav.explore", icon: MapPinned },
  { href: "/deals", key: "nav.deals", icon: Percent },
  { href: "/bookings", key: "nav.bookings", icon: Zap },
  { href: "/favorites", key: "nav.favorites", icon: Heart },
] as const;

const PANEL_LINKS = [
  { href: "/provider", key: "nav.providerPanel", icon: Scissors },
  { href: "/admin", key: "nav.adminPanel", icon: Shield },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { t, locale, toggleLocale, senior, toggleSenior } = useI18n();
  const { notifications, favorites, bookings, user, signOut, signedIn } = useStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide the header inside the provider/admin panels — they have their own chrome.
  const isPanel = pathname.startsWith("/provider") || pathname.startsWith("/admin");
  if (isPanel) return null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "glass border-ink-200/80 shadow-[0_1px_20px_-8px_rgba(42,37,33,0.18)]"
            : "border-transparent bg-ink-50",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Logo />

          <nav className="mx-2 hidden items-center gap-0.5 lg:flex">
            {MAIN_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-brand-50 text-brand-800"
                      : "text-ink-600 hover:bg-ink-100 hover:text-ink-950",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon size={15} />
                    {t(l.key)}
                  </span>
                  {l.href === "/bookings" && bookings.filter((b) => b.status === "confirmed").length > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-deal-500 ring-2 ring-ink-50" />
                  )}
                  {l.href === "/favorites" && favorites.length > 0 && (
                    <span className="tnum absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-ink-50">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* senior mode */}
          <button
            onClick={toggleSenior}
            title={t("a11y.seniorMode")}
            aria-pressed={senior}
            className={cn(
              "hidden h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-colors sm:flex",
              senior
                ? "border-deal-300 bg-deal-50 text-deal-800"
                : "border-ink-300 bg-white text-ink-600 hover:border-ink-400",
            )}
          >
            <Sun size={14} />
            {t("a11y.seniorMode")}
          </button>

          {/* language */}
          <button
            onClick={toggleLocale}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-2.5 text-xs font-bold text-ink-700 transition-colors hover:border-ink-400"
            title={t("a11y.language")}
          >
            <span className="grid h-4 w-5 place-items-center overflow-hidden rounded-[3px] bg-ink-100 text-[9px]">
              {locale === "fa" ? "🇮🇷" : "🇬🇧"}
            </span>
            {locale === "fa" ? "EN" : "فا"}
          </button>

          {/* notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setMenuOpen(false);
              }}
              aria-label={t("nav.notifications")}
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-ink-300 bg-white text-ink-600 transition-colors hover:border-ink-400 hover:text-ink-900"
            >
              <Bell size={16} />
              {unread > 0 && (
                <span className="tnum absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-deal-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute end-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] animate-fade-up overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-pop">
                  <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
                    <span className="text-sm font-bold text-ink-950">{t("notif.title")}</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-ink-400 hover:text-ink-700"
                      aria-label={t("common.close")}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="scroll-thin max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "flex gap-3 border-b border-ink-100 px-4 py-3 last:border-0",
                          !n.read && "bg-brand-50/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                            n.kind === "deal"
                              ? "bg-deal-500"
                              : n.kind === "booking"
                                ? "bg-brand-500"
                                : n.kind === "review"
                                  ? "bg-violet-500"
                                  : "bg-ink-400",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink-900">
                            {n.title[locale]}
                            {!n.read && (
                              <span className="ms-2 text-[10px] font-semibold text-brand-600">
                                {t("common.new")}
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-600">
                            {n.body[locale]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* account */}
          <div className="relative">
            <button
              onClick={() => {
                setMenuOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white py-1 pe-2 ps-1 transition-colors hover:border-ink-300"
            >
              <Avatar name={user.name} size={28} accent="#0ba68b" />
              <span className="hidden text-sm font-semibold text-ink-800 sm:block">
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown size={14} className="text-ink-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute end-0 top-11 z-50 w-64 animate-fade-up overflow-hidden rounded-2xl border border-ink-200 bg-white p-1.5 shadow-pop">
                  <div className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2.5">
                    <Avatar name={user.name} size={38} accent="#0ba68b" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-950">{user.name}</p>
                      <p className="tnum truncate text-xs text-ink-500">{user.phone}</p>
                    </div>
                  </div>
                  <div className="my-1.5 h-px bg-ink-200" />
                  <MenuLink href="/bookings" icon={<Zap size={15} />} onClick={() => setMenuOpen(false)}>
                    {t("nav.bookings")}
                  </MenuLink>
                  <MenuLink href="/favorites" icon={<Heart size={15} />} onClick={() => setMenuOpen(false)}>
                    {t("nav.favorites")}
                  </MenuLink>
                  <MenuLink href="/accessibility" icon={<Sun size={15} />} onClick={() => setMenuOpen(false)}>
                    {t("a11y.seniorTitle")}
                  </MenuLink>
                  <div className="my-1.5 h-px bg-ink-200" />
                  <MenuLink href="/provider" icon={<Scissors size={15} />} onClick={() => setMenuOpen(false)}>
                    {t("nav.providerPanel")}
                  </MenuLink>
                  <MenuLink href="/admin" icon={<Shield size={15} />} onClick={() => setMenuOpen(false)}>
                    {t("nav.adminPanel")}
                  </MenuLink>
                  <div className="my-1.5 h-px bg-ink-200" />
                  <MenuLink
                    href="/login"
                    icon={<LogOut size={15} />}
                    danger
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                  >
                    {signedIn ? t("auth.logout") : t("nav.login")}
                  </MenuLink>
                </div>
              </>
            )}
          </div>

          {/* mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-300 bg-white text-ink-700 lg:hidden"
            aria-label={mobileOpen ? t("a11y.closeMenu") : t("a11y.openMenu")}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="animate-fade-up border-t border-ink-200 bg-white px-4 py-4 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              {MAIN_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-sm font-semibold text-ink-800"
                  >
                    <Icon size={16} className="text-brand-600" />
                    {t(l.key)}
                  </Link>
                );
              })}
              {PANEL_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-sm font-semibold text-ink-800"
                  >
                    <Icon size={16} className="text-ink-500" />
                    {t(l.key)}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant={senior ? "secondary" : "outline"}
                size="sm"
                onClick={toggleSenior}
                className="flex-1"
                icon={<Sun size={15} />}
              >
                {t("a11y.seniorMode")}
              </Button>
              <ButtonLink
                href="/accessibility"
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<Settings2 size={15} />}
              >
                {t("a11y.seniorTitle")}
              </ButtonLink>
            </div>
          </div>
        )}
      </header>
      <div className="lg:hidden" style={{ height: 0 }} />
    </>
  );
}

function MenuLink({
  href,
  icon,
  children,
  danger,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
        danger ? "text-red-600 hover:bg-red-50" : "text-ink-700 hover:bg-ink-100 hover:text-ink-950",
      )}
    >
      <span className={danger ? "text-red-500" : "text-ink-400"}>{icon}</span>
      {children}
    </Link>
  );
}

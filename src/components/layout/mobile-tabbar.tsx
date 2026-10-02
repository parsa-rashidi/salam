"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Heart, Home, MapPinned, Percent } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";

const TABS = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/explore", key: "nav.explore", icon: MapPinned },
  { href: "/deals", key: "nav.deals", icon: Percent },
  { href: "/bookings", key: "nav.bookings", icon: CalendarCheck },
  { href: "/favorites", key: "nav.favorites", icon: Heart },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { bookings } = useStore();

  if (pathname.startsWith("/provider") || pathname.startsWith("/admin")) return null;

  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={t("nav.menu")}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href + "/"));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                active ? "text-brand-700" : "text-ink-500",
              )}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
                {tab.href === "/bookings" && upcoming > 0 && (
                  <span className="tnum absolute -top-1.5 -end-2 grid h-4 min-w-4 place-items-center rounded-full bg-deal-500 px-1 text-[9px] font-bold text-white">
                    {upcoming}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate px-1">{t(tab.key)}</span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

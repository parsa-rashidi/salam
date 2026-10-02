"use client";

import { useState } from "react";
import {
  Ban,
  CalendarCheck2,
  Check,
  Download,
  Phone,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { ADMIN_USERS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { formatDate, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

type RoleFilter = "all" | "customer" | "provider" | "admin";

export default function AdminUsersPage() {
  const { t, tr, locale } = useI18n();
  const { blockedUsers, toggleBlockUser, toast } = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const rows = ADMIN_USERS.map((u) => ({
    ...u,
    role: u.role as "customer" | "provider" | "admin",
    blocked: blockedUsers.includes(u.id),
  }));

  const list = rows
    .filter((u) => (role === "all" ? true : u.role === role))
    .filter((u) => (onlyBlocked ? u.blocked : true))
    .filter((u) =>
      q.trim()
        ? tr(u.name).toLowerCase().includes(q.trim().toLowerCase()) || u.phone.includes(q.trim())
        : true,
    );

  const target = rows.find((u) => u.id === confirmId) ?? null;
  const counts = {
    customer: rows.filter((u) => u.role === "customer").length,
    provider: rows.filter((u) => u.role === "provider").length,
    blocked: rows.filter((u) => u.blocked).length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Users size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.users.title")}</h1>
          <p className="text-xs text-ink-500">
            {localDigits(rows.length, locale)} {t("ad.users.title")} · {t("ad.statUsers")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral" size="md" icon={<UserRound size={12} />}>
            {localDigits(counts.customer, locale)} {t("ad.users.roleCustomer")}
          </Badge>
          <Badge tone="brand" size="md" icon={<Store size={12} />}>
            {localDigits(counts.provider, locale)} {t("ad.users.roleProvider")}
          </Badge>
          <Badge tone="danger" size="md" icon={<Ban size={12} />}>
            {localDigits(counts.blocked, locale)} {t("ad.users.blocked")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => toast(locale === "fa" ? "فایل کاربران ساخته شد (نمونه)." : "User export generated (demo).", "info")}
          >
            {t("ad.bk.export")}
          </Button>
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("ad.users.search")}
            className="h-10 ps-9"
          />
        </div>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as RoleFilter)}
          className="h-10 w-auto min-w-[9rem]"
        >
          <option value="all">{t("ad.nt.all")}</option>
          <option value="customer">{t("ad.users.roleCustomer")}</option>
          <option value="provider">{t("ad.users.roleProvider")}</option>
          <option value="admin">{t("ad.users.roleAdmin")}</option>
        </Select>
        <button
          onClick={() => setOnlyBlocked((v) => !v)}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors",
            onlyBlocked
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-ink-300 bg-white text-ink-600 hover:bg-ink-50",
          )}
        >
          <Ban size={13} />
          {t("ad.blocked")}
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title={t("common.noResults")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-[11px] font-bold text-ink-500">
                  <th className="px-4 py-3 text-start">{t("ad.users.title")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.users.role")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.users.joined")}</th>
                  <th className="px-4 py-3 text-start">{t("ad.users.bookings")}</th>
                  <th className="px-4 py-3 text-start">{t("common.status")}</th>
                  <th className="px-4 py-3 text-start">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((u) => (
                  <tr key={u.id} className={cn("transition-colors hover:bg-brand-50/30", u.blocked && "bg-red-50/40")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={tr(u.name)} accent={u.accent} size={34} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-ink-950">{tr(u.name)}</p>
                          <p className="tnum mt-0.5 flex items-center gap-1 text-[10px] text-ink-500" dir="ltr">
                            <Phone size={9} />
                            {u.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={u.role === "provider" ? "brand" : u.role === "admin" ? "violet" : "neutral"}
                        size="sm"
                        icon={u.role === "provider" ? <Store size={10} /> : u.role === "admin" ? <ShieldCheck size={10} /> : <UserRound size={10} />}
                      >
                        {t(`ad.users.role${u.role === "provider" ? "Provider" : u.role === "admin" ? "Admin" : "Customer"}` as TranslationKey)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="tnum text-[11px] font-semibold text-ink-800">{formatDate(u.joined, locale)}</p>
                      <p className="text-[10px] text-ink-400">{formatRelative(u.joined, locale)}</p>
                    </td>
                    <td className="tnum px-4 py-3 text-xs font-extrabold text-ink-900">
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck2 size={12} className="text-ink-400" />
                        {localDigits(u.bookings, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.blocked ? (
                        <Badge tone="danger" size="sm" icon={<Ban size={10} />}>{t("ad.users.blocked")}</Badge>
                      ) : (
                        <Badge tone="success" size="sm" icon={<Check size={10} />}>{t("common.active")}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {u.blocked ? (
                          <Button
                            size="xs"
                            variant="outline"
                            icon={<Check size={12} />}
                            onClick={() => {
                              toggleBlockUser(u.id);
                              toast(t("ad.bl.unblock"), "success");
                            }}
                          >
                            {t("ad.users.unblock")}
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Ban size={12} />}
                            onClick={() => setConfirmId(u.id)}
                          >
                            {t("ad.users.block")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!target}
        onClose={() => setConfirmId(null)}
        title={t("ad.users.blockConfirm")}
        body={target ? `${t("ad.users.blockConfirmBody")} — ${tr(target.name)}` : undefined}
        confirmLabel={t("ad.users.block")}
        tone="danger"
        onConfirm={() => {
          if (target) toggleBlockUser(target.id);
          toast(t("ad.users.blocked"), "warn");
        }}
      />
    </div>
  );
}

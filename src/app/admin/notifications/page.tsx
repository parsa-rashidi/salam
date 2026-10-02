"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  Building2,
  CalendarClock,
  Check,
  Megaphone,
  Send,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { ADMIN_CITIES } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/field";
import { formatClock, formatDate, formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

type Audience = "all" | "customers" | "providers";

export default function AdminNotificationsPage() {
  const { t, tr, locale } = useI18n();
  const { notifications, markAllNotificationsRead, toast } = useStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [city, setCity] = useState("all");
  const [schedule, setSchedule] = useState("now");
  const [dealAlerts, setDealAlerts] = useState(true);
  const [sent, setSent] = useState<{ id: string; title: string; at: string; audience: Audience; city: string }[]>([]);

  const unread = notifications.filter((n) => !n.read).length;
  const audienceCount =
    audience === "all" ? 24_870 : audience === "customers" ? 23_216 : 1_654;
  const cityCount = city === "all" ? audienceCount : Math.round(audienceCount * 0.74);

  const KIND_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
    booking: CalendarClock,
    deal: Megaphone,
    system: Bell,
    review: Users,
  };

  const send = () => {
    const at = new Date();
    setSent((prev) => [
      { id: `n${Date.now()}`, title, at: at.toISOString(), audience, city },
      ...prev,
    ]);
    toast(
      locale === "fa"
        ? `اعلان برای ${localDigits(cityCount, locale)} کاربر ارسال شد.`
        : `Notification sent to ${localDigits(cityCount, locale)} users.`,
      "success",
    );
    setTitle("");
    setBody("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
          <Megaphone size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.nt.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.nt.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="violet" size="md" icon={<BellRing size={12} />}>
            {localDigits(unread, locale)} {t("notif.unread")}
          </Badge>
          <Button variant="outline" size="sm" icon={<Check size={14} />} onClick={markAllNotificationsRead}>
            {t("notif.markAllRead")}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* composer */}
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
            <Send size={15} className="text-violet-600" />
            {locale === "fa" ? "ارسال اعلان جدید" : "Send a new notification"}
          </h2>

          <div className="mt-4 space-y-4">
            <Field label={t("ad.nt.ntTitle")} required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={locale === "fa" ? "مثلاً: تخفیف‌های ویژهٔ آخر هفته" : "e.g. Weekend flash deals"} />
            </Field>

            <Field label={t("ad.nt.ntBody")} hint={`${localDigits(body.length, locale)} / 240`}>
              <Textarea rows={4} maxLength={240} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>

            <div>
              <p className="mb-2 text-xs font-bold text-ink-800">{t("ad.nt.audience")}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: "all", label: t("ad.nt.all"), icon: Users, count: 24_870 },
                    { id: "customers", label: t("ad.nt.customers"), icon: UserRound, count: 23_216 },
                    { id: "providers", label: t("ad.nt.providers"), icon: Store, count: 1_654 },
                  ] as const
                ).map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setAudience(a.id)}
                      className={cn(
                        "rounded-2xl border-2 p-3 text-start transition-all",
                        audience === a.id
                          ? "border-violet-500 bg-violet-50 shadow-sm"
                          : "border-ink-200 bg-white hover:border-violet-300",
                      )}
                    >
                      <Icon size={16} className={audience === a.id ? "text-violet-700" : "text-ink-400"} />
                      <span className="mt-1.5 block text-xs font-extrabold text-ink-950">{a.label}</span>
                      <span className="tnum block text-[10px] text-ink-500">
                        {localDigits(formatCompactNumber(a.count), locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("ad.nt.byCity")}>
                <Select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="all">{t("ad.nt.all")}</option>
                  {ADMIN_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {tr(c.name)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("ad.nt.schedule")}>
                <Select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                  <option value="now">{locale === "fa" ? "همین حالا" : "Right now"}</option>
                  <option value="1h">{locale === "fa" ? "یک ساعت دیگر" : "In one hour"}</option>
                  <option value="evening">{locale === "fa" ? "امشب ساعت ۲۰:۰۰" : "Tonight at 20:00"}</option>
                  <option value="tomorrow">{locale === "fa" ? "فردا ساعت ۹:۰۰" : "Tomorrow at 09:00"}</option>
                </Select>
              </Field>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
              <Toggle
                checked={dealAlerts}
                onChange={setDealAlerts}
                label={<span className="text-xs font-bold">{locale === "fa" ? "اعلان تخفیف‌های فوری محله" : "Neighbourhood flash-deal alerts"}</span>}
                hint={locale === "fa" ? "کاربرانی که برای محلهٔ خود opt-in کرده‌اند." : "Only users who opted in for their district."}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-violet-800">
                  {locale === "fa" ? "گیرندگان" : "Recipients"}
                </p>
                <p className="tnum text-lg font-black text-violet-900">
                  {localDigits(cityCount, locale)}
                </p>
              </div>
              <Button variant="deal" size="md" disabled={!title.trim() || !body.trim()} icon={<Send size={15} />} onClick={send}>
                {t("ad.nt.send")}
              </Button>
            </div>
          </div>
        </section>

        {/* lists */}
        <div className="space-y-5">
          <section className="card overflow-hidden">
            <header className="flex items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <Send size={15} className="text-violet-600" />
              <h2 className="text-sm font-extrabold text-ink-950">{t("ad.nt.sent")}</h2>
            </header>
            {sent.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-ink-500">
                {locale === "fa" ? "هنوز اعلانی در این نشست ارسال نشده است." : "No notification sent in this session yet."}
              </p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {sent.map((s) => (
                  <li key={s.id} className="px-4 py-3">
                    <p className="truncate text-xs font-bold text-ink-950">{s.title}</p>
                    <p className="tnum mt-1 flex flex-wrap items-center gap-x-2.5 text-[10px] text-ink-500">
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {s.audience === "all" ? t("ad.nt.all") : s.audience === "customers" ? t("ad.nt.customers") : t("ad.nt.providers")}
                      </span>
                      {s.city !== "all" && (
                        <span className="flex items-center gap-1">
                          <Building2 size={10} />
                          {tr(ADMIN_CITIES.find((c) => c.id === s.city)?.name ?? { fa: "", en: "" })}
                        </span>
                      )}
                      <span>{formatClock(hhmm(s.at), locale)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card overflow-hidden">
            <header className="flex items-center gap-2.5 border-b border-ink-200 bg-ink-50 px-4 py-3">
              <Bell size={15} className="text-brand-600" />
              <h2 className="text-sm font-extrabold text-ink-950">{t("nav.notifications")}</h2>
              <span className="tnum ms-auto text-[11px] font-bold text-ink-500">
                {localDigits(notifications.length, locale)}
              </span>
            </header>
            <ul className="divide-y divide-ink-100">
              {notifications.map((n) => {
                const Icon = KIND_ICON[n.kind] ?? Bell;
                return (
                  <li key={n.id} className={cn("flex items-start gap-3 px-4 py-3", !n.read && "bg-brand-50/40")}>
                    <span
                      className={cn(
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                        n.read ? "bg-ink-100 text-ink-500" : "bg-brand-100 text-brand-700",
                      )}
                    >
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("truncate text-xs", n.read ? "font-semibold text-ink-700" : "font-extrabold text-ink-950")}>
                          {tr(n.title)}
                        </p>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-deal-500" />}
                        <Badge tone="neutral" size="sm">{t(`notif.${n.kind}` as TranslationKey)}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-600">{tr(n.body)}</p>
                      <p className="tnum mt-1.5 text-[10px] text-ink-400">
                        {formatDate(n.at, locale)} · {formatRelative(n.at, locale)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function hhmm(isoString: string) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatCompactNumber(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

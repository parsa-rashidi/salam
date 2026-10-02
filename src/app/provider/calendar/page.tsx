"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Home,
  Info,
  Lock,
  Plus,
  Sparkles,
  Store,
  Unlock,
  Wand2,
} from "lucide-react";
import type { Slot } from "@/types";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/layout";
import {
  buildDayOptions,
  formatClock,
  formatDateShort,
  localDigits,
  weekDayLabels,
} from "@/lib/format";
import { cn } from "@/lib/cn";

type View = "week" | "day";

const STATE_STYLE: Record<Slot["state"], string> = {
  free: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400",
  requested: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400",
  confirmed: "border-brand-300 bg-brand-600 text-white hover:bg-brand-700",
  blocked: "border-ink-300 bg-ink-200 text-ink-700 hover:bg-ink-300",
};

export default function ProviderCalendarPage() {
  const { t, tr, locale } = useI18n();
  const { calendar, setSlotState, settings, toast } = useStore();
  const [view, setView] = useState<View>("week");
  const [dayOffset, setDayOffset] = useState(0);
  const [target, setTarget] = useState<{ offset: number; slot: Slot } | null>(null);
  const [reason, setReason] = useState("phone");
  const [genOpen, setGenOpen] = useState(false);

  const days = useMemo(() => buildDayOptions(14, locale), [locale]);
  const times = useMemo(() => {
    const set = new Set<string>();
    calendar.forEach((d) => d.slots.forEach((s) => set.add(s.time)));
    return [...set].sort();
  }, [calendar]);

  const currentDay = calendar.find((d) => d.offset === dayOffset) ?? calendar[1];

  const counts = useMemo(() => {
    const c = { free: 0, requested: 0, confirmed: 0, blocked: 0 };
    calendar.forEach((d) => d.slots.forEach((s) => (c[s.state] += 1)));
    return c;
  }, [calendar]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* toolbar */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <CalendarDays size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.calendar")}</h1>
          <p className="text-xs text-ink-500">{t("pp.cal.generateHint")}</p>
        </div>

        <Segmented<View>
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { id: "week", label: t("pp.cal.weekView") },
            { id: "day", label: t("pp.cal.dayView") },
          ]}
        />

        <Button variant="outline" size="sm" icon={<Wand2 size={14} />} onClick={() => setGenOpen(true)}>
          {t("pp.cal.generateSlots")}
        </Button>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => setGenOpen(true)}>
          {t("pp.blockTime")}
        </Button>
      </div>

      {/* legend + counts */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            { k: "free", label: t("pp.cal.free"), color: "bg-emerald-500" },
            { k: "requested", label: t("pp.cal.requested"), color: "bg-sky-500" },
            { k: "confirmed", label: t("pp.cal.confirmed"), color: "bg-brand-600" },
            { k: "blocked", label: t("pp.cal.blocked"), color: "bg-ink-400" },
          ] as const
        ).map((l) => (
          <div key={l.k} className="card flex items-center gap-3 p-3.5">
            <span className={cn("h-8 w-2 rounded-full", l.color)} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink-700">{l.label}</p>
              <p className="tnum text-lg font-black text-ink-950">{localDigits(counts[l.k], locale)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- week view ---------------- */}
      {view === "week" && (
        <section className="card overflow-hidden">
          <div className="scroll-thin overflow-x-auto">
            <div className="min-w-[54rem]">
              {/* header */}
              <div className="sticky top-0 z-10 grid border-b border-ink-200 bg-ink-50" style={{ gridTemplateColumns: `5rem repeat(${calendar.length}, minmax(0,1fr))` }}>
                <div className="px-3 py-2.5 text-[11px] font-bold text-ink-400">{t("misc.time")}</div>
                {calendar.map((d) => {
                  const opt = days.find((x) => x.iso === d.iso);
                  return (
                    <button
                      key={d.offset}
                      onClick={() => {
                        setDayOffset(d.offset);
                        setView("day");
                      }}
                      className={cn(
                        "border-s border-ink-200 px-2 py-2 text-center transition-colors hover:bg-white",
                        d.offset === 0 && "bg-brand-50",
                      )}
                    >
                      <p className="text-[11px] font-bold text-ink-500">{opt?.weekdayLabel}</p>
                      <p className="tnum text-sm font-extrabold text-ink-950">{opt?.dayLabel}</p>
                      <p className="text-[10px] text-ink-400">{opt?.monthLabel}</p>
                    </button>
                  );
                })}
              </div>

              {/* rows */}
              {times.map((time) => (
                <div
                  key={time}
                  className="grid border-b border-ink-100 last:border-0"
                  style={{ gridTemplateColumns: `5rem repeat(${calendar.length}, minmax(0,1fr))` }}
                >
                  <div className="tnum flex items-center px-3 text-[11px] font-bold text-ink-400">
                    {formatClock(time, locale)}
                  </div>
                  {calendar.map((d) => {
                    const slot = d.slots.find((s) => s.time === time);
                    if (!slot) {
                      return (
                        <div key={d.offset} className="border-s border-ink-100 bg-ink-50/60 p-1.5">
                          <span className="block rounded-lg border border-dashed border-ink-200 py-2.5 text-center text-[10px] text-ink-300">
                            —
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div key={d.offset} className="border-s border-ink-100 p-1.5">
                        <button
                          onClick={() => setTarget({ offset: d.offset, slot })}
                          className={cn(
                            "block w-full rounded-lg border px-1.5 py-2 text-start transition-all active:scale-95",
                            STATE_STYLE[slot.state],
                          )}
                        >
                          <span className="block truncate text-[10px] font-bold">
                            {slot.customer ??
                              (slot.state === "blocked" ? t("status.blocked") : t("status.free"))}
                          </span>
                          {slot.service && (
                            <span className="mt-0.5 block truncate text-[9px] opacity-75">{slot.service}</span>
                          )}
                          {slot.mode && (
                            <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold opacity-80">
                              {slot.mode === "home" ? <Home size={9} /> : <Store size={9} />}
                              {slot.mode === "home" ? t("misc.home") : t("misc.salon")}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- day view ---------------- */}
      {view === "day" && (
        <section className="card overflow-hidden">
          <header className="flex flex-wrap items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="xs" onClick={() => setDayOffset((d) => d - 1)} disabled={dayOffset <= calendar[0].offset}>
                {t("common.prev")}
              </Button>
              <Button variant="outline" size="xs" onClick={() => setDayOffset((d) => d + 1)} disabled={dayOffset >= calendar[calendar.length - 1].offset}>
                {t("common.next")}
              </Button>
            </div>
            <h2 className="text-sm font-extrabold text-ink-950">
              {dayOffset === 0
                ? t("common.today")
                : formatDateShort(currentDay.iso, locale)}{" "}
              <span className="text-xs font-semibold text-ink-500">
                {weekDayLabels(locale)[
                  ((new Date(currentDay.iso).getDay() + 1) % 7)
                ].label}
              </span>
            </h2>
            <div className="flex-1" />
            <div className="scroll-thin flex gap-1.5 overflow-x-auto">
              {calendar.map((d) => {
                const opt = days.find((x) => x.iso === d.iso);
                return (
                  <button
                    key={d.offset}
                    onClick={() => setDayOffset(d.offset)}
                    className={cn(
                      "shrink-0 rounded-xl border px-2.5 py-1.5 text-center transition-colors",
                      d.offset === dayOffset
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
                    )}
                  >
                    <span className="tnum block text-xs font-extrabold">{opt?.dayLabel}</span>
                    <span className={cn("block text-[9px] font-bold", d.offset === dayOffset ? "text-white/75" : "text-ink-400")}>
                      {opt?.weekdayLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </header>

          {currentDay.slots.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Clock size={26} />}
                title={t("booking.noSlots")}
                body={t("pp.cal.generateHint")}
                action={<Button size="sm" icon={<Wand2 size={14} />} onClick={() => setGenOpen(true)}>{t("pp.cal.generateSlots")}</Button>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {currentDay.slots.map((slot) => (
                <li key={slot.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="tnum w-16 shrink-0 text-sm font-extrabold text-ink-950">
                    {formatClock(slot.time, locale)}
                  </span>
                  <span
                    className={cn(
                      "h-10 w-1.5 shrink-0 rounded-full",
                      slot.state === "free" && "bg-emerald-500",
                      slot.state === "requested" && "bg-sky-500",
                      slot.state === "confirmed" && "bg-brand-600",
                      slot.state === "blocked" && "bg-ink-400",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">
                      {slot.customer ??
                        (slot.state === "blocked" ? t("status.blocked") : t("status.free"))}
                    </p>
                    {slot.service && <p className="truncate text-[11px] text-ink-500">{slot.service}</p>}
                  </div>
                  {slot.mode && (
                    <Badge tone={slot.mode === "home" ? "brand" : "neutral"} size="sm" icon={slot.mode === "home" ? <Home size={11} /> : <Store size={11} />}>
                      {slot.mode === "home" ? t("misc.home") : t("misc.salon")}
                    </Badge>
                  )}
                  {slot.state === "blocked" ? (
                    <Button variant="outline" size="sm" icon={<Unlock size={14} />} onClick={() => setTarget({ offset: currentDay.offset, slot })}>
                      {t("pp.cal.unblock")}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" icon={<Lock size={14} />} onClick={() => setTarget({ offset: currentDay.offset, slot })}>
                      {t("pp.cal.block")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* working hours */}
      <section className="card p-4">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
          <Clock size={15} className="text-brand-600" />
          {t("pp.cal.workingHours")}
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {weekDayLabels(locale).map((d) => {
            const wh = settings.workingHours.find((w) => w.day === d.index);
            const closed = !wh || wh.closed;
            return (
              <div
                key={d.index}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2.5",
                  closed ? "border-ink-200 bg-ink-50" : "border-brand-200 bg-brand-50/60",
                )}
              >
                <span className={cn("text-xs font-bold", closed ? "text-ink-400" : "text-ink-800")}>
                  {d.label}
                </span>
                <span className={cn("tnum text-[11px] font-extrabold", closed ? "text-ink-400" : "text-brand-800")}>
                  {closed ? t("pp.set.closedDay") : `${formatClock(wh!.open, locale)}–${formatClock(wh!.close, locale)}`}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-600">
          <Info size={13} className="mt-0.5 shrink-0 text-brand-600" />
          {t("pp.cal.blockSlotBody")}
        </div>
      </section>

      {/* ---------------- slot modal ---------------- */}
      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={target?.slot.state === "blocked" ? t("pp.cal.unblock") : t("pp.cal.blockSlotTitle")}
        description={
          target
            ? `${formatDateShort(currentDay.iso, locale)} · ${formatClock(target.slot.time, locale)}`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setTarget(null)}>
              {t("common.cancel")}
            </Button>
            {target?.slot.state === "blocked" ? (
              <Button
                size="sm"
                variant="secondary"
                icon={<Unlock size={14} />}
                onClick={() => {
                  if (target) setSlotState(target.offset, target.slot.id, "free");
                  toast(t("pp.cal.unblockedOk"), "success");
                  setTarget(null);
                }}
              >
                {t("pp.cal.unblock")}
              </Button>
            ) : (
              <Button
                size="sm"
                icon={<Lock size={14} />}
                onClick={() => {
                  if (target) setSlotState(target.offset, target.slot.id, "blocked");
                  toast(t("pp.cal.blockedOk"), "success");
                  setTarget(null);
                }}
              >
                {t("pp.cal.block")}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {target?.slot.customer && (
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-3">
              <p className="text-xs font-bold text-ink-900">{target.slot.customer}</p>
              {target.slot.service && <p className="mt-0.5 text-[11px] text-ink-500">{target.slot.service}</p>}
            </div>
          )}
          <p className="text-sm leading-relaxed text-ink-600">{t("pp.cal.blockSlotBody")}</p>
          <Field label={t("pp.cal.blockReason")}>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="phone">{t("pp.cal.reasonPhone")}</option>
              <option value="personal">{t("pp.cal.reasonPersonal")}</option>
              <option value="break">{t("pp.cal.reasonBreak")}</option>
              <option value="off">{t("pp.cal.reasonOff")}</option>
            </Select>
          </Field>
          <div className="flex items-start gap-2 rounded-xl bg-deal-50 p-3 text-[11px] leading-relaxed text-deal-900">
            <Sparkles size={13} className="mt-0.5 shrink-0" />
            {locale === "fa"
              ? "برای پر کردن سریع‌تر این زمان می‌توانید یک تخفیف فوری بسازید."
              : "To fill this slot faster, you can create a flash deal for it."}
          </div>
          <Button variant="deal" size="sm" fullWidth icon={<Sparkles size={14} />} onClick={() => setTarget(null)}>
            {t("pp.deal.createNew")}
          </Button>
        </div>
      </Modal>

      {/* ---------------- generate slots modal ---------------- */}
      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title={t("pp.cal.generateSlots")}
        description={t("pp.cal.generateHint")}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setGenOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              icon={<Wand2 size={14} />}
              onClick={() => {
                setGenOpen(false);
                toast(t("pp.cal.slotAdded"), "success");
              }}
            >
              {t("pp.cal.generateSlots")}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-600">{t("pp.cal.generateHint")}</p>
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-3.5 text-xs">
            <p className="font-bold text-ink-800">{t("pp.cal.workingHours")}</p>
            <p className="tnum mt-1 text-ink-600">
              {settings.workingHours
                .filter((w) => !w.closed)
                .map((w) => `${weekDayLabels(locale)[w.day].short} ${formatClock(w.open, locale)}–${formatClock(w.close, locale)}`)
                .join(" · ")}
            </p>
          </div>
          <Badge tone="brand" size="md" icon={<Clock size={12} />}>
            {tr({ fa: "مدت خدمت پایه: ۴۵ دقیقه", en: "Base service duration: 45 min" })}
          </Badge>
        </div>
      </Modal>
    </div>
  );
}

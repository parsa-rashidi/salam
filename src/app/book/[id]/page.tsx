"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Baby,
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  Ear,
  EarOff,
  Flame,
  HeartHandshake,
  Home,
  Info,
  Lock,
  MapPin,
  Phone,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  UserRoundPlus,
  Users,
  Zap,
} from "lucide-react";
import type { Booking, ServiceMode, ServiceItem } from "@/types";
import { DEMO_CUSTOMER, PROVIDERS } from "@/lib/mock-data";
import { discountPercent, generateSlots } from "@/lib/queries";
import {
  buildDayOptions,
  formatClock,
  formatDuration,
  formatDate,
  formatMoney,
  localDigits,
  startOfToday,
} from "@/lib/format";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, ChoiceCard, Field, Input, Select, Textarea, Toggle } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import type { TranslationKey } from "@/i18n/dictionary";

const STEPS = [
  { id: 1, key: "booking.step1", icon: Scissors },
  { id: 2, key: "booking.step2", icon: MapPin },
  { id: 3, key: "booking.step3", icon: CalendarClock },
  { id: 4, key: "booking.step4", icon: UserRoundPlus },
  { id: 5, key: "booking.step5", icon: BadgeCheck },
] as const;

const PLACES = [
  { id: "home", key: "booking.placeHome", icon: Home },
  { id: "work", key: "booking.placeWork", icon: Briefcase },
  { id: "hotel", key: "booking.placeHotel", icon: Building2 },
  { id: "nursing", key: "booking.placeNursing", icon: HeartHandshake },
  { id: "temp", key: "booking.placeTemp", icon: MapPin },
  { id: "other", key: "booking.placeOther", icon: Sparkles },
] as const;

const RELATION_LABELS: Record<string, { fa: string; en: string }> = {
  parent: { fa: "پدر / مادر", en: "Parent" },
  spouse: { fa: "همسر", en: "Spouse" },
  child: { fa: "فرزند", en: "Child" },
  relative: { fa: "بستگان", en: "Relative" },
  friend: { fa: "دوست / آشنا", en: "Friend" },
  client: { fa: "مراجع (همراه حرفه‌ای)", en: "Client (professional carer)" },
};

const RELATIONS = [
  { id: "parent", key: "booking.relationParent" },
  { id: "spouse", key: "booking.relationSpouse" },
  { id: "child", key: "booking.relationChild" },
  { id: "relative", key: "booking.relationRelative" },
  { id: "friend", key: "booking.relationFriend" },
  { id: "client", key: "booking.relationClient" },
] as const;

function BookingInner() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { t, tr, locale, dir } = useI18n();
  const { deals, addBooking, toast } = useStore();

  const provider = PROVIDERS.find((p) => p.id === params?.id);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Back = dir === "rtl" ? ArrowRight : ChevronLeft;

  const dealParam = sp.get("deal");
  const modeParam = sp.get("mode") as ServiceMode | null;
  const serviceParam = sp.get("service");
  const deal = deals.find((d) => d.id === dealParam);

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<ServiceMode>(
    modeParam && provider?.modes.includes(modeParam) ? modeParam : (provider?.modes[0] ?? "salon"),
  );
  const [placeType, setPlaceType] = useState("home");
  const [address, setAddress] = useState("");
  const [addressNote, setAddressNote] = useState("");
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [forSelf, setForSelf] = useState(true);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [relation, setRelation] = useState("parent");
  const [needAssistance, setNeedAssistance] = useState(false);
  const [mobilityNote, setMobilityNote] = useState("");
  const [hearingNote, setHearingNote] = useState(false);
  const [companionAttends, setCompanionAttends] = useState(false);
  const [shareCompanion, setShareCompanion] = useState(false);
  const [companionPhone, setCompanionPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Booking | null>(null);

  const days = useMemo(() => buildDayOptions(14, locale), [locale]);

  /* -------- preselect from a flash deal -------- */
  useEffect(() => {
    if (!deal || !provider) return;
    const match =
      provider.services.find((s) => s.categoryId === deal.categoryId) ?? provider.services[0];
    if (match) setSelected([match.id]);
    const d = new Date(deal.dateISO);
    const today = startOfToday();
    const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
    if (diff >= 0 && diff < 14) setDayIndex(diff);
    setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    if (provider.modes.includes("home") && deal.serviceName.fa.includes("منزل")) setMode("home");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal?.id, provider?.id]);

  useEffect(() => {
    if (!serviceParam || !provider) return;
    if (provider.services.some((s) => s.id === serviceParam)) {
      setSelected((prev) => (prev.includes(serviceParam) ? prev : [...prev, serviceParam]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceParam, provider?.id]);

  const slotsForDay = useMemo(
    () => (provider ? generateSlots(provider, dayIndex) : []),
    [provider, dayIndex],
  );

  if (!provider) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <EmptyState
          icon={<Scissors size={28} />}
          title={t("misc.notFoundTitle")}
          body={t("misc.notFoundBody")}
          action={<ButtonLink href="/explore">{t("misc.backHome")}</ButtonLink>}
        />
      </div>
    );
  }

  const chosenServices: ServiceItem[] = provider.services.filter((s) =>
    selected.includes(s.id),
  );
  const servicesTotal = chosenServices.reduce((sum, s) => sum + s.price, 0);
  const surcharge =
    mode === "home" ? chosenServices.reduce((sum, s) => sum + (s.homeSurcharge ?? 0), 0) : 0;
  const travelFee = mode === "home" ? provider.travelFee : 0;
  const discount = deal && selected.length ? deal.originalPrice - deal.dealPrice : 0;
  const total = Math.max(0, servicesTotal + surcharge + travelFee - discount);
  const totalMinutes = chosenServices.reduce((m, s) => m + s.durationMin, 0);

  const canContinue = () => {
    if (step === 1) return selected.length > 0;
    if (step === 2) return mode === "salon" || address.trim().length > 8;
    if (step === 3) return !!time;
    if (step === 4) return forSelf || beneficiaryName.trim().length > 1;
    return acceptedTerms;
  };

  const submit = () => {
    setSubmitting(true);
    const dateISO = `${days[dayIndex].iso}T${time}:00`;
    const booking: Booking = {
      id: `b${Date.now()}`,
      code: `SLM-${localDigits(Math.floor(1000 + Math.random() * 8999), locale)}`,
      providerId: provider.id,
      customerName: DEMO_CUSTOMER.name,
      beneficiary: {
        name: forSelf ? DEMO_CUSTOMER.name : { fa: beneficiaryName, en: beneficiaryName },
        relation: forSelf ? { fa: "خودم", en: "Myself" } : RELATION_LABELS[relation],
        isSelf: forSelf,
        notes: !forSelf && (mobilityNote || hearingNote)
          ? {
              fa: [mobilityNote, hearingNote ? "کم‌شنوا / کم‌بینا" : ""].filter(Boolean).join(" — "),
              en: [mobilityNote, hearingNote ? "Hearing / vision impairment" : ""].filter(Boolean).join(" — "),
            }
          : undefined,
      },
      serviceId: chosenServices[0]?.id ?? provider.services[0].id,
      mode,
      status: provider.acceptsInstant ? "confirmed" : "pending",
      dateISO,
      durationMin: totalMinutes || 45,
      price: servicesTotal + surcharge,
      travelFee,
      dealId: deal?.id,
      address: mode === "home" ? { fa: address, en: address } : undefined,
      addressVisible: false,
      createdAtISO: new Date().toISOString(),
      timeline: [
        { at: new Date().toISOString(), status: "requested" },
        ...(provider.acceptsInstant
          ? [{ at: new Date().toISOString(), status: "confirmed" as const, note: { fa: "تأیید خودکار — درخواست فوری", en: "Auto-confirmed — instant request" } }]
          : []),
      ],
      companionShared: shareCompanion,
      supportPhone: "۰۲۱-۹۱۰۰۰۰۰۰",
    };

    setTimeout(() => {
      addBooking(booking);
      setCreated(booking);
      setSubmitting(false);
      setStep(6);
      toast(t("booking.successTitle"), "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 850);
  };

  /* ================================================================== *
   * Success screen
   * ================================================================== */
  if (step === 6 && created) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="card overflow-hidden">
          <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20 ring-8 ring-white/10">
              <CheckCircle2 size={32} />
            </span>
            <h1 className="mt-5 text-xl font-extrabold sm:text-2xl">{t("booking.successTitle")}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/80">
              {t("booking.successBody")}
            </p>
            {created.status === "pending" && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold">
                <Clock size={12} />
                {t("booking.pendingHint", { min: localDigits(provider.responseTimeMin, locale) })}
              </p>
            )}
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/70 px-4 py-3.5">
              <div>
                <p className="text-[11px] font-bold text-brand-700">{t("booking.successCode")}</p>
                <p className="tnum mt-0.5 text-lg font-black tracking-wide text-brand-900">
                  {created.code}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Copy size={14} />}
                onClick={() => toast(locale === "fa" ? "کد پیگیری کپی شد." : "Tracking code copied.", "info")}
              >
                {locale === "fa" ? "کپی" : "Copy"}
              </Button>
            </div>

            <dl className="divide-y divide-ink-100 rounded-2xl border border-ink-200">
              <Row label={t("booking.summaryProvider")} value={tr(provider.name)} icon={<Scissors size={14} />} />
              <Row
                label={t("booking.summaryService")}
                value={chosenServices.map((s) => tr(s.name)).join(locale === "fa" ? " و " : " & ")}
                icon={<Sparkles size={14} />}
              />
              <Row
                label={t("booking.summaryDate")}
                value={`${formatDate(created.dateISO, locale)} — ${formatClock(time ?? "12:00", locale)}`}
                icon={<CalendarClock size={14} />}
              />
              <Row
                label={t("booking.summaryLocation")}
                value={mode === "home" ? `${t(`booking.place${cap(placeType)}` as TranslationKey)} · ${address}` : tr(provider.address)}
                icon={mode === "home" ? <Home size={14} /> : <Store size={14} />}
              />
              {!forSelf && (
                <Row
                  label={t("booking.summaryBeneficiary")}
                  value={beneficiaryName}
                  icon={<UserRoundPlus size={14} />}
                />
              )}
              <Row
                label={t("booking.costTotal")}
                value={formatMoney(total, locale)}
                icon={<Banknote size={14} />}
                strong
              />
            </dl>

            <div className="flex items-start gap-2.5 rounded-2xl border border-ink-200 bg-ink-50 p-3.5 text-[11px] leading-relaxed text-ink-600">
              <Lock size={14} className="mt-0.5 shrink-0 text-brand-600" />
              {t("booking.privacyNote")}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink href={`/bookings/${created.id}`} className="flex-1" icon={<Arrow size={15} />} iconPosition="end">
                {t("booking.trackBooking")}
              </ButtonLink>
              <ButtonLink href="/explore" variant="outline" className="flex-1">
                {t("booking.backToExplore")}
              </ButtonLink>
              <ButtonLink href={`/book/${provider.id}`} variant="ghost" className="flex-1">
                {t("booking.addAnother")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================== *
   * Wizard
   * ================================================================== */
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      {/* header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-ink-300 bg-white text-ink-600 hover:bg-ink-50"
          aria-label={t("common.back")}
        >
          <Back size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold text-ink-950 sm:text-xl">{t("booking.title")}</h1>
          <p className="truncate text-xs text-ink-500">{t("booking.subtitle")}</p>
        </div>
        <Link
          href={`/providers/${provider.id}`}
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 sm:flex"
        >
          <Avatar name={tr(provider.name)} accent={provider.accent} size={26} />
          <span className="text-xs font-bold text-ink-800">{tr(provider.name)}</span>
        </Link>
      </div>

      {deal && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-deal-200 bg-deal-50 px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-deal-500 text-white">
            <Flame size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-deal-900">
              {t("booking.suggestedByDeal")} — {tr(deal.serviceName)}
            </p>
            <p className="tnum text-[11px] font-semibold text-deal-700">
              <span className="line-through">{formatMoney(deal.originalPrice, locale)}</span>
              {" → "}
              {formatMoney(deal.dealPrice, locale)} ·{" "}
              {t("deals.save", { percent: localDigits(discountPercent(deal), locale) })}
            </p>
          </div>
          <Badge tone="deal" solid size="md">
            {formatDate(deal.dateISO, locale)} · {formatClock(
              `${String(new Date(deal.dateISO).getHours()).padStart(2, "0")}:${String(
                new Date(deal.dateISO).getMinutes(),
              ).padStart(2, "0")}`,
              locale,
            )}
          </Badge>
        </div>
      )}

      {/* stepper */}
      <ol className="card mb-6 flex items-center gap-1 overflow-x-auto p-2 no-scrollbar">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex shrink-0 items-center">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors sm:px-3",
                  active && "bg-brand-600 text-white",
                  done && "text-brand-700 hover:bg-brand-50",
                  !active && !done && "text-ink-400",
                )}
              >
                <span
                  className={cn(
                    "tnum grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px]",
                    active && "bg-white/20",
                    done && "bg-brand-100 text-brand-700",
                    !active && !done && "bg-ink-100",
                  )}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : localDigits(s.id, locale)}
                </span>
                <span className="hidden sm:inline">{t(s.key)}</span>
                <Icon size={14} className="sm:hidden" />
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-0.5 h-px w-3 shrink-0 sm:w-6",
                    done ? "bg-brand-400" : "bg-ink-200",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <section className="card animate-fade-in p-5">
              <StepHead title={t("booking.chooseService")} body={t("booking.multiService")} />
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {provider.services.map((s) => {
                  const on = selected.includes(s.id);
                  const disabled = mode === "home" && !s.homeAvailable;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setSelected((prev) =>
                          prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                        )
                      }
                      className={cn(
                        "relative flex items-start gap-3 rounded-2xl border-2 p-3.5 text-start transition-all",
                        on ? "border-brand-600 bg-brand-50/70" : "border-ink-200 bg-white hover:border-ink-300",
                        disabled && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
                          on ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300",
                        )}
                      >
                        {on && <Check size={12} strokeWidth={3.4} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink-950">{tr(s.name)}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatDuration(s.durationMin, locale)}
                          </span>
                          <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-semibold">
                            {t(`cat.${s.categoryId}` as TranslationKey)}
                          </span>
                          {s.homeAvailable && (
                            <span className="flex items-center gap-1 font-semibold text-brand-700">
                              <Home size={11} />
                              {t("explore.atHome")}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-end">
                        <span className="tnum block text-sm font-extrabold text-ink-950">
                          {formatMoney(s.price, locale, false)}
                        </span>
                        <span className="text-[10px] text-ink-400">{t("common.toman")}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <section className="card animate-fade-in p-5">
              <StepHead title={t("booking.whereTitle")} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ChoiceCard
                  selected={mode === "salon"}
                  disabled={!provider.modes.includes("salon")}
                  onClick={() => setMode("salon")}
                  icon={<Store size={18} />}
                  title={t("booking.whereSalon")}
                  body={t("booking.whereSalonBody")}
                />
                <ChoiceCard
                  selected={mode === "home"}
                  disabled={!provider.modes.includes("home")}
                  onClick={() => setMode("home")}
                  icon={<Home size={18} />}
                  title={t("booking.whereHome")}
                  body={provider.modes.includes("home") ? t("booking.whereHomeBody") : t("booking.whereHomeDisabled")}
                />
              </div>

              {mode === "home" && (
                <div className="mt-5 animate-fade-in space-y-5">
                  <div>
                    <p className="mb-2.5 text-xs font-bold text-ink-800">{t("booking.homePlace")}</p>
                    <div className="scroll-thin flex gap-2 overflow-x-auto pb-1">
                      {PLACES.map((p) => {
                        const Icon = p.icon;
                        const active = placeType === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPlaceType(p.id)}
                            className={cn(
                              "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                              active
                                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                                : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
                            )}
                          >
                            <Icon size={14} />
                            {t(p.key)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold text-ink-800">{t("booking.savedAddresses")}</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {DEMO_CUSTOMER.savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setAddress(tr(a.value))}
                          className={cn(
                            "rounded-xl border-2 p-3 text-start transition-all",
                            address === tr(a.value)
                              ? "border-brand-600 bg-brand-50/70"
                              : "border-ink-200 bg-white hover:border-ink-300",
                          )}
                        >
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-brand-700">
                            <MapPin size={12} />
                            {tr(a.label)}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-ink-600">
                            {tr(a.value)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label={t("booking.addressTitle")} required>
                    <Textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t("booking.addressPlaceholder")}
                    />
                  </Field>

                  <Field label={t("booking.addressNote")} hint={t("booking.privacyNote")}>
                    <Textarea
                      rows={2}
                      value={addressNote}
                      onChange={(e) => setAddressNote(e.target.value)}
                      placeholder={t("booking.addressNotePlaceholder")}
                    />
                  </Field>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50/60 p-3.5 text-[11px] leading-relaxed text-brand-900">
                    <Lock size={14} className="mt-0.5 shrink-0" />
                    {t("booking.privacyNote")}
                  </div>
                </div>
              )}

              {mode === "salon" && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-700">
                    <Store size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink-900">{t("profile.address")}</p>
                    <p className="mt-1 text-sm text-ink-700">{tr(provider.address)}</p>
                    <p className="mt-1.5 text-[11px] text-ink-500">
                      {tr(provider.district)} · {t("profile.travelFee")}: {t("common.free")}
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <section className="card animate-fade-in p-5">
              <StepHead title={t("booking.pickDate")} body={t("booking.datePickerHint")} />

              <div className="scroll-thin mt-4 flex gap-2 overflow-x-auto pb-2">
                {days.map((d, i) => (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setDayIndex(i);
                      setTime(null);
                    }}
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 transition-all",
                      i === dayIndex
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
                    )}
                  >
                    <span className={cn("text-[11px] font-bold", i === dayIndex ? "text-white/85" : "text-ink-400")}>
                      {d.isToday ? t("booking.today") : d.isTomorrow ? t("booking.tomorrow") : d.weekdayLabel}
                    </span>
                    <span className="tnum text-lg font-extrabold">{d.dayLabel}</span>
                    <span className={cn("text-[10px] font-semibold", i === dayIndex ? "text-white/75" : "text-ink-400")}>
                      {d.monthLabel}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2.5 text-xs font-bold text-ink-800">{t("booking.pickTime")}</p>
                {deal ? (
                  <div className="rounded-2xl border-2 border-deal-300 bg-deal-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-deal-900">
                      <Flame size={15} />
                      {formatDate(deal.dateISO, locale)} —{" "}
                      {formatClock(
                        `${String(new Date(deal.dateISO).getHours()).padStart(2, "0")}:${String(
                          new Date(deal.dateISO).getMinutes(),
                        ).padStart(2, "0")}`,
                        locale,
                      )}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-deal-800">
                      {t("deals.autoDeactivate")}
                    </p>
                  </div>
                ) : slotsForDay.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center">
                    <p className="text-sm font-bold text-ink-600">{t("booking.noSlots")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {slotsForDay.map((hhmm) => {
                      const active = time === hhmm;
                      return (
                        <button
                          key={hhmm}
                          type="button"
                          onClick={() => setTime(hhmm)}
                          className={cn(
                            "tnum rounded-xl border-2 py-2.5 text-sm font-bold transition-all active:scale-95",
                            active
                              ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                              : "border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50/50",
                          )}
                        >
                          {formatClock(hhmm, locale)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {time && !deal && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-relaxed text-amber-900">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {t("booking.conflictWarning")}
                </div>
              )}

              {time && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-ink-50 p-3.5">
                  <Badge tone="brand" size="md" icon={<Clock size={12} />}>
                    {formatDuration(totalMinutes || 45, locale)}
                  </Badge>
                  <span className="tnum text-xs font-semibold text-ink-600">
                    {formatDate(days[dayIndex].date, locale)} · {formatClock(time, locale)}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <section className="card animate-fade-in p-5">
              <StepHead title={t("booking.whoTitle")} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ChoiceCard
                  selected={forSelf}
                  onClick={() => setForSelf(true)}
                  icon={<User size={18} />}
                  title={t("booking.forSelf")}
                  body={DEMO_CUSTOMER.name[locale]}
                />
                <ChoiceCard
                  selected={!forSelf}
                  onClick={() => setForSelf(false)}
                  icon={<UserRoundPlus size={18} />}
                  title={t("booking.forOther")}
                  body={locale === "fa" ? "والدین، اعضای خانواده یا مراجع شما" : "A parent, family member or your client"}
                />
              </div>

              {!forSelf && (
                <div className="mt-5 animate-fade-in space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("booking.beneficiaryName")} required>
                      <Input
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                        placeholder={locale === "fa" ? "نام و نام خانوادگی" : "Full name"}
                      />
                    </Field>
                    <Field label={t("booking.relation")}>
                      <Select value={relation} onChange={(e) => setRelation(e.target.value)}>
                        {RELATIONS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {t(r.key)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                    <Toggle
                      checked={needAssistance}
                      onChange={setNeedAssistance}
                      label={
                        <span className="flex items-center gap-2">
                          <Accessibility size={15} className="text-violet-700" />
                          {t("booking.needAssistance")}
                        </span>
                      }
                      hint={locale === "fa" ? "این اطلاعات فقط به آرایشگر نشان داده می‌شود تا آماده بیاید." : "Only shared with the stylist so they can prepare."}
                    />

                    {needAssistance && (
                      <div className="mt-4 animate-fade-in space-y-4">
                        <Field label={t("booking.mobilityNote")}>
                          <Textarea
                            rows={2}
                            value={mobilityNote}
                            onChange={(e) => setMobilityNote(e.target.value)}
                            placeholder={t("booking.mobilityNotePlaceholder")}
                          />
                        </Field>
                        <Checkbox
                          checked={hearingNote}
                          onChange={setHearingNote}
                          label={
                            <span className="flex items-center gap-2">
                              <EarOff size={14} className="text-violet-700" />
                              {t("booking.hearingNote")}
                            </span>
                          }
                        />
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="violet" size="sm" icon={<Ear size={11} />}>
                            {locale === "fa" ? "گفت‌وگوی شمرده و بلند" : "Speak slowly and clearly"}
                          </Badge>
                          <Badge tone="violet" size="sm" icon={<Baby size={11} />}>
                            {locale === "fa" ? "صبر بیشتر" : "Extra patience"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
                    <Toggle
                      checked={companionAttends}
                      onChange={setCompanionAttends}
                      label={
                        <span className="flex items-center gap-2">
                          <Users size={15} className="text-ink-700" />
                          {t("booking.companionWillAttend")}
                        </span>
                      }
                    />
                    <div className="mt-4">
                      <Toggle
                        checked={shareCompanion}
                        onChange={setShareCompanion}
                        label={
                          <span className="flex items-center gap-2">
                            <Share2 size={15} className="text-ink-700" />
                            {t("booking.shareWithCompanion")}
                          </span>
                        }
                      />
                      {shareCompanion && (
                        <div className="mt-3 animate-fade-in">
                          <Field label={t("booking.companionPhone")}>
                            <Input
                              dir="ltr"
                              value={companionPhone}
                              onChange={(e) => setCompanionPhone(e.target.value)}
                              placeholder="+98 912 000 0000"
                              className="tnum"
                            />
                          </Field>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= STEP 5 ================= */}
          {step === 5 && (
            <section className="card animate-fade-in p-5">
              <StepHead title={t("booking.summaryTitle")} />

              <dl className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-200">
                <Row label={t("booking.summaryProvider")} value={tr(provider.name)} icon={<Scissors size={14} />} />
                <Row
                  label={t("booking.summaryService")}
                  value={chosenServices.map((s) => tr(s.name)).join(locale === "fa" ? " و " : " & ")}
                  icon={<Sparkles size={14} />}
                />
                <Row
                  label={t("booking.summaryDate")}
                  value={`${formatDate(days[dayIndex].date, locale)} — ${formatClock(time ?? "—", locale)}`}
                  icon={<CalendarClock size={14} />}
                />
                <Row
                  label={t("booking.summaryLocation")}
                  value={
                    mode === "home"
                      ? `${t(`booking.place${cap(placeType)}` as TranslationKey)}${address ? ` · ${address}` : ""}`
                      : tr(provider.address)
                  }
                  icon={mode === "home" ? <Home size={14} /> : <Store size={14} />}
                />
                <Row
                  label={t("booking.summaryBeneficiary")}
                  value={forSelf ? t("booking.forSelf") : beneficiaryName || "—"}
                  icon={<UserRoundPlus size={14} />}
                />
                {!forSelf && (needAssistance || companionAttends) && (
                  <Row
                    label={t("misc.notes")}
                    value={[
                      mobilityNote,
                      hearingNote ? t("booking.hearingNote") : "",
                      companionAttends ? t("booking.companionWillAttend") : "",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                    icon={<Accessibility size={14} />}
                  />
                )}
              </dl>

              <div className="mt-4 rounded-2xl border border-ink-200 bg-ink-50 p-4">
                <p className="text-xs font-extrabold text-ink-900">{t("booking.costBreakdown")}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <CostRow label={t("booking.costServices")} value={formatMoney(servicesTotal, locale)} />
                  {surcharge > 0 && (
                    <CostRow label={locale === "fa" ? "هزینهٔ ارائه در محل" : "At-home surcharge"} value={formatMoney(surcharge, locale)} />
                  )}
                  {travelFee > 0 && (
                    <CostRow label={t("booking.costTravel")} value={formatMoney(travelFee, locale)} />
                  )}
                  {discount > 0 && (
                    <CostRow label={t("booking.costDiscount")} value={`− ${formatMoney(discount, locale)}`} tone="deal" />
                  )}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-ink-200 pt-3">
                  <span className="text-sm font-extrabold text-ink-950">{t("booking.costTotal")}</span>
                  <span className="tnum text-xl font-black text-brand-700">{formatMoney(total, locale)}</span>
                </div>
                <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  {t("booking.paymentHint")}
                </p>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-200 bg-white p-4">
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                    acceptedTerms ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300",
                  )}
                >
                  {acceptedTerms && <Check size={12} strokeWidth={3.4} />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="text-xs leading-relaxed text-ink-700">
                  {t("booking.acceptTerms")}{" "}
                  <span className="font-bold text-brand-700">{t("bookings.cancelPolicy")}</span>{" "}
                  {t("bookings.cancelPolicyBody")}
                </span>
              </label>
            </section>
          )}
        </div>

        {/* ---------------- sticky summary ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink-200 bg-ink-50 p-4">
              <Avatar name={tr(provider.name)} accent={provider.accent} size={42} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-extrabold text-ink-950">
                  {tr(provider.name)}
                  {provider.verified && <BadgeCheck size={13} className="shrink-0 text-brand-600" />}
                </p>
                <p className="truncate text-[11px] text-ink-500">
                  {tr(provider.district)} · {mode === "home" ? t("explore.atHome") : t("explore.inSalon")}
                </p>
              </div>
            </div>

            <ul className="divide-y divide-ink-100 px-4 text-xs">
              <SummaryRow label={t("booking.summaryService")} value={chosenServices.length ? chosenServices.map((s) => tr(s.name)).join("، ") : "—"} />
              <SummaryRow label={t("booking.summaryDate")} value={time ? `${days[dayIndex].monthLabel} ${days[dayIndex].dayLabel} · ${formatClock(time, locale)}` : "—"} />
              <SummaryRow label={t("booking.summaryLocation")} value={mode === "home" ? t(`booking.place${cap(placeType)}` as TranslationKey) : t("misc.salon")} />
              <SummaryRow label={t("booking.summaryBeneficiary")} value={forSelf ? t("booking.forSelf") : beneficiaryName || "—"} />
            </ul>

            <div className="border-t border-ink-200 bg-brand-50/60 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand-900">{t("booking.costTotal")}</span>
                <span className="tnum text-lg font-black text-brand-800">{formatMoney(total, locale)}</span>
              </div>
              {provider.acceptsInstant && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-brand-700">
                  <Zap size={12} />
                  {t("card.instant")}
                </p>
              )}
            </div>

            <div className="space-y-2 border-t border-ink-200 p-4">
              <Button fullWidth disabled={!canContinue()} onClick={nextStep} icon={<Arrow size={15} />} iconPosition="end">
                {step === 5 ? t("booking.submit") : t("common.continue")}
              </Button>
              {step > 1 && (
                <Button fullWidth variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                  {t("common.prev")}
                </Button>
              )}
              <p className="pt-1 text-center text-[10px] leading-relaxed text-ink-400">
                {t("common.step")} {localDigits(step, locale)} {t("common.of")} {localDigits(5, locale)}
              </p>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold text-ink-950">
              <ShieldCheck size={14} className="text-brand-600" />
              {t("footer.safety")}
            </h3>
            <ul className="mt-2.5 space-y-2 text-[11px] leading-relaxed text-ink-600">
              <li className="flex items-start gap-2">
                <Lock size={12} className="mt-0.5 shrink-0 text-brand-600" />
                {t("booking.privacyNote")}
              </li>
              <li className="flex items-start gap-2">
                <Phone size={12} className="mt-0.5 shrink-0 text-brand-600" />
                {t("booking.supportLine")}: <span className="tnum font-bold">۰۲۱-۹۱۰۰۰۰۰۰</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* bottom action bar (mobile) */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-ink-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-ink-400">{t("booking.costTotal")}</p>
            <p className="tnum truncate text-base font-extrabold text-brand-700">{formatMoney(total, locale)}</p>
          </div>
          {step > 1 && (
            <Button variant="outline" size="md" onClick={() => setStep((s) => s - 1)}>
              <Back size={15} />
            </Button>
          )}
          <Button size="md" disabled={!canContinue()} onClick={nextStep} className="flex-1">
            {submitting ? t("booking.submitting") : step === 5 ? t("booking.submit") : t("common.continue")}
          </Button>
        </div>
      </div>
    </div>
  );

  function nextStep() {
    if (step === 5) {
      submit();
      return;
    }
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ------------------------------------------------------------------ */

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StepHead({ title, body }: { title: string; body?: string }) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-ink-950">{title}</h2>
      {body && <p className="mt-1 text-xs leading-relaxed text-ink-500">{body}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  strong,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {icon && <span className="mt-0.5 shrink-0 text-ink-400">{icon}</span>}
      <dt className="w-32 shrink-0 text-[11px] font-bold text-ink-500 sm:w-40">{label}</dt>
      <dd className={cn("min-w-0 flex-1 text-xs leading-relaxed", strong ? "tnum text-base font-black text-brand-700" : "font-semibold text-ink-900")}>
        {value}
      </dd>
    </div>
  );
}

function CostRow({ label, value, tone }: { label: string; value: string; tone?: "deal" }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={cn("text-xs font-semibold", tone === "deal" ? "text-deal-700" : "text-ink-600")}>
        {label}
      </span>
      <span className={cn("tnum text-xs font-extrabold", tone === "deal" ? "text-deal-600" : "text-ink-900")}>
        {value}
      </span>
    </li>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start gap-2 py-2.5">
      <span className="w-24 shrink-0 font-bold text-ink-400">{label}</span>
      <span className="min-w-0 flex-1 text-end font-semibold text-ink-900">{value || "—"}</span>
    </li>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-500">…</div>}>
      <BookingInner />
    </Suspense>
  );
}

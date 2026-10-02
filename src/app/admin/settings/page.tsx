"use client";

import { useState } from "react";
import {
  Ban,
  Clock3,
  CreditCard,
  Lock,
  Percent,
  Phone,
  Receipt,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/field";
import { formatMoney, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function AdminSettingsPage() {
  const { t, locale } = useI18n();
  const { toast } = useStore();

  /* commercial */
  const [commission, setCommission] = useState(8);
  const [subscription, setSubscription] = useState(290_000);
  const [featured, setFeatured] = useState(750_000);
  const [dealFee, setDealFee] = useState(45_000);
  const [homeFee, setHomeFee] = useState(5);
  const [freeTier, setFreeTier] = useState(true);

  /* cancellation & trust */
  const [freeCancelHours, setFreeCancelHours] = useState(2);
  const [maxNoShow, setMaxNoShow] = useState(3);
  const [minAgeContent, setMinAgeContent] = useState(16);
  const [privacyAddress, setPrivacyAddress] = useState(true);
  const [instantBooking, setInstantBooking] = useState(true);

  /* support */
  const [supportPhone, setSupportPhone] = useState("۰۲۱-۹۱۰۰۰۰۰۰");
  const [supportHours, setSupportHours] = useState("08:00");
  const [supportEnd, setSupportEnd] = useState("22:00");
  const [maintenance, setMaintenance] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-700">
          <Settings size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("ad.set.title")}</h1>
          <p className="text-xs text-ink-500">{t("ad.set.subtitle")}</p>
        </div>
        <Button icon={<Save size={15} />} onClick={() => toast(t("pp.set.savedOk"), "success")}>
          {t("common.save")}
        </Button>
      </div>

      {/* commercial */}
      <section className="card p-5">
        <Head icon={<CreditCard size={15} />} title={locale === "fa" ? "نرخ‌ها و مدل درآمدی" : "Rates & revenue model"} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("ad.rev.bookingCommission")} hint={`${localDigits(commission, locale)}٪`}>
            <Input dir="ltr" type="number" min={0} max={30} value={commission} onChange={(e) => setCommission(Number(e.target.value) || 0)} className="tnum text-start" />
          </Field>
          <Field label={t("ad.rev.subscription")} hint={formatMoney(subscription, locale)}>
            <Input dir="ltr" type="number" min={0} step={10000} value={subscription} onChange={(e) => setSubscription(Number(e.target.value) || 0)} className="tnum text-start" />
          </Field>
          <Field label={t("ad.rev.featured")} hint={formatMoney(featured, locale)}>
            <Input dir="ltr" type="number" min={0} step={50000} value={featured} onChange={(e) => setFeatured(Number(e.target.value) || 0)} className="tnum text-start" />
          </Field>
          <Field label={t("ad.rev.dealPublish")} hint={formatMoney(dealFee, locale)}>
            <Input dir="ltr" type="number" min={0} step={5000} value={dealFee} onChange={(e) => setDealFee(Number(e.target.value) || 0)} className="tnum text-start" />
          </Field>
          <Field label={t("ad.rev.homeService")} hint={`${localDigits(homeFee, locale)}٪`}>
            <Input dir="ltr" type="number" min={0} max={20} value={homeFee} onChange={(e) => setHomeFee(Number(e.target.value) || 0)} className="tnum text-start" />
          </Field>
        </div>

        <div className="mt-4 rounded-2xl border border-ink-200 bg-ink-50 p-4">
          <Toggle
            checked={freeTier}
            onChange={setFreeTier}
            label={
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Sparkles size={13} className="text-brand-600" />
                {t("ad.rev.freeTier")}
              </span>
            }
            hint={
              locale === "fa"
                ? "آرایشگران بدون پرداخت اشتراک هم در جست‌وجو نمایش داده می‌شوند."
                : "Stylists appear in search even without paying for a subscription."
            }
          />
        </div>
      </section>

      {/* cancellation */}
      <section className="card p-5">
        <Head icon={<Clock3 size={15} />} title={t("ad.set.cancellationRules")} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label={t("ad.set.freeCancelHours")}
            hint={locale === "fa" ? "ساعت پیش از نوبت" : "hours before the appointment"}
          >
            <Input dir="ltr" type="number" min={0} max={48} value={freeCancelHours} onChange={(e) => setFreeCancelHours(Number(e.target.value) || 0)} className="tnum text-start" />
          </Field>
          <Field label={t("ad.set.maxNoShow")} hint={locale === "fa" ? "پس از آن حساب مسدود می‌شود" : "after that the account is blocked"}>
            <Input dir="ltr" type="number" min={1} max={10} value={maxNoShow} onChange={(e) => setMaxNoShow(Number(e.target.value) || 1)} className="tnum text-start" />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <Toggle
              checked={privacyAddress}
              onChange={setPrivacyAddress}
              label={
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Lock size={13} className="text-violet-700" />
                  {t("ad.set.privacyAddress")}
                </span>
              }
              hint={t("ad.set.privacyAddressHint")}
            />
          </div>

          <div className="rounded-2xl border border-deal-200 bg-deal-50/60 p-4">
            <Toggle
              checked={instantBooking}
              onChange={setInstantBooking}
              label={
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Zap size={13} className="text-deal-700" />
                  {t("pp.instantToggle")}
                </span>
              }
              hint={t("pp.instantToggleHint")}
            />
          </div>
        </div>
      </section>

      {/* safety */}
      <section className="card p-5">
        <Head icon={<ShieldCheck size={15} />} title={locale === "fa" ? "ایمنی و محتوا" : "Safety & content"} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("ad.set.minAgeContent")} hint={locale === "fa" ? "سال" : "years"}>
            <Input dir="ltr" type="number" min={12} max={21} value={minAgeContent} onChange={(e) => setMinAgeContent(Number(e.target.value) || 12)} className="tnum text-start" />
          </Field>
          <Field label={locale === "fa" ? "حداکثر شعاع خدمت در محل" : "Maximum at-home service radius"} hint={`${localDigits(25, locale)} ${t("common.km")}`}>
            <Input dir="ltr" type="number" min={1} max={50} defaultValue={25} className="tnum text-start" />
          </Field>
        </div>

        <div className="mt-4 space-y-2">
          {[
            { fa: "تصویر چهرهٔ مشتری بدون رضایت کتبی منتشر نشود.", en: "No client face published without written consent." },
            { fa: "قیمت‌ها باید پیش از تأیید نوبت برای مشتری شفاف باشد.", en: "Prices must be transparent to the customer before confirmation." },
            { fa: "شمارهٔ تماس تا پیش از تأیید نوبت به‌صورت masked نمایش داده می‌شود.", en: "Phone numbers stay masked until the booking is confirmed." },
          ].map((r) => (
            <div key={r.en} className="flex items-start gap-2.5 rounded-xl border border-ink-200 bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-600">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-brand-600" />
              <span>{locale === "fa" ? r.fa : r.en}</span>
            </div>
          ))}
        </div>
      </section>

      {/* support */}
      <section className="card p-5">
        <Head icon={<Phone size={15} />} title={t("ad.set.supportHours")} />

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label={locale === "fa" ? "شمارهٔ پشتیبانی" : "Support phone"}>
            <Input dir="ltr" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="tnum text-start" />
          </Field>
          <Field label={locale === "fa" ? "از ساعت" : "From"}>
            <Input dir="ltr" type="time" value={supportHours} onChange={(e) => setSupportHours(e.target.value)} className="tnum text-start" />
          </Field>
          <Field label={locale === "fa" ? "تا ساعت" : "Until"}>
            <Input dir="ltr" type="time" value={supportEnd} onChange={(e) => setSupportEnd(e.target.value)} className="tnum text-start" />
          </Field>
        </div>

        <div className="mt-4">
          <Field label={locale === "fa" ? "یادداشت داخلی تیم" : "Internal team note"}>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>

        <div className={cn("mt-4 rounded-2xl border p-4", maintenance ? "border-red-300 bg-red-50" : "border-ink-200 bg-ink-50")}>
          <Toggle
            checked={maintenance}
            onChange={setMaintenance}
            label={
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <Ban size={13} className={maintenance ? "text-red-600" : "text-ink-500"} />
                {locale === "fa" ? "حالت تعمیرات" : "Maintenance mode"}
              </span>
            }
            hint={
              locale === "fa"
                ? "رزرو برای همهٔ کاربران غیرفعال می‌شود؛ فقط تیم مدیریت دسترسی دارد."
                : "Booking is disabled for everyone; only the admin team keeps access."
            }
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" size="md" icon={<Percent size={12} />}>
            {localDigits(commission, locale)}٪ {t("ad.rev.bookingCommission")}
          </Badge>
          <Badge tone="neutral" size="md" icon={<Receipt size={12} />}>
            {formatMoney(subscription, locale)}
          </Badge>
          <Badge tone="violet" size="md" icon={<UserRound size={12} />}>
            {localDigits(maxNoShow, locale)} {t("ad.set.maxNoShow")}
          </Badge>
        </div>
        <Button icon={<Save size={15} />} onClick={() => toast(t("pp.set.savedOk"), "success")}>
          {t("common.save")}
        </Button>
      </div>

      {maintenance && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-[11px] leading-relaxed text-red-800">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          {locale === "fa"
            ? "حالت تعمیرات فعال است. این تغییر در نمونهٔ فعلی فقط ظاهری است."
            : "Maintenance mode is on. In this prototype the change is visual only."}
        </div>
      )}
    </div>
  );
}

function Head({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink-950">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>
      {title}
    </h2>
  );
}

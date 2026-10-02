"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, KeyRound, Phone, Scissors, ShieldCheck, Sparkles, User } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { ChoiceCard, Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const DEMO_CODE = "12345";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, dir } = useI18n();
  const { signIn, toast } = useStore();

  const [stage, setStage] = useState<"phone" | "code" | "role">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const sendCode = () => {
    setError(null);
    if (phone.replace(/\D/g, "").length < 7) {
      setError(locale === "fa" ? "شمارهٔ موبایل معتبر نیست." : "That phone number doesn't look valid.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStage("code");
      setCountdown(60);
      toast(t("auth.codeSent", { phone }), "info");
    }, 700);
  };

  const verify = () => {
    setError(null);
    if (code.trim() !== DEMO_CODE) {
      setError(t("auth.wrongCode"));
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStage("role");
    }, 600);
  };

  const finish = (role: "customer" | "provider") => {
    signIn(phone);
    toast(t("auth.welcomeBack", { name: locale === "fa" ? "پارسا" : "Parsa" }), "success");
    router.push(role === "provider" ? "/provider" : "/explore");
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(4,133,113,0.14) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000, transparent)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-24 -start-24 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -end-24 h-96 w-96 rounded-full bg-deal-200/30 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-200 bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-7 text-center text-white">
            <div className="flex justify-center [&_*]:text-white">
              <Logo />
            </div>
            <h1 className="mt-4 text-lg font-extrabold sm:text-xl">{t("auth.title")}</h1>
            <p className="mt-1.5 text-xs text-white/75">{t("auth.subtitle")}</p>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              {(["phone", "code", "role"] as const).map((s, i) => {
                const idx = ["phone", "code", "role"].indexOf(stage);
                return (
                  <span key={s} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold transition-colors",
                        i < idx ? "bg-white text-brand-700" : i === idx ? "bg-white/25 ring-2 ring-white" : "bg-white/10 text-white/50",
                      )}
                    >
                      {i < idx ? <CheckCircle2 size={12} /> : i + 1}
                    </span>
                    {i < 2 && <span className={cn("h-px w-6", i < idx ? "bg-white" : "bg-white/25")} />}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {stage === "phone" && (
              <div className="animate-fade-in space-y-4">
                <Field label={t("auth.phoneLabel")} error={error} required>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3.5" />
                    <Input
                      dir="ltr"
                      inputMode="tel"
                      autoFocus
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendCode()}
                      placeholder={t("auth.phonePlaceholder")}
                      className="tnum ps-10 text-start"
                    />
                  </div>
                </Field>

                <Button fullWidth size="lg" onClick={sendCode} disabled={busy} icon={<Arrow size={16} />} iconPosition="end">
                  {busy ? t("common.loading") : t("auth.sendCode")}
                </Button>

                <p className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink-600">
                  <Info size={13} className="mt-0.5 shrink-0 text-brand-600" />
                  {t("auth.demoHint")}
                </p>
                <p className="text-center text-[10px] leading-relaxed text-ink-400">{t("auth.termsNote")}</p>
              </div>
            )}

            {stage === "code" && (
              <div className="animate-fade-in space-y-4">
                <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-center">
                  <p className="tnum text-xs font-bold text-brand-900">
                    {t("auth.codeSent", { phone })}
                  </p>
                </div>

                <Field label={t("auth.codeLabel")} error={error} required>
                  <div className="relative">
                    <KeyRound size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 start-3.5" />
                    <Input
                      dir="ltr"
                      inputMode="numeric"
                      autoFocus
                      maxLength={5}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && verify()}
                      placeholder="12345"
                      className="tnum text-center text-lg tracking-[0.5em] ps-3.5"
                    />
                  </div>
                </Field>

                <Button fullWidth size="lg" onClick={verify} disabled={busy || code.length < 5}>
                  {busy ? t("common.loading") : t("auth.verify")}
                </Button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setStage("phone")}
                    className="font-bold text-ink-500 hover:text-ink-800"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    onClick={() => countdown === 0 && (setCountdown(60), toast(t("auth.codeSent", { phone }), "info"))}
                    disabled={countdown > 0}
                    className={cn(
                      "tnum font-bold",
                      countdown > 0 ? "text-ink-400" : "text-brand-700 hover:text-brand-800",
                    )}
                  >
                    {countdown > 0 ? t("auth.resendIn", { s: countdown }) : t("auth.resend")}
                  </button>
                </div>
              </div>
            )}

            {stage === "role" && (
              <div className="animate-fade-in space-y-3">
                <p className="text-center text-sm font-extrabold text-ink-950">{t("auth.chooseRole")}</p>
                <ChoiceCard
                  selected={false}
                  onClick={() => finish("customer")}
                  icon={<User size={18} />}
                  title={t("auth.roleCustomer")}
                  body={t("auth.roleCustomerBody")}
                />
                <ChoiceCard
                  selected={false}
                  onClick={() => finish("provider")}
                  icon={<Scissors size={18} />}
                  title={t("auth.roleProvider")}
                  body={t("auth.roleProviderBody")}
                />
                <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck size={13} />
                  {t("pp.set.phoneVerified")}
                </p>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
                  <Sparkles size={12} />
                  {t("misc.demoLogin")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

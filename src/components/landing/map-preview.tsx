"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Layers, Maximize2 } from "lucide-react";
import type { MapApi } from "@/components/map/providers-map";
import { PROVIDERS, FLASH_DEALS } from "@/lib/mock-data";
import { ProviderMiniCard } from "@/components/customer/provider-card";
import { Section, SectionHeading } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { providerDistance } from "@/lib/queries";

const ProvidersMap = dynamic(() => import("@/components/map/providers-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-ink-100">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
        <Layers size={15} />
      </div>
    </div>
  ),
});

export function MapPreview() {
  const { t, dir } = useI18n();
  const { userLocation } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [api, setApi] = useState<MapApi | null>(null);

  const nearest = [...PROVIDERS]
    .sort((a, b) => providerDistance(a, userLocation) - providerDistance(b, userLocation))
    .slice(0, 6);

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow={t("landing.mapTitle")}
        title={t("landing.mapTitle")}
        subtitle={t("landing.mapSubtitle")}
        action={
          <ButtonLink href="/explore" size="md" icon={<Maximize2 size={15} />} iconPosition="end">
            {t("landing.openMap")}
          </ButtonLink>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative h-[22rem] overflow-hidden rounded-3xl border border-ink-200 shadow-card sm:h-[28rem] lg:h-[34rem]">
          <ProvidersMap
            providers={PROVIDERS}
            deals={FLASH_DEALS}
            showDeals
            userLocation={userLocation}
            radiusKm={6}
            activeId={activeId}
            onActiveChange={setActiveId}
            onReady={setApi}
            zoom={12}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-ink-200 bg-white/95 px-3 py-2 text-xs font-bold text-ink-800 shadow-card backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-600/20" />
              {t("explore.myLocation")}
            </div>
            <div className="pointer-events-auto flex gap-1.5">
              <span className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-ink-700 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                {t("misc.provider")}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-ink-700 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-deal-500" />
                {t("deals.badge")}
              </span>
            </div>
          </div>
          {api && (
            <button
              onClick={() => api.recenter()}
              className="absolute bottom-4 start-3 flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white/95 px-3 py-2 text-xs font-bold text-ink-800 shadow-card backdrop-blur transition-colors hover:bg-white"
            >
              <Maximize2 size={13} />
              {t("explore.recenter")}
            </button>
          )}
        </div>

        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
            <h3 className="text-sm font-extrabold text-ink-950">{t("nav.explore")}</h3>
            <Link
              href="/explore"
              className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              {t("common.viewAll")}
              <Arrow size={13} />
            </Link>
          </div>
          <div className="scroll-thin flex-1 space-y-1.5 overflow-y-auto p-2.5">
            {nearest.map((p) => (
              <ProviderMiniCard
                key={p.id}
                provider={p}
                deals={FLASH_DEALS}
                userLocation={userLocation}
                active={activeId === p.id}
                onSelect={() => setActiveId(p.id)}
              />
            ))}
          </div>
          <div className="border-t border-ink-200 bg-ink-50 p-3">
            <Link
              href={`/providers/${activeId ?? nearest[0].id}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700"
            >
              {t("card.viewProfile")}
              <Arrow size={13} />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

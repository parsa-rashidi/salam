"use client";

import { Heart, HeartOff } from "lucide-react";
import { PROVIDERS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { ProviderCard } from "@/components/customer/provider-card";
import { PageHeader, EmptyState } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { localDigits } from "@/lib/format";

export default function FavoritesPage() {
  const { t, locale } = useI18n();
  const { favorites, deals, userLocation } = useStore();

  const list = PROVIDERS.filter((p) => favorites.includes(p.id));

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500 text-white">
              <Heart size={20} className="fill-current" />
            </span>
            {t("favorites.title")}
          </span>
        }
        subtitle={`${t("favorites.subtitle")} · ${localDigits(list.length, locale)} ${t("common.results")}`}
        actions={
          <ButtonLink href="/explore" variant="outline" size="md">
            {t("nav.explore")}
          </ButtonLink>
        }
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        {list.length === 0 ? (
          <EmptyState
            icon={<HeartOff size={28} />}
            title={t("favorites.empty")}
            body={t("favorites.emptyBody")}
            action={<ButtonLink href="/explore">{t("nav.explore")}</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map((p) => (
              <ProviderCard key={p.id} provider={p} deals={deals} userLocation={userLocation} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { MapPinOff } from "lucide-react";
import { EmptyState } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
      <EmptyState
        icon={<MapPinOff size={30} />}
        title={t("misc.notFoundTitle")}
        body={t("misc.notFoundBody")}
        action={<ButtonLink href="/">{t("misc.backHome")}</ButtonLink>}
      />
    </div>
  );
}

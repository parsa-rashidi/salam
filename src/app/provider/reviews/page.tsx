"use client";

import { MessageSquareQuote, Star, ThumbsUp, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useStore } from "@/store/app-store";
import { CURRENT_PROVIDER, reviewsFor } from "@/lib/mock-data";
import { RatingSummary, ReviewList } from "@/components/customer/review-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localDigits } from "@/lib/format";

export default function ProviderReviewsPage() {
  const { t, locale } = useI18n();
  const { toast } = useStore();
  const reviews = reviewsFor(CURRENT_PROVIDER.id);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-deal-50 text-deal-600">
          <MessageSquareQuote size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-extrabold text-ink-950">{t("pp.rv.title")}</h1>
          <p className="text-xs text-ink-500">{t("pp.rv.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="deal" size="md" icon={<Star size={12} />}>
            {localDigits(avg.toFixed(1), locale)} / {localDigits(5, locale)}
          </Badge>
          <Badge tone="neutral" size="md" icon={<ThumbsUp size={12} />}>
            {localDigits(reviews.reduce((s, r) => s + r.helpful, 0), locale)}
          </Badge>
        </div>
      </div>

      <RatingSummary reviews={reviews} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-start gap-2.5">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-bold text-ink-900">
              {locale === "fa" ? "نظر نامناسب یا توهین‌آمیز می‌بینید؟" : "See an inappropriate review?"}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-500">
              {locale === "fa"
                ? "می‌توانید آن را گزارش کنید تا تیم مدیریت بررسی کند."
                : "You can report it for the moderation team to review."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<TriangleAlert size={14} />}
          onClick={() => toast(locale === "fa" ? "گزارش شما ثبت شد." : "Your report was filed.", "info")}
        >
          {t("pp.rv.reportReview")}
        </Button>
      </div>

      <ReviewList
        reviews={reviews}
        onReply={(_id, _text) => toast(t("pp.rv.replySent"), "success")}
      />

      <div className="flex items-center justify-center pt-2">
        <span className="text-xs text-ink-400">
          {t("review.count", { count: localDigits(CURRENT_PROVIDER.reviewCount, locale) })}
        </span>
      </div>
    </div>
  );
}

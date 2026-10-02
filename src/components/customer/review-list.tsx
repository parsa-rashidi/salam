"use client";

import { useState } from "react";
import { Check, Home, MessageSquareQuote, Store, ThumbsUp } from "lucide-react";
import type { Review } from "@/types";
import { useI18n } from "@/i18n/provider";
import { Stars, RatingInput } from "@/components/ui/rating";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { formatRelative, localDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

type ReviewFilter = "all" | "home" | "salon";

export function RatingSummary({ reviews, className }: { reviews: Review[]; className?: string }) {
  const { t, locale } = useI18n();
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div className={cn("card flex flex-col gap-5 p-5 sm:flex-row sm:items-center", className)}>
      <div className="text-center sm:w-36 sm:shrink-0">
        <p className="tnum text-5xl font-black tracking-tight text-ink-950">
          {localDigits(avg.toFixed(1), locale)}
        </p>
        <Stars value={avg} size={15} className="mt-1.5 justify-center" />
        <p className="mt-1.5 text-[11px] text-ink-500">
          {t("review.count", { count: localDigits(reviews.length, locale) })}
        </p>
      </div>
      <div className="flex-1 space-y-1.5">
        <p className="mb-2 text-xs font-bold text-ink-700">{t("review.breakdown")}</p>
        {counts.map(({ star, n }) => {
          const pct = reviews.length ? (n / reviews.length) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="tnum w-6 shrink-0 text-[11px] font-bold text-ink-500">
                {localDigits(star, locale)} ★
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <span
                  className="block h-full rounded-full bg-deal-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="tnum w-8 shrink-0 text-end text-[11px] font-semibold text-ink-400">
                {localDigits(n, locale)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewList({
  reviews,
  showFilter = true,
  onReply,
  className,
}: {
  reviews: Review[];
  showFilter?: boolean;
  onReply?: (id: string, text: string) => void;
  className?: string;
}) {
  const { t, tr, locale } = useI18n();
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [helpful, setHelpful] = useState<string[]>([]);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});

  const filtered = reviews.filter((r) => (filter === "all" ? true : r.mode === filter));

  return (
    <div className={cn("space-y-4", className)}>
      {showFilter && (
        <Tabs<ReviewFilter>
          size="sm"
          variant="pill"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "all", label: t("review.filterAll"), count: reviews.length },
            {
              id: "home",
              label: t("review.filterHome"),
              count: reviews.filter((r) => r.mode === "home").length,
              icon: <Home size={12} />,
            },
            {
              id: "salon",
              label: t("review.filterSalon"),
              count: reviews.filter((r) => r.mode === "salon").length,
              icon: <Store size={12} />,
            },
          ]}
        />
      )}

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <MessageSquareQuote size={26} className="text-ink-300" />
          <p className="text-sm font-bold text-ink-800">{t("profile.reviewEmpty")}</p>
        </div>
      ) : (
        filtered.map((r) => {
          const isHelpful = helpful.includes(r.id);
          const localReply = replies[r.id];
          return (
            <article key={r.id} className="card p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Avatar name={r.authorName} accent="#857a6b" size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink-950">{r.authorName}</p>
                    <span className="text-[11px] text-ink-400">
                      {formatRelative(r.at, locale)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} size={13} />
                    <Badge tone={r.mode === "home" ? "brand" : "neutral"} size="sm" icon={r.mode === "home" ? <Home size={11} /> : <Store size={11} />}>
                      {r.mode === "home" ? t("review.atHome") : t("review.inSalon")}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink-700">{tr(r.body)}</p>

              {(r.reply || localReply) && (
                <div className="mt-3 rounded-xl border-s-2 border-brand-300 bg-brand-50/60 px-3.5 py-2.5 ps-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-brand-800">
                    <MessageSquareQuote size={11} />
                    {t("review.providerReply")}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-700">
                    {localReply ?? (r.reply ? tr(r.reply) : "")}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    setHelpful((prev) =>
                      prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id],
                    )
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors",
                    isHelpful
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-ink-200 bg-white text-ink-500 hover:border-ink-300",
                  )}
                >
                  <ThumbsUp size={11} className={isHelpful ? "fill-current" : ""} />
                  {t("review.helpful")}
                  <span className="tnum">({localDigits(r.helpful + (isHelpful ? 1 : 0), locale)})</span>
                </button>

                {onReply && (
                  <button
                    onClick={() => {
                      setReplying(replying === r.id ? null : r.id);
                      setReplyText(localReply ?? "");
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-600 transition-colors hover:border-ink-300"
                  >
                    {t("pp.rv.reply")}
                  </button>
                )}
              </div>

              {onReply && replying === r.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t("pp.rv.replyPlaceholder")}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="xs" onClick={() => setReplying(null)}>
                      {t("common.cancel")}
                    </Button>
                    <Button
                      size="xs"
                      disabled={!replyText.trim()}
                      onClick={() => {
                        setReplies((prev) => ({ ...prev, [r.id]: replyText.trim() }));
                        onReply(r.id, replyText.trim());
                        setReplying(null);
                      }}
                      icon={<Check size={12} />}
                    >
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}

export function WriteReviewForm({ onSubmit }: { onSubmit?: () => void }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="card flex items-start gap-3 border-emerald-200 bg-emerald-50/60 p-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
          <Check size={17} />
        </span>
        <p className="text-sm leading-relaxed font-semibold text-emerald-900">{t("review.submitted")}</p>
      </div>
    );
  }

  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        onSubmit?.();
      }}
    >
      <h3 className="text-sm font-extrabold text-ink-950">{t("review.writeTitle")}</h3>
      <div>
        <p className="mb-2 text-xs font-bold text-ink-700">{t("review.yourRating")}</p>
        <RatingInput value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="mb-2 text-xs font-bold text-ink-700">{t("review.yourText")}</p>
        <Textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("review.yourTextPlaceholder")}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={rating === 0 || body.trim().length < 5}>
          {t("review.submit")}
        </Button>
      </div>
    </form>
  );
}

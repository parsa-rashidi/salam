"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import { localDigits } from "@/lib/format";

/** Simple responsive bar chart built from SVG. */
export function BarChart({
  data,
  labels,
  height = 150,
  color = "var(--color-brand-500)",
  valueFormatter,
  className,
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data, 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((v, i) => {
          const h = (v / max) * 100;
          const active = hover === i;
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {active && (
                <div className="pointer-events-none absolute -top-1 start-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink-950 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white shadow-pop">
                  {valueFormatter ? valueFormatter(v) : v}
                </div>
              )}
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-300",
                  active ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                )}
                style={{
                  height: `${Math.max(3, h)}%`,
                  background: color,
                }}
              />
            </div>
          );
        })}
      </div>
      {labels && (
        <div className="mt-2 flex gap-1.5">
          {labels.map((l, i) => (
            <span
              key={i}
              className={cn(
                "flex-1 truncate text-center text-[9px] font-semibold",
                hover === i ? "text-ink-900" : "text-ink-400",
              )}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Smooth area/line chart. */
export function LineChart({
  data,
  labels,
  height = 160,
  color = "var(--color-brand-600)",
  fill = "var(--color-brand-500)",
  valueFormatter,
  className,
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  fill?: string;
  valueFormatter?: (v: number) => string;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 100;
  const H = 40;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / Math.max(1, data.length - 1)) * W,
    y: H - ((v - min) / span) * (H - 4) - 2,
    v,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity="0.28" />
              <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="currentColor"
              className="text-ink-200"
              strokeWidth="0.2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill={`url(#g-${gid})`} />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 1.6 : 0.9}
              fill={hover === i ? color : "#fff"}
              stroke={color}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
              onMouseEnter={() => setHover(i)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink-950 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white shadow-pop"
            style={{
              insetInlineStart: `${(pts[hover].x / W) * 100}%`,
              top: `${(pts[hover].y / H) * 100}%`,
            }}
          >
            {valueFormatter ? valueFormatter(pts[hover].v) : pts[hover].v}
          </div>
        )}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between">
          {labels.map((l, i) => (
            <span
              key={i}
              className={cn("text-[9px] font-semibold", hover === i ? "text-ink-900" : "text-ink-400")}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Horizontal share bar (e.g. salon vs at-home). */
export function ShareBar({
  segments,
  className,
}: {
  segments: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const { locale } = useI18n();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink-100">
        {segments.map((s) => (
          <div
            key={s.label}
            className="h-full transition-all duration-500"
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            title={`${s.label} — ${Math.round((s.value / total) * 100)}%`}
          />
        ))}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-ink-700">{s.label}</span>
            <span className="tnum font-extrabold text-ink-950">
              {localDigits(Math.round((s.value / total) * 100), locale)}٪
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Donut chart for simple distributions. */
export function Donut({
  segments,
  size = 132,
  thickness = 16,
  center,
  className,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
  className?: string;
}) {
  const { locale } = useI18n();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-ink-100)" strokeWidth={thickness} />
          {segments.map((s) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {center && (
          <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
        )}
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-ink-700">{s.label}</span>
            <span className="tnum font-extrabold text-ink-950">
              {localDigits(Math.round((s.value / total) * 100), locale)}٪
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

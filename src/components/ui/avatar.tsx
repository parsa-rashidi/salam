"use client";

import { cn } from "@/lib/cn";

/** Initials-based avatar — keeps the prototype asset-free and consistent. */
export function Avatar({
  name,
  accent = "#0ba68b",
  size = 44,
  className,
  ring,
}: {
  name: string;
  accent?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const initials = name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-bold text-white select-none",
        ring && "ring-2 ring-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(140deg, ${accent} 0%, ${shade(accent, -26)} 100%)`,
      }}
      aria-hidden="true"
    >
      {initials || "؟"}
    </span>
  );
}

function shade(hex: string, percent: number) {
  const n = hex.replace("#", "");
  const num = parseInt(
    n.length === 3 ? n.split("").map((c) => c + c).join("") : n,
    16,
  );
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

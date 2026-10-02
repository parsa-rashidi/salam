"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * <img> wrapper with a graceful gradient placeholder while loading and
 * a neutral fallback if an asset is missing (handy in a prototype).
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  return (
    <span className={cn("relative block overflow-hidden bg-ink-200", className)}>
      {state !== "ready" && (
        <span
          className={cn(
            "absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-100 to-ink-200",
            state === "error" && "text-ink-400",
          )}
        >
          {state === "loading" && (
            <span className="absolute inset-0 animate-pulse bg-ink-200/70" />
          )}
          <ImageIcon size={26} className="relative" />
        </span>
      )}
      {state !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          className={cn(
            "relative h-full w-full object-cover transition-opacity duration-500",
            state === "ready" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </span>
  );
}

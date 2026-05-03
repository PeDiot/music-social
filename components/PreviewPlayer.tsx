"use client";

import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePreviewPlayer } from "@/lib/audio-context";

type Variant = "overlay" | "compact" | "large";

export function PreviewPlayer({
  url,
  variant = "overlay",
  label,
  className,
}: {
  url: string | null | undefined;
  variant?: Variant;
  label?: string;
  className?: string;
}) {
  const { isPlaying, progress, canPlay, toggle } = usePreviewPlayer(url);
  if (!canPlay) return null;

  const sizeBtn =
    variant === "large" ? "size-16" : variant === "compact" ? "size-9" : "size-12";
  const sizeIcon =
    variant === "large" ? "size-7" : variant === "compact" ? "size-4" : "size-6";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle();
      }}
      aria-label={isPlaying ? "Pause" : "Lecture extrait 30s"}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full",
        "bg-rose-500 text-white shadow-soft",
        "hover:bg-rose-600 active:scale-95 transition-all",
        sizeBtn,
        className,
      )}
    >
      {/* circular progress ring */}
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox="0 0 36 36"
        aria-hidden
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 16}`}
          strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress)}`}
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      </svg>
      {isPlaying ? (
        <Pause className={cn("relative z-10 fill-white", sizeIcon)} />
      ) : (
        <Play className={cn("relative z-10 fill-white translate-x-[1px]", sizeIcon)} />
      )}
      {label && (
        <span className="ml-2 text-sm font-medium hidden sm:inline">{label}</span>
      )}
    </button>
  );
}

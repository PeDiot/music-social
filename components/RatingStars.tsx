"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

type Props = {
  value: number; // 0..5 in steps of 0.5
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
  showValue?: boolean;
  className?: string;
};

export function RatingStars({
  value,
  onChange,
  size = 28,
  readOnly,
  showValue,
  className,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleClick = (e: React.MouseEvent, index: number) => {
    if (readOnly || !onChange) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const half = (e.clientX - rect.left) / rect.width < 0.5;
    const next = index + (half ? 0.5 : 1);
    onChange(next);
  };

  const handleMove = (e: React.MouseEvent, index: number) => {
    if (readOnly || !onChange) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const half = (e.clientX - rect.left) / rect.width < 0.5;
    setHover(index + (half ? 0.5 : 1));
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHover(null)}
    >
      {stars.map((s) => {
        const idx = s - 1;
        const fill = Math.min(1, Math.max(0, display - idx));
        return (
          <button
            type="button"
            key={s}
            disabled={readOnly}
            aria-label={`Note ${s}`}
            onClick={(e) => handleClick(e, idx)}
            onMouseMove={(e) => handleMove(e, idx)}
            className={cn(
              "relative transition-transform",
              !readOnly && "hover:scale-110 active:scale-95 cursor-pointer",
              readOnly && "cursor-default",
            )}
            style={{ width: size, height: size }}
          >
            <Star
              className="absolute inset-0 text-neutral-300 dark:text-neutral-700"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="text-rose-500 fill-rose-500"
                  style={{ width: size, height: size }}
                  strokeWidth={1.5}
                />
              </span>
            )}
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium tabular-nums text-neutral-600 dark:text-neutral-300">
          {display.toFixed(1)}
        </span>
      )}
    </div>
  );
}

import Image from "next/image";

import { cn } from "@/lib/cn";

type Props = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ src, name, size = 36, className }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        "bg-gradient-to-br from-rose-400 to-pink-600",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.floor(size * 0.4)),
      }}
      aria-label={name}
    >
      {initials(name) || "?"}
    </span>
  );
}

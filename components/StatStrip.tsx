import Image from "next/image";

import { cn } from "@/lib/cn";

type Item = {
  key: string;
  title: string;
  subtitle?: string;
  caption?: string;
  coverUrl: string;
  shape?: "square" | "circle";
};

export function StatStrip({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Item[];
  emptyLabel: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-[15px] font-semibold tracking-tight">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500 px-1">{emptyLabel}</p>
      ) : (
        <ul className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map((it) => (
            <li
              key={it.key}
              className="card-strong shadow-soft p-3 w-[160px] shrink-0"
            >
              <div className="aspect-square w-full overflow-hidden mb-2.5 bg-neutral-200 dark:bg-neutral-800 relative">
                <div
                  className={cn(
                    "absolute inset-0",
                    it.shape === "circle" ? "rounded-full" : "rounded-2xl",
                  )}
                  style={{ overflow: "hidden" }}
                >
                  {it.coverUrl ? (
                    <Image
                      src={it.coverUrl}
                      alt={it.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <p className="text-[13px] font-semibold leading-tight truncate">
                {it.title}
              </p>
              {it.subtitle && (
                <p className="text-[11px] text-neutral-500 truncate">
                  {it.subtitle}
                </p>
              )}
              {it.caption && (
                <p className="text-[11px] text-neutral-400 mt-1 truncate">
                  {it.caption}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

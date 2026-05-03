import { Loader2 } from "lucide-react";

export default function FeedLoading() {
  return (
    <div className="py-8 max-w-xl mx-auto">
      <div className="px-1 mb-6 space-y-2">
        <div className="h-8 w-32 bg-black/5 dark:bg-white/10 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-black/5 dark:bg-white/10 rounded-lg animate-pulse" />
      </div>
      <ol className="flex flex-col gap-6">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="card-strong shadow-soft p-5 animate-pulse space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-black/5 dark:bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3 w-32 rounded bg-black/5 dark:bg-white/10" />
                <div className="h-3 w-20 rounded bg-black/5 dark:bg-white/10" />
              </div>
            </div>
            <div className="aspect-square rounded-3xl bg-black/5 dark:bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-2/3 rounded bg-black/5 dark:bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-black/5 dark:bg-white/10" />
            </div>
          </li>
        ))}
      </ol>
      <div className="flex justify-center pt-8 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    </div>
  );
}

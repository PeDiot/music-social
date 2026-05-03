export default function ProfileLoading() {
  return (
    <div className="py-8 space-y-10 animate-pulse">
      <header className="flex items-center gap-4 px-1">
        <div className="size-20 rounded-full bg-black/5 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-black/5 dark:bg-white/10" />
          <div className="h-4 w-24 rounded bg-black/5 dark:bg-white/10" />
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="card-strong shadow-soft p-5 h-24" />
        <div className="card-strong shadow-soft p-5 h-24" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-32 rounded bg-black/5 dark:bg-white/10 ml-1" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="card-strong shadow-soft p-3 w-[160px] shrink-0"
              >
                <div className="aspect-square rounded-2xl bg-black/5 dark:bg-white/10 mb-2.5" />
                <div className="h-3 w-3/4 rounded bg-black/5 dark:bg-white/10 mb-1" />
                <div className="h-3 w-1/2 rounded bg-black/5 dark:bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

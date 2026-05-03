"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, Loader2, X } from "lucide-react";

import { cn } from "@/lib/cn";
import type { NormalizedTrack } from "@/features/deezer/types";

type Props = {
  onSelect: (track: NormalizedTrack) => void;
  placeholder?: string;
};

export function MusicSearchCombobox({
  onSelect,
  placeholder = "Cherche un morceau, artiste, album…",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (trimmed.length < 2) {
      // Defer state resets to a microtask to avoid sync setState in effect body
      const t = setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }

    const showLoading = setTimeout(() => setLoading(true), 0);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/deezer/search?q=${encodeURIComponent(trimmed)}&limit=8`,
          { signal: ctrl.signal },
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { tracks: NormalizedTrack[] };
        setResults(data.tracks ?? []);
        setActiveIndex(-1);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(t);
      clearTimeout(showLoading);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSelect(track: NormalizedTrack) {
    if (!track.previewUrl) {
      // Block selection without preview — show inline hint via aria
      inputRef.current?.focus();
      setOpen(true);
      return;
    }
    onSelect(track);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const t = results[activeIndex >= 0 ? activeIndex : 0];
      if (t) handleSelect(t);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40 text-[15px]"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Effacer"
          >
            <X className="size-4 text-neutral-400" />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-2 card-strong shadow-soft rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
          {results.map((t, i) => (
            <li key={t.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => handleSelect(t)}
                disabled={!t.previewUrl}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition",
                  i === activeIndex
                    ? "bg-black/5 dark:bg-white/10"
                    : "hover:bg-black/5 dark:hover:bg-white/5",
                  !t.previewUrl && "opacity-50 cursor-not-allowed",
                )}
              >
                {t.coverSmall ? (
                  <Image
                    src={t.coverSmall}
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-md size-12 object-cover shrink-0"
                  />
                ) : (
                  <div className="size-12 rounded-md bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{t.title}</p>
                  <p className="truncate text-[12px] text-neutral-500">
                    {t.artistName} · {t.albumTitle}
                  </p>
                </div>
                {!t.previewUrl && (
                  <span className="text-[11px] text-neutral-400 shrink-0">
                    Pas d&apos;extrait
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

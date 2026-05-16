"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";

import { MusicSearchCombobox } from "@/components/MusicSearchCombobox";
import { PreviewPlayer } from "@/components/PreviewPlayer";
import { RatingStars } from "@/components/RatingStars";
import { createPostAction, type CreatePostState } from "@/features/posts/actions";
import type { NormalizedTrack } from "@/features/deezer/types";
import { useAudio } from "@/lib/audio-context";

const initialState: CreatePostState = {};

function PublishButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full h-12 rounded-2xl bg-rose-500 text-white text-[15px] font-semibold hover:bg-rose-600 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {pending ? "Publication…" : "Publier"}
    </button>
  );
}

export function NewPostForm() {
  const [track, setTrack] = useState<NormalizedTrack | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [state, formAction] = useActionState(createPostAction, initialState);
  const { stop } = useAudio();

  function clearSelection() {
    stop();
    setTrack(null);
    setRating(0);
    setReview("");
  }

  return (
    <div className="space-y-6">
      {!track ? (
        <MusicSearchCombobox onSelect={setTrack} />
      ) : (
        <div className="card-strong shadow-soft p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-4">
            {track.coverLarge ? (
              <Image
                src={track.coverLarge}
                alt={`Cover ${track.albumTitle}`}
                width={120}
                height={120}
                className="size-28 sm:size-32 rounded-2xl object-cover shadow-soft shrink-0"
              />
            ) : (
              <div className="size-28 sm:size-32 rounded-2xl bg-neutral-200 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold leading-tight truncate">
                {track.title}
              </h2>
              <p className="text-sm text-neutral-500 truncate mt-1">
                {track.artistName}
              </p>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {track.albumTitle}
                {track.releaseYear ? ` · ${track.releaseYear}` : ""}
              </p>
              <div className="mt-3">
                <PreviewPlayer
                  url={track.previewUrl}
                  trackId={track.id}
                  variant="compact"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Changer de morceau"
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {track && (
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="deezerId" value={track.deezerId} />
          <input type="hidden" name="rating" value={rating} />

          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Ta note
            </p>
            <RatingStars
              value={rating}
              onChange={setRating}
              size={36}
              showValue
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="review"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Ton avis (optionnel)
            </label>
            <textarea
              id="review"
              name="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Une pépite, un classique, un guilty pleasure ?"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500/40 text-[15px] resize-none"
            />
            <p className="text-xs text-neutral-400 text-right tabular-nums">
              {review.length}/280
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-rose-600">{state.error}</p>
          )}

          <PublishButton disabled={rating < 0.5} />
        </form>
      )}
    </div>
  );
}

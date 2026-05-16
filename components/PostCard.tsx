import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { Avatar } from "@/components/Avatar";
import { PreviewPlayer } from "@/components/PreviewPlayer";
import { RatingStars } from "@/components/RatingStars";

export type PostCardData = {
  id: string;
  trackId: string;
  trackTitle: string;
  artistName: string;
  albumTitle: string;
  coverUrl: string;
  previewUrl: string;
  releaseType: "SINGLE" | "EP" | "ALBUM";
  releaseYear: number | null;
  rating: number;
  review: string | null;
  createdAt: Date;
  user: {
    username: string;
    name: string | null;
    image: string | null;
  };
};

const RELEASE_LABEL: Record<PostCardData["releaseType"], string> = {
  SINGLE: "Single",
  EP: "EP",
  ALBUM: "Album",
};

export function PostCard({ post }: { post: PostCardData }) {
  const displayName = post.user.name || post.user.username;
  const subtitle = [
    post.artistName,
    post.albumTitle,
    post.releaseYear ? String(post.releaseYear) : undefined,
    RELEASE_LABEL[post.releaseType],
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="card-strong shadow-soft overflow-hidden">
      {/* Header: author */}
      <header className="flex items-center gap-3 px-4 sm:px-5 pt-4">
        <Link href={`/profile/${post.user.username}`} className="shrink-0">
          <Avatar src={post.user.image} name={displayName} size={40} />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link
            href={`/profile/${post.user.username}`}
            className="block truncate text-[15px] font-semibold hover:underline"
          >
            {displayName}
          </Link>
          <p className="text-[12px] text-neutral-500 truncate">
            @{post.user.username} ·{" "}
            <time dateTime={post.createdAt.toISOString()}>
              {formatDistanceToNow(post.createdAt, {
                addSuffix: true,
                locale: fr,
              })}
            </time>
          </p>
        </div>
      </header>

      {/* Cover with floating play */}
      <div className="relative mx-4 sm:mx-5 mt-4 aspect-square rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-soft">
        {post.coverUrl && (
          <Image
            src={post.coverUrl}
            alt={`Cover de ${post.albumTitle}`}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover"
            priority={false}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <PreviewPlayer
            url={post.previewUrl}
            trackId={post.trackId}
            variant="overlay"
          />
        </div>
      </div>

      {/* Track info + rating */}
      <div className="px-4 sm:px-5 pt-4 pb-5 space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-[17px] leading-tight">
            {post.trackTitle}
          </h3>
          <p className="text-[13px] text-neutral-500 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <RatingStars value={post.rating} readOnly size={20} showValue />
        </div>
        {post.review && (
          <p className="text-[15px] leading-snug text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap">
            {post.review}
          </p>
        )}
      </div>
    </article>
  );
}

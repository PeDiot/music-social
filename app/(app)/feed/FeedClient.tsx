"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { PostCard, type PostCardData } from "@/components/PostCard";
import { loadFeedPage } from "@/features/posts/actions";

type RawPost = Omit<PostCardData, "createdAt"> & { createdAt: Date | string };

function hydratePost(p: RawPost): PostCardData {
  return { ...p, createdAt: new Date(p.createdAt) };
}

export function FeedClient({
  initialPosts,
  initialNextCursor,
}: {
  initialPosts: RawPost[];
  initialNextCursor: string | null;
}) {
  const [posts, setPosts] = useState<PostCardData[]>(() =>
    initialPosts.map(hydratePost),
  );
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (!cursor || isPending) return;
    startTransition(async () => {
      const next = await loadFeedPage(cursor);
      setPosts((prev) => [
        ...prev,
        ...next.posts.map((p) => hydratePost(p as unknown as RawPost)),
      ]);
      setCursor(next.nextCursor);
    });
  }, [cursor, isPending]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cursor, loadMore]);

  return (
    <div className="max-w-xl mx-auto">
      <ol className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ol>
      {cursor && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-10 text-neutral-400"
        >
          {isPending && <Loader2 className="size-5 animate-spin" />}
        </div>
      )}
      {!cursor && posts.length > 0 && (
        <p className="text-center py-10 text-xs text-neutral-400">
          Tu as tout vu pour le moment.
        </p>
      )}
    </div>
  );
}

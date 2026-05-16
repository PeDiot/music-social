import Link from "next/link";
import { Plus } from "lucide-react";

import { loadFeedPage } from "@/features/posts/actions";
import { FeedClient } from "./FeedClient";

export const metadata = { title: "Feed · Resound" };

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const initial = await loadFeedPage();

  return (
    <div className="py-8">
      <header className="px-1 mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Les dernières découvertes de la communauté.
          </p>
        </div>
      </header>

      {initial.posts.length === 0 ? (
        <div className="card-strong shadow-soft p-10 text-center max-w-xl mx-auto">
          <p className="text-neutral-500">
            Aucun post pour le moment. Sois le premier à publier !
          </p>
          <Link
            href="/post/new"
            className="inline-flex items-center gap-2 h-11 px-5 mt-5 rounded-2xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition"
          >
            <Plus className="size-4" />
            Publier un morceau
          </Link>
        </div>
      ) : (
        <FeedClient
          initialPosts={initial.posts}
          initialNextCursor={initial.nextCursor}
        />
      )}
    </div>
  );
}

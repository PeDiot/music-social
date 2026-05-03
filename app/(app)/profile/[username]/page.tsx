import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { StatStrip } from "@/components/StatStrip";
import { getProfileStats } from "@/features/profile/stats";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `@${username} · Resound` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const [stats, posts] = await Promise.all([
    getProfileStats(user.id),
    prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { username: true, name: true, image: true } },
      },
    }),
  ]);

  const isMe = session?.user?.id === user.id;
  const displayName = user.name || user.username;

  const ratingDisplay =
    stats.averageRating !== null ? stats.averageRating.toFixed(1) : "—";

  return (
    <div className="py-8 space-y-10">
      <header className="flex items-center gap-4 px-1">
        <Avatar src={user.image} name={displayName} size={80} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{displayName}</h1>
          <p className="text-sm text-neutral-500 truncate">@{user.username}</p>
        </div>
        {isMe && (
          <span className="hidden sm:inline-flex h-9 items-center px-4 rounded-2xl border border-black/10 dark:border-white/10 text-xs font-medium text-neutral-500">
            C&apos;est toi
          </span>
        )}
      </header>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="card-strong shadow-soft p-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Posts
          </p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{stats.totalPosts}</p>
        </div>
        <div className="card-strong shadow-soft p-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Note moyenne
          </p>
          <p className="text-3xl font-bold mt-1 tabular-nums">
            {ratingDisplay}
            <span className="text-base text-neutral-400 font-normal"> / 5</span>
          </p>
        </div>
      </section>

      <StatStrip
        title="Top artistes"
        emptyLabel="Pas encore d'artistes — commence à publier !"
        items={stats.topArtists.map((a) => ({
          key: a.artistName,
          title: a.artistName,
          subtitle: `${a.count} post${a.count > 1 ? "s" : ""}`,
          caption: `★ ${a.averageRating.toFixed(1)}`,
          coverUrl: a.coverUrl,
          shape: "circle",
        }))}
      />

      <StatStrip
        title="Top albums"
        emptyLabel="Pas encore d'albums."
        items={stats.topAlbums.map((a) => ({
          key: `${a.artistName}::${a.albumTitle}`,
          title: a.albumTitle,
          subtitle: a.artistName,
          caption: `★ ${a.averageRating.toFixed(1)} · ${a.count} post${a.count > 1 ? "s" : ""}`,
          coverUrl: a.coverUrl,
        }))}
      />

      <StatStrip
        title="Morceaux les plus partagés"
        emptyLabel="Pas encore de morceaux."
        items={stats.topTracks.map((t) => ({
          key: t.trackId,
          title: t.trackTitle,
          subtitle: t.artistName,
          caption: `★ ${t.averageRating.toFixed(1)} · ${t.count} post${t.count > 1 ? "s" : ""}`,
          coverUrl: t.coverUrl,
        }))}
      />

      <section className="space-y-4 max-w-xl mx-auto">
        <h2 className="px-1 text-[15px] font-semibold tracking-tight">
          Publications
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-neutral-500 px-1">
            Aucune publication pour l&apos;instant.
          </p>
        ) : (
          <ol className="flex flex-col gap-6">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p as unknown as PostCardData} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

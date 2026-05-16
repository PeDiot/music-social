import "server-only";

import { prisma } from "@/lib/prisma";

export type TopArtist = {
  artistName: string;
  count: number;
  averageRating: number;
  coverUrl: string;
};

export type TopAlbum = {
  albumTitle: string;
  artistName: string;
  count: number;
  averageRating: number;
  coverUrl: string;
};

export type TopTrack = {
  trackId: string;
  trackTitle: string;
  artistName: string;
  count: number;
  averageRating: number;
  coverUrl: string;
};

export type ProfileStats = {
  totalPosts: number;
  averageRating: number | null;
  topArtists: TopArtist[];
  topAlbums: TopAlbum[];
  topTracks: TopTrack[];
};

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [aggregate, artists, albums, tracks, latestSamples] = await Promise.all([
    prisma.post.aggregate({
      where: { userId },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    prisma.post.groupBy({
      by: ["artistName"],
      where: { userId },
      _count: { _all: true },
      _avg: { rating: true },
      orderBy: { _count: { artistName: "desc" } },
      take: 3,
    }),
    prisma.post.groupBy({
      by: ["albumTitle", "artistName"],
      where: { userId },
      _count: { _all: true },
      _avg: { rating: true },
      orderBy: { _count: { albumTitle: "desc" } },
      take: 3,
    }),
    prisma.post.groupBy({
      by: ["trackId", "trackTitle", "artistName"],
      where: { userId },
      _count: { _all: true },
      _avg: { rating: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 3,
    }),
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        artistName: true,
        albumTitle: true,
        trackId: true,
        coverUrl: true,
      },
      take: 200,
    }),
  ]);

  const coverByArtist = new Map<string, string>();
  const coverByAlbum = new Map<string, string>();
  const coverByTrack = new Map<string, string>();
  for (const s of latestSamples) {
    if (!coverByArtist.has(s.artistName)) coverByArtist.set(s.artistName, s.coverUrl);
    const albumKey = `${s.artistName}::${s.albumTitle}`;
    if (!coverByAlbum.has(albumKey)) coverByAlbum.set(albumKey, s.coverUrl);
    if (!coverByTrack.has(s.trackId)) coverByTrack.set(s.trackId, s.coverUrl);
  }

  return {
    totalPosts: aggregate._count._all,
    averageRating: aggregate._avg.rating ?? null,
    topArtists: artists.map((a) => ({
      artistName: a.artistName,
      count: a._count._all,
      averageRating: a._avg.rating ?? 0,
      coverUrl: coverByArtist.get(a.artistName) ?? "",
    })),
    topAlbums: albums.map((a) => ({
      albumTitle: a.albumTitle,
      artistName: a.artistName,
      count: a._count._all,
      averageRating: a._avg.rating ?? 0,
      coverUrl: coverByAlbum.get(`${a.artistName}::${a.albumTitle}`) ?? "",
    })),
    topTracks: tracks.map((t) => ({
      trackId: t.trackId,
      trackTitle: t.trackTitle,
      artistName: t.artistName,
      count: t._count._all,
      averageRating: t._avg.rating ?? 0,
      coverUrl: coverByTrack.get(t.trackId) ?? "",
    })),
  };
}

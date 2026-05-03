"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTrack } from "@/features/deezer/client";
import type { ReleaseType } from "@/features/deezer/types";

const createPostSchema = z.object({
  deezerId: z.coerce.number().int().positive(),
  rating: z.coerce
    .number()
    .min(0.5)
    .max(5)
    .refine((v) => (v * 2) % 1 === 0, "Notation par pas de 0.5"),
  review: z.string().trim().max(280).optional().or(z.literal("")),
});

export type CreatePostState = {
  error?: string;
  ok?: boolean;
};

export async function createPostAction(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié" };
  }

  const parsed = createPostSchema.safeParse({
    deezerId: formData.get("deezerId"),
    rating: formData.get("rating"),
    review: formData.get("review"),
  });
  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const { deezerId, rating, review } = parsed.data;

  // Re-fetch from Deezer server-side; never trust client snapshot
  const track = await getTrack(deezerId);
  if (!track) {
    return { error: "Morceau introuvable sur Deezer" };
  }
  if (!track.previewUrl) {
    return { error: "Ce morceau n'a pas d'extrait de 30 secondes disponible" };
  }

  const releaseType: ReleaseType = track.releaseType ?? "SINGLE";

  await prisma.post.create({
    data: {
      userId: session.user.id,
      trackId: track.id,
      trackTitle: track.title,
      artistId: String(track.artistId),
      artistName: track.artistName,
      albumId: String(track.albumId),
      albumTitle: track.albumTitle,
      coverUrl: track.coverLarge || track.coverSmall,
      previewUrl: track.previewUrl,
      releaseType,
      durationSec: track.durationSec,
      releaseYear: track.releaseYear,
      rating,
      review: review?.trim() ? review.trim() : null,
    },
  });

  revalidatePath("/feed");
  revalidatePath(`/profile/${session.user.username}`);
  redirect("/feed");
}

const FEED_PAGE_SIZE = 15;

export async function loadFeedPage(cursor?: string) {
  const posts = await prisma.post.findMany({
    take: FEED_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, name: true, image: true } },
    },
  });
  const hasMore = posts.length > FEED_PAGE_SIZE;
  const slice = hasMore ? posts.slice(0, FEED_PAGE_SIZE) : posts;
  return {
    posts: slice,
    nextCursor: hasMore ? slice[slice.length - 1].id : null,
  };
}

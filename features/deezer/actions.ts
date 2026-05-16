"use server";

import { getTrack } from "@/features/deezer/client";

/** Fresh Deezer preview URL (signed tokens expire). */
export async function refreshPreviewUrl(
  trackId: string,
): Promise<string | null> {
  const match = /^deezer:(\d+)$/.exec(trackId);
  if (!match) return null;
  const track = await getTrack(Number(match[1]));
  return track?.previewUrl ?? null;
}

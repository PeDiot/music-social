import "server-only";

import {
  type DeezerAlbum,
  type DeezerError,
  type DeezerSearchResponse,
  type DeezerTrack,
  type NormalizedTrack,
  type ReleaseType,
} from "./types";

const BASE = "https://api.deezer.com";

class DeezerApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

async function deezerFetch<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new DeezerApiError(
      `Deezer ${res.status}: ${res.statusText}`,
      res.status,
    );
  }
  const json = (await res.json()) as T | DeezerError;
  if (json && typeof json === "object" && "error" in json) {
    const err = (json as DeezerError).error;
    throw new DeezerApiError(`Deezer: ${err.message}`, err.code);
  }
  return json as T;
}

function fallbackCover(album: DeezerAlbum, size: "small" | "large") {
  if (size === "small") {
    return album.cover_medium ?? album.cover ?? album.cover_big ?? album.cover_xl ?? "";
  }
  return album.cover_xl ?? album.cover_big ?? album.cover_medium ?? album.cover ?? "";
}

function toReleaseType(record_type?: string): ReleaseType | undefined {
  if (!record_type) return undefined;
  const v = record_type.toLowerCase();
  if (v === "single") return "SINGLE";
  if (v === "ep") return "EP";
  if (v === "album") return "ALBUM";
  return undefined;
}

function yearOf(dateIso?: string): number | undefined {
  if (!dateIso) return undefined;
  const y = Number(dateIso.slice(0, 4));
  return Number.isFinite(y) ? y : undefined;
}

export function normalizeTrack(
  track: DeezerTrack,
  album?: DeezerAlbum,
): NormalizedTrack {
  const albumData = album ?? track.album;
  return {
    id: `deezer:${track.id}`,
    deezerId: track.id,
    title: track.title,
    artistId: track.artist.id,
    artistName: track.artist.name,
    albumId: albumData.id,
    albumTitle: albumData.title,
    coverSmall: fallbackCover(albumData, "small"),
    coverLarge: fallbackCover(albumData, "large"),
    previewUrl: track.preview && track.preview.length > 0 ? track.preview : null,
    durationSec: track.duration,
    releaseYear: yearOf(albumData.release_date),
    releaseType: toReleaseType(albumData.record_type),
  };
}

export async function searchTracks(query: string, limit = 8): Promise<NormalizedTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    output: "json",
  });
  const res = await deezerFetch<DeezerSearchResponse>(
    `/search?${params.toString()}`,
    300,
  );
  return res.data.map((t) => normalizeTrack(t));
}

export async function getTrack(deezerId: number): Promise<NormalizedTrack | null> {
  try {
    const track = await deezerFetch<DeezerTrack>(`/track/${deezerId}`);
    let album: DeezerAlbum | undefined;
    try {
      album = await deezerFetch<DeezerAlbum>(`/album/${track.album.id}`);
    } catch {
      // Tolerate album fetch failure — fall back to embedded data
    }
    return normalizeTrack(track, album);
  } catch (err) {
    if (err instanceof DeezerApiError && err.status === 404) return null;
    throw err;
  }
}

export { DeezerApiError };

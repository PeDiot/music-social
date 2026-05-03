export type DeezerArtist = {
  id: number;
  name: string;
  picture?: string;
  picture_medium?: string;
  picture_xl?: string;
};

export type DeezerAlbum = {
  id: number;
  title: string;
  cover?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
  release_date?: string;
  record_type?: "single" | "ep" | "album" | string;
};

export type DeezerTrack = {
  id: number;
  title: string;
  title_short?: string;
  duration: number;
  preview: string | null;
  artist: DeezerArtist;
  album: DeezerAlbum;
};

export type DeezerSearchResponse = {
  data: DeezerTrack[];
  total: number;
  next?: string;
};

export type DeezerError = {
  error: { type: string; message: string; code: number };
};

// Internal normalized types

export type ReleaseType = "SINGLE" | "EP" | "ALBUM";

export type NormalizedTrack = {
  id: string; // "deezer:<id>"
  deezerId: number;
  title: string;
  artistId: number;
  artistName: string;
  albumId: number;
  albumTitle: string;
  coverSmall: string;
  coverLarge: string;
  previewUrl: string | null;
  durationSec: number;
  releaseYear?: number;
  releaseType?: ReleaseType;
};

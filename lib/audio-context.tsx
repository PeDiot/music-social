"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { refreshPreviewUrl } from "@/features/deezer/actions";

type AudioState = {
  currentUrl: string | null;
  isPlaying: boolean;
  progress: number;
};

type AudioActions = {
  toggle: (url: string) => Promise<boolean>;
  stop: () => void;
};

const AudioContext = createContext<(AudioState & AudioActions) | null>(null);

function waitForCanPlay(el: HTMLAudioElement): Promise<boolean> {
  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const cleanup = () => {
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("error", onError);
    };
    const onReady = () => {
      cleanup();
      resolve(true);
    };
    const onError = () => {
      cleanup();
      resolve(false);
    };
    el.addEventListener("canplay", onReady, { once: true });
    el.addEventListener("error", onError, { once: true });
    el.load();
  });
}

async function attemptPlay(el: HTMLAudioElement): Promise<boolean> {
  try {
    await el.play();
    return true;
  } catch {
    return false;
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const getAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "none";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    currentUrlRef.current = currentUrl;
  }, [currentUrl]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const el = getAudio();
    if (!el) return;

    const handleTime = () => {
      if (!el.duration) return;
      setProgress(el.currentTime / el.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    el.addEventListener("timeupdate", handleTime);
    el.addEventListener("ended", handleEnded);
    el.addEventListener("pause", handlePause);
    el.addEventListener("play", handlePlay);

    return () => {
      el.removeEventListener("timeupdate", handleTime);
      el.removeEventListener("ended", handleEnded);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("play", handlePlay);
    };
  }, [getAudio]);

  const playUrl = useCallback(
    async (url: string): Promise<boolean> => {
      const el = getAudio();
      if (!el) return false;

      if (currentUrlRef.current !== url) {
        el.src = url;
        currentUrlRef.current = url;
        setCurrentUrl(url);
        setProgress(0);
      }

      if (await attemptPlay(el)) return true;
      if (!(await waitForCanPlay(el))) return false;
      return attemptPlay(el);
    },
    [getAudio],
  );

  const toggle = useCallback(
    async (url: string): Promise<boolean> => {
      const el = getAudio();
      if (!el) return false;

      if (currentUrlRef.current === url && isPlayingRef.current) {
        el.pause();
        return true;
      }

      return playUrl(url);
    },
    [getAudio, playUrl],
  );

  const stop = useCallback(() => {
    const el = getAudio();
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    currentUrlRef.current = null;
    setCurrentUrl(null);
    setIsPlaying(false);
    setProgress(0);
  }, [getAudio]);

  const value = useMemo(
    () => ({ currentUrl, isPlaying, progress, toggle, stop }),
    [currentUrl, isPlaying, progress, toggle, stop],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

export function usePreviewPlayer(
  url: string | null | undefined,
  options?: { trackId?: string | null },
) {
  const { currentUrl, isPlaying, progress, toggle } = useAudio();
  const trackId = options?.trackId;
  const [refreshed, setRefreshed] = useState<{
    source: string;
    preview: string;
  } | null>(null);

  const resolvedUrl = useMemo(() => {
    if (!url) return null;
    if (refreshed?.source === url) return refreshed.preview;
    return url;
  }, [url, refreshed]);

  const isCurrent = !!resolvedUrl && currentUrl === resolvedUrl;

  const play = useCallback(async () => {
    if (!resolvedUrl) return;

    if (await toggle(resolvedUrl)) return;
    if (!trackId || !url) return;

    const fresh = await refreshPreviewUrl(trackId);
    if (!fresh || fresh === resolvedUrl) return;

    setRefreshed({ source: url, preview: fresh });
    await toggle(fresh);
  }, [resolvedUrl, url, toggle, trackId]);

  return {
    isPlaying: isCurrent && isPlaying,
    progress: isCurrent ? progress : 0,
    canPlay: !!resolvedUrl,
    toggle: play,
  };
}

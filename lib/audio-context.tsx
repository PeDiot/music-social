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

type AudioState = {
  currentUrl: string | null;
  isPlaying: boolean;
  progress: number;
};

type AudioActions = {
  toggle: (url: string) => void;
  stop: () => void;
};

const AudioContext = createContext<(AudioState & AudioActions) | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Lazy create the singleton <audio> element on the client only
  const getAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "none";
      el.crossOrigin = "anonymous";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

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

  const toggle = useCallback(
    (url: string) => {
      const el = getAudio();
      if (!el) return;
      if (currentUrl === url && isPlaying) {
        el.pause();
        return;
      }
      if (currentUrl !== url) {
        el.src = url;
        setCurrentUrl(url);
        setProgress(0);
      }
      void el.play().catch(() => setIsPlaying(false));
    },
    [currentUrl, isPlaying, getAudio],
  );

  const stop = useCallback(() => {
    const el = getAudio();
    if (!el) return;
    el.pause();
    el.currentTime = 0;
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

export function usePreviewPlayer(url: string | null | undefined) {
  const { currentUrl, isPlaying, progress, toggle } = useAudio();
  const isCurrent = !!url && currentUrl === url;
  return {
    isPlaying: isCurrent && isPlaying,
    progress: isCurrent ? progress : 0,
    canPlay: !!url,
    toggle: () => {
      if (url) toggle(url);
    },
  };
}

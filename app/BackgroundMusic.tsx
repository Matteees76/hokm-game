"use client";

import {
  useEffect,
  useRef,
} from "react";

export default function BackgroundMusic() {
  const musicRef =
    useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const music =
      new Audio("/sounds/music.mp3");

    music.loop = true;
    music.volume = 0.2;

    musicRef.current = music;

    const startMusic = () => {
      if (music.paused) {
        music.play().catch(() => {});
      }

      document.removeEventListener(
        "click",
        startMusic
      );
    };

    document.addEventListener(
      "click",
      startMusic
    );

    return () => {
      document.removeEventListener(
        "click",
        startMusic
      );

      music.pause();
    };
  }, []);

  return null;
}
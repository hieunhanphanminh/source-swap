import { useRef, useCallback, useState, useEffect } from "react";

export function useMelody() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const play = useCallback(() => {
    if (playing) { stop(); return; }

    if (!audioRef.current) {
      const audio = new Audio("/audio/soundtrack.webm");
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
      audio.addEventListener("ended", () => setPlaying(false));
    }

    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [playing, stop]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { playing, play, stop };
}

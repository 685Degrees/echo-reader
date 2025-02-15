import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!text) return;

    try {
      if (!audioRef.current) {
        // First time playing - fetch audio from API
        const response = await fetch("/api/tts-eleven", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) throw new Error("Failed to generate speech");

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);

        newAudio.onended = () => setIsPlaying(false);
        newAudio.ontimeupdate = () => {
          setCurrentTimeSeconds(newAudio.currentTime);
        };

        audioRef.current = newAudio;
        await newAudio.play();
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(
        audioRef.current.currentTime + 30,
        audioRef.current.duration
      );
      audioRef.current.currentTime = newTime;
      setCurrentTimeSeconds(newTime);
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 30, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTimeSeconds(newTime);
    }
  };

  const handleProgressChange = (progressPercent: number) => {
    if (audioRef.current) {
      const newTime = (progressPercent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTimeSeconds(newTime);
    }
  };

  return {
    isPlaying,
    currentTimeSeconds,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
  };
}

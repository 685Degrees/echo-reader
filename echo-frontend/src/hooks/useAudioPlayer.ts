import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Prepare audio when text changes
  useEffect(() => {
    const prepareAudio = async () => {
      if (!text || audioRef.current) return;

      setIsLoading(true);
      try {
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
        newAudio.onloadedmetadata = () => {
          setDuration(newAudio.duration);
        };

        audioRef.current = newAudio;
        setIsLoading(false);
      } catch (error) {
        console.error("Error preparing audio:", error);
        setIsLoading(false);
      }
    };

    prepareAudio();
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!text || !audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
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
      const wasPlaying = !audioRef.current.paused;
      if (wasPlaying) {
        audioRef.current.pause();
      }

      const newTime = (progressPercent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTimeSeconds(newTime);

      if (wasPlaying) {
        audioRef.current.play();
      }
    }
  };

  return {
    isPlaying,
    isLoading,
    currentTimeSeconds,
    duration,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
  };
}

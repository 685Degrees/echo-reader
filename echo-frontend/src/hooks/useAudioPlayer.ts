import { useState, useRef, useEffect } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  const setupAudioStream = async (stream: ReadableStream<Uint8Array>) => {
    if (audioRef.current) {
      // Clean up existing audio
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }

    setIsLoading(true);
    setBufferingProgress(0);
    setDuration(0);

    try {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      const audioUrl = URL.createObjectURL(mediaSource);
      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;

      newAudio.onloadedmetadata = () => {
        if (
          newAudio.duration &&
          !isNaN(newAudio.duration) &&
          newAudio.duration !== Infinity
        ) {
          setDuration(newAudio.duration);
        }
      };

      newAudio.ondurationchange = () => {
        if (
          newAudio.duration &&
          !isNaN(newAudio.duration) &&
          newAudio.duration !== Infinity
        ) {
          setDuration(newAudio.duration);
        }
      };

      newAudio.onended = () => setIsPlaying(false);
      newAudio.ontimeupdate = () => {
        setCurrentTimeSeconds(newAudio.currentTime);
      };

      await new Promise<void>((resolve) => {
        mediaSource.addEventListener("sourceopen", async () => {
          const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          sourceBufferRef.current = sourceBuffer;

          const reader = stream.getReader();
          let receivedLength = 0;

          // Read chunks
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Wait if the buffer is updating
            await new Promise<void>((resolve) => {
              const checkBuffer = () => {
                if (!sourceBuffer.updating) {
                  resolve();
                } else {
                  setTimeout(checkBuffer, 10);
                }
              };
              checkBuffer();
            });

            // Append chunk to source buffer
            sourceBuffer.appendBuffer(value);
            receivedLength += value.length;

            // Update buffering progress
            setBufferingProgress(
              Math.min((receivedLength / (1024 * 1024)) * 20, 100)
            );
          }

          // Close media source when all chunks are received
          if (mediaSource.readyState === "open") {
            sourceBuffer.addEventListener("updateend", () => {
              if (mediaSource.readyState === "open") {
                mediaSource.endOfStream();
                setBufferingProgress(100);
              }
            });
          }
          resolve();
        });
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error preparing audio:", error);
      setIsLoading(false);
    }
  };

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
    if (!audioRef.current || isLoading) return;

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
    bufferingProgress,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
    setIsPlaying,
    setupAudioStream,
  };
}

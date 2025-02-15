import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const chunksReceivedRef = useRef<number>(0);
  const totalChunksRef = useRef<number>(0);

  // Prepare audio when text changes
  useEffect(() => {
    const prepareAudio = async () => {
      if (!text || audioRef.current) return;

      setIsLoading(true);
      setBufferingProgress(0);
      setDuration(0); // Reset duration when starting new audio

      try {
        // Create MediaSource instance
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        const audioUrl = URL.createObjectURL(mediaSource);
        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;

        // Set up event listeners before starting stream
        newAudio.onloadedmetadata = () => {
          if (newAudio.duration && !isNaN(newAudio.duration)) {
            setDuration(newAudio.duration);
          }
        };

        newAudio.ondurationchange = () => {
          if (newAudio.duration && !isNaN(newAudio.duration)) {
            setDuration(newAudio.duration);
          }
        };

        newAudio.onended = () => setIsPlaying(false);
        newAudio.ontimeupdate = () => {
          setCurrentTimeSeconds(newAudio.currentTime);
        };

        mediaSource.addEventListener("sourceopen", async () => {
          const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          sourceBufferRef.current = sourceBuffer;

          // Start streaming audio
          const response = await fetch("/api/tts-eleven", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
          });

          if (!response.ok) throw new Error("Failed to generate speech");
          if (!response.body) throw new Error("Response body is null");

          const reader = response.body.getReader();
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

            // Update buffering progress based on received data
            // Note: This is an estimate since we don't know the total size
            setBufferingProgress(
              Math.min((receivedLength / (1024 * 1024)) * 20, 100)
            ); // Assuming ~1MB total size
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
        });

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
    bufferingProgress,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
  };
}

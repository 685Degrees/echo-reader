import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const [estimatedTotalDuration, setEstimatedTotalDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const receivedBytesRef = useRef(0);

  // Calculate estimated duration based on text length and average speaking rate
  useEffect(() => {
    if (text) {
      // Estimate ~3 words per second for speech
      const wordCount = text.split(/\s+/).length;
      const estimatedSeconds = wordCount / 3;
      setEstimatedTotalDuration(estimatedSeconds);
    }
  }, [text]);

  // Prepare audio when text changes
  useEffect(() => {
    const prepareAudio = async () => {
      if (!text || audioRef.current) return;

      setIsLoading(true);
      setBufferingProgress(0);
      setDuration(0);
      receivedBytesRef.current = 0;

      try {
        // Create MediaSource instance
        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        const audioUrl = URL.createObjectURL(mediaSource);
        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;

        // Set up event listeners before starting stream
        newAudio.onloadedmetadata = () => {
          if (
            newAudio.duration &&
            !isNaN(newAudio.duration) &&
            newAudio.duration !== Infinity
          ) {
            console.log("on loaded metadata duration", newAudio.duration);
            setDuration(newAudio.duration);
          }
        };

        newAudio.ondurationchange = () => {
          if (
            newAudio.duration &&
            !isNaN(newAudio.duration) &&
            newAudio.duration !== Infinity
          ) {
            console.log("on duration change duration", newAudio.duration);
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

            sourceBuffer.appendBuffer(value);
            receivedBytesRef.current += value.length;

            // Update buffering progress based on estimated total size
            // Assuming ~15KB per second of audio
            const estimatedTotalBytes = estimatedTotalDuration * 15 * 1024;
            setBufferingProgress(
              Math.min(
                (receivedBytesRef.current / estimatedTotalBytes) * 100,
                99
              )
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
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error preparing audio:", error);
        setIsLoading(false);
      }
    };

    prepareAudio();
  }, [text, estimatedTotalDuration]);

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

      // Use the actual duration if available, otherwise use estimated duration
      const totalDuration = duration || estimatedTotalDuration;
      const newTime = (progressPercent / 100) * totalDuration;

      // Clamp the new time to the available duration
      const clampedTime = Math.min(newTime, audioRef.current.duration || 0);
      audioRef.current.currentTime = clampedTime;
      setCurrentTimeSeconds(clampedTime);

      if (wasPlaying) {
        audioRef.current.play();
      }
    }
  };

  // Return the current time as a percentage of the total estimated/actual duration
  const getCurrentProgress = () => {
    const totalDuration = duration || estimatedTotalDuration;
    if (!totalDuration) return 0;
    return (currentTimeSeconds / totalDuration) * 100;
  };

  return {
    isPlaying,
    isLoading,
    currentTimeSeconds,
    duration: duration || estimatedTotalDuration, // Use estimated duration until actual is available
    bufferingProgress,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
    setIsPlaying,
    getCurrentProgress, // Add this new helper function
  };
}

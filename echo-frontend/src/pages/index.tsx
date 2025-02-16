import { useState } from "react";
import { BookDropZone } from "@/components/BookDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Header } from "@/components/Header";
import { generateSpeech, saveAudioStream } from "@/lib/utils";
import { Book } from "@/types/book";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [bookText, setBookText] = useState("");
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [saveStream, setSaveStream] = useState<ReadableStream | null>(null);

  const { isConnected, isConnecting, startSession, stopSession, error } =
    useWebRTC();

  const {
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
    isAudioReady,
  } = useAudioPlayer();

  const handleTextExtracted = async (text: string) => {
    setBookText(text);
    try {
      const stream = await generateSpeech(text);
      // Clone the stream for potential future saving
      const [playStream, saveStream] = stream.tee();

      // Store the save stream for later use when saving
      setSaveStream(saveStream);

      // Setup audio for preview/playback
      await setupAudioStream(playStream);
    } catch (error) {
      console.error("Error generating speech:", error);
    }
  };

  // New function to handle saving audio
  const handleSaveAudio = async (): Promise<string> => {
    if (!saveStream) {
      throw new Error("No audio stream available");
    }

    const bookId = uuidv4();
    const audioUrl = await saveAudioStream(saveStream, bookId);
    return audioUrl;
  };

  const handleDiscussToggle = async () => {
    if (isDiscussing) {
      setIsDiscussing(false);
      setIsPlaying(true);
      stopSession();
    } else {
      setIsDiscussing(true);
      // Pause audio when starting discussion
      if (isPlaying) {
        handlePlayPause();
      }
      if (!isConnected && !isConnecting) {
        await startSession();
      }
    }
  };

  const getButtonText = () => {
    if (isConnecting) return "Connecting...";
    if (isDiscussing) return "Resume listening";
    if (isPlaying) return "Pause & discuss";
    return "Discuss";
  };

  return (
    <div className="bg-primary-100 min-h-screen ">
      <Header />
      <main className="pt-20 flex flex-col items-center justify-center p-8 space-y-8">
        <BookDropZone
          onTextExtracted={handleTextExtracted}
          onSaveAudio={handleSaveAudio}
          text={bookText}
          duration={duration}
          isAudioReady={isAudioReady}
        />

        {bookText && (
          <div className="w-full max-w-2xl space-y-8 sm:space-y-12 flex flex-col items-center justify-center">
            <AudioProgress
              progressPercent={(currentTimeSeconds / (duration || 1)) * 100}
              bufferingProgress={bufferingProgress}
              duration={duration}
              currentTime={currentTimeSeconds}
              onChange={handleProgressChange}
            />
            <AudioControls
              isPlaying={isPlaying}
              isLoading={isLoading}
              onPlayPause={handlePlayPause}
              onSkipForward={handleSkipForward}
              onSkipBack={handleSkipBack}
            />
            <button
              onClick={handleDiscussToggle}
              disabled={isConnecting}
              className="w-full py-6 sm:py-8 px-4 text-lg sm:text-xl font-medium bg-primary-800 text-white rounded-2xl max-w-sm hover:bg-primary-600 transition duration-200 disabled:bg-primary-400"
            >
              {getButtonText()}
            </button>

            {isDiscussing && error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

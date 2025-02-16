import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BookDropZone } from "@/components/BookDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Header } from "@/components/Header";
import { getBookById } from "@/lib/bookStorage";
import { Book } from "@/types/book";

export default function BookViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState<Book | null>(null);
  const [isDiscussing, setIsDiscussing] = useState(false);

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
    setupAudioFromUrl,
  } = useAudioPlayer();

  useEffect(() => {
    if (typeof id === "string") {
      const loadedBook = getBookById(id);
      if (loadedBook) {
        setBook(loadedBook);
        if (loadedBook.audioUrl) {
          setupAudioFromUrl(loadedBook.audioUrl);
        }
      } else {
        router.push("/library");
      }
    }
  }, [id, router, setupAudioFromUrl]);

  const { isConnected, isConnecting, startSession, stopSession, error } =
    useWebRTC();

  const handleDiscussToggle = async () => {
    if (isDiscussing) {
      setIsDiscussing(false);
      setIsPlaying(true);
      stopSession();
    } else {
      setIsDiscussing(true);
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

  if (!book) {
    return null;
  }

  return (
    <div className="bg-primary-100 min-h-screen">
      <Header />
      <main className="pt-20 flex flex-col items-center justify-center p-8 space-y-8">
        <div className="border border-gray-300 rounded-xl bg-white/70 shadow-sm w-full max-w-2xl">
          <div className="border-b border-gray-300 p-4 bg-primary-50 rounded-t-xl">
            <h1 className="text-2xl font-semibold text-gray-800">
              {book.title}
            </h1>
          </div>
          <div className="max-h-[300px] overflow-y-auto rounded-lg px-8 my-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {book.text}
            </p>
          </div>
        </div>

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
      </main>
    </div>
  );
}

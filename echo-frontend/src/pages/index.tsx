import { useState } from "react";
import { BookDropZone } from "@/components/BookDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function Home() {
  const [bookText, setBookText] = useState("");
  const [isDiscussing, setIsDiscussing] = useState(false);

  // Use the audio player hook for actual audio playback
  const {
    isPlaying,
    currentTimeSeconds,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
  } = useAudioPlayer(bookText);

  const handleDiscussToggle = () => {
    if (isDiscussing) {
      setIsDiscussing(false);
    } else {
      setIsDiscussing(true);
      // Pause audio when starting discussion
      if (isPlaying) {
        handlePlayPause();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8">
      <BookDropZone onTextExtracted={setBookText} />

      {bookText && (
        <div className="w-full max-w-2xl space-y-8 sm:space-y-12 flex flex-col items-center justify-center">
          <AudioProgress
            progress={(currentTimeSeconds / (6 * 60 * 60)) * 100}
            onChange={handleProgressChange}
          />
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSkipForward={handleSkipForward}
            onSkipBack={handleSkipBack}
          />
          <button
            onClick={handleDiscussToggle}
            className="w-full py-6 sm:py-8 px-4 text-lg sm:text-xl font-medium bg-black text-white rounded-2xl max-w-sm hover:bg-gray-700 transition duration-200"
          >
            {isDiscussing ? "Return to listening" : "Discuss"}
          </button>
        </div>
      )}
      {/* 
      {bookText && (
        <div className="w-full max-w-2xl p-4 border border-gray-300 rounded-xl overflow-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{bookText}</p>
        </div>
      )} */}
    </div>
  );
}

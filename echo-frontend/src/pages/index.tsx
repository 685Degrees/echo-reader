import { useState } from "react";
import { PDFDropZone } from "@/components/PDFDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";

export default function Home() {
  const [pdfText, setPdfText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const handlePlayPauseClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(currentTimeSeconds + 30, 6 * 60 * 60); // Max 6 hours
    setCurrentTimeSeconds(newTime);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(currentTimeSeconds - 30, 0); // Min 0 seconds
    setCurrentTimeSeconds(newTime);
  };

  const handleProgressChange = (progressPercent: number) => {
    const newTimeSeconds = Math.round((progressPercent / 100) * 6 * 60 * 60);
    setCurrentTimeSeconds(newTimeSeconds);
  };

  const handleDiscussToggle = () => {
    if (isDiscussing) {
      setIsDiscussing(false);
      setIsPlaying(true);
    } else {
      setIsDiscussing(true);
      setIsPlaying(false);
    }
  };

  const getButtonText = () => {
    if (isDiscussing) return "Resume listening";
    if (isPlaying) return "Pause & discuss";
    return "Discuss";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8">
      <PDFDropZone onTextExtracted={setPdfText} />

      {pdfText && (
        <div className="w-full max-w-2xl space-y-8 sm:space-y-12 flex flex-col items-center justify-center">
          <AudioProgress
            progress={(currentTimeSeconds / (6 * 60 * 60)) * 100}
            onChange={handleProgressChange}
          />
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPauseClick}
            onSkipForward={handleSkipForward}
            onSkipBack={handleSkipBack}
          />
          <button
            onClick={handleDiscussToggle}
            className="w-full py-6 sm:py-8 px-4 text-lg sm:text-xl font-medium bg-black text-white rounded-2xl max-w-sm hover:bg-gray-700 transition duration-200"
          >
            {getButtonText()}
          </button>
        </div>
      )}

      {/* {pdfText && (
        <div className="w-full max-w-2xl p-4 border border-gray-300 rounded-xl overflow-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{pdfText}</p>
        </div>
      )} */}
    </div>
  );
}

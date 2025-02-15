import { useState } from "react";
import { PDFDropZone } from "@/components/PDFDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";

export default function Home() {
  const [pdfText, setPdfText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDiscussing, setIsDiscussing] = useState(false);

  const handlePlayPauseClick = () => {
    setIsPlaying(!isPlaying);
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
          <AudioProgress progress={progress} onChange={setProgress} />
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPauseClick}
            onForward={() => console.log("Forward 30s")}
            onRewind={() => console.log("Rewind 30s")}
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

import { useState } from "react";
import { PDFDropZone } from "@/components/PDFDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";

export default function Home() {
  const [pdfText, setPdfText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8">
      <PDFDropZone onTextExtracted={setPdfText} />

      <div className="w-full max-w-2xl space-y-12">
        <AudioProgress progress={progress} onChange={setProgress} />
        <AudioControls
          isPlaying={isPlaying}
          onPlayPause={() => {
            setIsPlaying(!isPlaying);
            console.log("Play/Pause");
          }}
          onForward={() => console.log("Forward 30s")}
          onRewind={() => console.log("Rewind 30s")}
        />
      </div>

      {/* {pdfText && (
        <div className="w-full max-w-2xl p-4 border border-gray-300 rounded-xl overflow-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{pdfText}</p>
        </div>
      )} */}
    </div>
  );
}

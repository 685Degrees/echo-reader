import { Play, Pause, RotateCw, RotateCcw } from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onForward: () => void;
  onRewind: () => void;
}

export function AudioControls({
  isPlaying,
  onPlayPause,
  onForward,
  onRewind,
}: AudioControlsProps) {
  return (
    <div className="w-full flex items-center justify-center space-x-8">
      <button
        className="group flex items-center justify-center w-12 h-12 rounded-full transition-colors"
        onClick={onRewind}
      >
        <RotateCcw
          size={48}
          strokeWidth={1.25}
          className="text-gray-500 group-hover:text-gray-600"
        />
        <span className="absolute text-xs mb-[30px] font-bold text-gray-500 group-hover:text-gray-600 mt-8">
          30
        </span>
      </button>

      <button
        className="flex items-center justify-center w-20 h-20 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-[0_3px_20px_-3px_rgba(0,0,0,0.2)]"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-10 h-10 text-gray-700s" />
        ) : (
          <Play className="w-10 h-10 text-gray-700 ml-1" />
        )}
      </button>

      <button
        className="group flex items-center justify-center w-12 h-12 rounded-full transition-colors"
        onClick={onForward}
      >
        <RotateCw
          size={48}
          strokeWidth={1.25}
          className="text-gray-500 group-hover:text-gray-600"
        />
        <span className="absolute text-xs mb-[30px] font-bold text-gray-500 group-hover:text-gray-600 mt-8">
          30
        </span>
      </button>
    </div>
  );
}

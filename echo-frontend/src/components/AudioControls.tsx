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
        <span className="absolute text-xs mb-[30px] font-medium text-gray-500 group-hover:text-gray-600 mt-8">
          30
        </span>
      </button>

      <button
        className="flex items-center justify-center w-16 h-16 rounded-full bg-black hover:bg-gray-700 transition-colors"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 text-white" />
        ) : (
          <Play className="w-8 h-8 text-white ml-1" />
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
        <span className="absolute text-xs mb-[30px] font-medium text-gray-500 group-hover:text-gray-600 mt-8">
          30
        </span>
      </button>
    </div>
  );
}

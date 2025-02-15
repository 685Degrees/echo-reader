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
    <div className="w-full flex items-center justify-center space-x-4 sm:space-x-8">
      <button
        className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors"
        onClick={onRewind}
      >
        <RotateCcw
          size={36}
          className="text-gray-500 group-hover:text-gray-600 sm:hidden"
          strokeWidth={1.25}
        />
        <RotateCcw
          size={48}
          className="hidden sm:block text-gray-500 group-hover:text-gray-600"
          strokeWidth={1.25}
        />
        <span className="absolute text-xs mb-[24px] sm:mb-[30px] font-bold text-gray-500 group-hover:text-gray-600 mt-6 sm:mt-8">
          30
        </span>
      </button>

      <button
        className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-[0_3px_20px_-3px_rgba(0,0,0,0.2)]"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
        ) : (
          <Play className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700 ml-1" />
        )}
      </button>

      <button
        className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors"
        onClick={onForward}
      >
        <RotateCw
          size={36}
          className="text-gray-500 group-hover:text-gray-600 sm:hidden"
          strokeWidth={1.25}
        />
        <RotateCw
          size={48}
          className="hidden sm:block text-gray-500 group-hover:text-gray-600"
          strokeWidth={1.25}
        />
        <span className="absolute text-xs mb-[24px] sm:mb-[30px] font-bold text-gray-500 group-hover:text-gray-600 mt-6 sm:mt-8">
          30
        </span>
      </button>
    </div>
  );
}

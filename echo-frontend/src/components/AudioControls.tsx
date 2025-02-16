import { Play, Pause, RotateCw, RotateCcw } from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
}

export function AudioControls({
  isPlaying,
  isLoading,
  onPlayPause,
  onSkipForward,
  onSkipBack,
}: AudioControlsProps) {
  return (
    <div className="w-full flex items-center justify-center space-x-4 sm:space-x-8">
      <button
        className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors"
        onClick={onSkipBack}
        disabled={isLoading}
      >
        <RotateCcw
          size={36}
          className="text-primary-500 group-hover:text-primary-600 sm:hidden"
          strokeWidth={1.25}
        />
        <RotateCcw
          size={48}
          className="hidden sm:block text-primary-500 group-hover:text-primary-600"
          strokeWidth={1.25}
        />
        <span className="absolute text-xs mb-[24px] sm:mb-[30px] font-bold text-primary-500 group-hover:text-primary-600 mt-6 sm:mt-8">
          30
        </span>
      </button>

      <button
        className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-[0_3px_20px_-3px_rgba(0,0,0,0.2)]"
        onClick={onPlayPause}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-primary-700" />
        ) : (
          <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-700 ml-1" />
        )}
      </button>

      <button
        className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors"
        onClick={onSkipForward}
        disabled={isLoading}
      >
        <RotateCw
          size={36}
          className="text-primary-500 group-hover:text-primary-600 sm:hidden"
          strokeWidth={1.25}
        />
        <RotateCw
          size={48}
          className="hidden sm:block text-primary-500 group-hover:text-primary-600"
          strokeWidth={1.25}
        />
        <span className="absolute text-xs mb-[24px] sm:mb-[30px] font-bold text-primary-500 group-hover:text-primary-600 mt-6 sm:mt-8">
          30
        </span>
      </button>
    </div>
  );
}

import { useState } from "react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AudioProgressProps {
  progressPercent: number;
  bufferingProgress: number;
  duration: number;
  currentTime: number;
  onChange: (value: number) => void;
}

export function AudioProgress({
  progressPercent,
  bufferingProgress,
  duration,
  currentTime,
  onChange,
}: AudioProgressProps) {
  const isFullyLoaded = bufferingProgress === 100;
  const displayedProgress = isFullyLoaded ? progressPercent : 0;

  return (
    <div className="w-full space-y-2">
      <div
        className={cn(
          "relative w-full h-2 bg-primary-50 rounded-full",
          !isFullyLoaded && "cursor-not-allowed"
        )}
      >
        {/* Buffered portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary-200"
          style={{ width: `${Math.min(bufferingProgress, 100)}%` }}
        />
        {/* Played portion */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full",
            isFullyLoaded ? "bg-primary-800" : "bg-primary-400"
          )}
          style={{ width: `${Math.min(displayedProgress, 100)}%` }}
        />
        {/* Thumb slider */}
        <div
          className={cn(
            "absolute h-4 w-4 rounded-full -mt-1 -ml-2",
            isFullyLoaded ? "bg-primary-950" : "bg-primary-400"
          )}
          style={{ left: `${Math.min(displayedProgress, 100)}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={displayedProgress}
          onChange={(e) => isFullyLoaded && onChange(Number(e.target.value))}
          disabled={!isFullyLoaded}
          className={cn(
            "absolute inset-0 w-full h-full opacity-0",
            isFullyLoaded ? "cursor-pointer" : "cursor-not-allowed"
          )}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{!isFullyLoaded ? "Calculating..." : formatTime(duration)}</span>
      </div>
    </div>
  );
}

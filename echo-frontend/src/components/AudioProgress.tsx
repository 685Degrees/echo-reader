import { useState } from "react";
import { formatTime } from "@/lib/utils";

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
  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-2 bg-gray-100 rounded-full">
        {/* Buffered portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gray-300 transition-all duration-300"
          style={{ width: `${bufferingProgress}%` }}
        />
        {/* Played portion */}
        <div
          className="absolute left-0 top-0 h-full bg-gray-800 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Thumb slider */}
        <div
          className="absolute h-4 w-4 bg-black rounded-full -mt-1 -ml-2"
          style={{ left: `${progressPercent}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercent}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>
          {bufferingProgress < 100 ? "Calculating..." : formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

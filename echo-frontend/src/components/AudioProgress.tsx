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
      <div className="relative w-full h-2 bg-primary-50 rounded-full">
        {/* Buffered portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary-200 transition-all duration-300"
          style={{ width: `${Math.min(bufferingProgress, 100)}%` }}
        />
        {/* Played portion */}
        <div
          className="absolute left-0 top-0 h-full bg-primary-800 rounded-full"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
        {/* Thumb slider */}
        <div
          className="absolute h-4 w-4 bg-primary-950 rounded-full -mt-1 -ml-2"
          style={{ left: `${Math.min(progressPercent, 100)}%` }}
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

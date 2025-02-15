import { useState } from "react";
import { formatTime } from "@/lib/utils";

interface AudioProgressProps {
  progress: number;
  duration: number;
  currentTime: number;
  onChange: (value: number) => void;
}

export function AudioProgress({
  progress,
  duration,
  currentTime,
  onChange,
}: AudioProgressProps) {
  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-gray-800 rounded-full"
          style={{ width: `${progress}%` }}
        />
        {/* Thumb slider */}
        <div
          className="absolute h-4 w-4 bg-black rounded-full -mt-1 -ml-1.5"
          style={{ left: `${progress}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

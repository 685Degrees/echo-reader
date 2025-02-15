import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === "application/pdf") {
      // Handle the PDF file here
      console.log("Dropped PDF:", files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        // Handle the PDF file here
        console.log("Selected PDF:", file);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div
        className={cn(
          "w-full max-w-2xl aspect-video border-2 border-dashed rounded-lg",
          "flex flex-col items-center justify-center p-8",
          "transition-colors duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-700",
          "cursor-pointer"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        <svg
          className={cn(
            "w-12 h-12 mb-4",
            isDragging ? "text-blue-500" : "text-gray-400"
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <p className="text-lg mb-2">Drop your PDF here or click to select</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Only PDF files are accepted
        </p>
      </div>
    </div>
  );
}

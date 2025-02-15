import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileUp, RotateCcw, RotateCw, Play, Pause } from "lucide-react";
import { Subheader2, Paragraph, SmallText } from "@/components/Typography";
// @ts-ignore: react-pdftotext module has no type declarations
import pdfToText from "react-pdftotext";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState("");
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const [isPlaying, setIsPlaying] = useState(false);

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

  const extractTextFromPdf = (file: File) => {
    pdfToText(file)
      .then((text: string) => {
        setPdfText(text);
        console.log("Extracted text:", text);
      })
      .catch((error: any) => {
        console.error("Failed to extract text from pdf", error);
      });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type === "application/pdf") {
      if (files[0].size > MAX_FILE_SIZE) {
        alert("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(files[0].name);
      extractTextFromPdf(files[0]);
      console.log("Dropped PDF:", files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        if (file.size > MAX_FILE_SIZE) {
          alert("File size exceeds 10MB limit");
          return;
        }
        setSelectedFile(file.name);
        extractTextFromPdf(file);
        console.log("Selected PDF:", file);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8">
      <div
        className={cn(
          "w-full max-w-2xl aspect-video border-2 border-dashed rounded-lg",
          "flex flex-col items-center justify-center p-8",
          "hover:bg-gray-50 ",
          "transition-colors duration-200",
          isDragging ? "border-blue-500 bg-blue-50 " : "border-gray-400",
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

        <FileUp
          className={cn(
            "w-12 h-12 mb-4",
            isDragging ? "text-blue-500" : "text-gray-400"
          )}
        />

        {selectedFile ? (
          <div className="text-center">
            <Subheader2 className="mb-2 text-gray-700">
              {selectedFile}
            </Subheader2>
            <Paragraph className="text-gray-500">
              Click or drop to change file
            </Paragraph>
          </div>
        ) : (
          <div className="text-center">
            <Subheader2 className="mb-2 text-gray-700">
              Drop your PDF of your book here
            </Subheader2>
            <Paragraph className="text-gray-500">
              Maximum file size: 10MB
            </Paragraph>
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl flex items-center justify-center space-x-8">
        <button
          className="group flex items-center justify-center w-12 h-12 rounded-full transition-colors"
          onClick={() => console.log("Forward 30s")}
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
          onClick={() => {
            setIsPlaying(!isPlaying);
            console.log("Play/Pause");
          }}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>

        <button
          className="group flex items-center justify-center w-12 h-12 rounded-full transition-colors"
          onClick={() => console.log("Forward 30s")}
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
      {/* {pdfText && (
        <div className="w-full max-w-2xl p-4 border border-gray-300 rounded-xl overflow-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{pdfText}</p>
        </div>
      )} */}
    </div>
  );
}

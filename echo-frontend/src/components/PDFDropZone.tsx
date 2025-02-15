import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileUp } from "lucide-react";
import { Subheader2, Paragraph } from "@/components/Typography";
// @ts-ignore: react-pdftotext module has no type declarations
import pdfToText from "react-pdftotext";

interface PDFDropZoneProps {
  onTextExtracted: (text: string) => void;
}

export function PDFDropZone({ onTextExtracted }: PDFDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

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
        onTextExtracted(text);
        console.log("Extracted text:", text);
      })
      .catch((error: any) => {
        console.error("Failed to extract text from pdf", error);
      });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
      }
    },
    [onTextExtracted]
  );

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
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl aspect-video border-2 border-dashed rounded-lg",
        "flex flex-col items-center justify-center p-8",
        "hover:bg-gray-50",
        "transition-colors duration-200",
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400",
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
          <Subheader2 className="mb-2 text-gray-700">{selectedFile}</Subheader2>
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
  );
}

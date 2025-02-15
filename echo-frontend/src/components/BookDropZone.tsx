import { useState, useCallback } from "react";
import { cn, cleanTextWithGemini } from "@/lib/utils";
import { FileUp } from "lucide-react";
import { Subheader2, Paragraph } from "@/components/Typography";
// @ts-ignore: react-pdftotext module has no type declarations
import pdfToText from "react-pdftotext";
import ePub from "epubjs";

interface BookDropZoneProps {
  onTextExtracted: (text: string) => void;
}

export function BookDropZone({ onTextExtracted }: BookDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const extractTextFromPdf = async (file: File) => {
    try {
      setIsProcessing(true);
      const text = await pdfToText(file);
      // console.log("Text:", text.slice(0, 1000));
      const cleanedText = await cleanTextWithGemini(text);
      console.log("Cleaned text:", cleanedText);
      onTextExtracted(cleanedText);
      console.log("Extracted and cleaned text from PDF");
    } catch (error) {
      console.error("Failed to extract text from PDF", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromEpub = async (file: File) => {
    try {
      setIsProcessing(true);
      const arrayBuffer = await file.arrayBuffer();
      const book = ePub(arrayBuffer);
      await book.ready;

      let fullText = "";
      // @ts-ignore: spine.items exists at runtime
      const items = book.spine.items;

      for (const item of items) {
        try {
          const content = await book.load(item.href);

          // Handle content as Document object
          const doc = content as Document;
          if (doc && doc.body) {
            const text = doc.body.textContent || "";
            fullText += text.trim() + "\n\n";
          }
        } catch (err) {
          console.warn(`Failed to extract text from ${item.href}:`, err);
          continue;
        }
      }

      console.log("Full text:", fullText.slice(0, 1000));

      const cleanedText = await cleanTextWithGemini(
        fullText.trim().slice(0, 1000)
      );
      console.log("Cleaned text:", cleanedText);

      onTextExtracted(cleanedText);
      console.log("Extracted and cleaned text from EPUB successfully");
    } catch (error) {
      console.error("Failed to extract text from EPUB", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        if (file.size > MAX_FILE_SIZE) {
          alert("File size exceeds 10MB limit");
          return;
        }

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          setSelectedFile(file.name);
          extractTextFromPdf(file);
        } else if (
          file.type === "application/epub+zip" ||
          file.name.endsWith(".epub")
        ) {
          setSelectedFile(file.name);
          extractTextFromEpub(file);
        } else {
          alert("Please upload a PDF or EPUB file");
        }
      }
    },
    [onTextExtracted]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 10MB limit");
        return;
      }

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file.name);
        extractTextFromPdf(file);
      } else if (
        file.type === "application/epub+zip" ||
        file.name.endsWith(".epub")
      ) {
        setSelectedFile(file.name);
        extractTextFromEpub(file);
      } else {
        alert("Please upload a PDF or EPUB file");
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
        accept=".pdf,.epub"
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
            {isProcessing ? "Processing..." : selectedFile}
          </Subheader2>
          <Paragraph className="text-gray-500">
            {isProcessing
              ? "This may take a few moments..."
              : "Click or drop to change file"}
          </Paragraph>
        </div>
      ) : (
        <div className="text-center">
          <Subheader2 className="mb-2 text-gray-700">
            Drop your book here
          </Subheader2>
          <Paragraph className="text-gray-500">
            Supports PDF and EPUB formats • Maximum file size: 10MB
          </Paragraph>
        </div>
      )}
    </div>
  );
}

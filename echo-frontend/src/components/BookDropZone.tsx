import { useState, useCallback } from "react";
import { cn, cleanTextWithGemini } from "@/lib/utils";
import { FileUp, Save, Check, Loader2, BookOpenIcon } from "lucide-react";
import { Subheader2, Paragraph } from "@/components/Typography";
import ePub from "epubjs";
import pdfToText from "react-pdftotext";
import { saveBook } from "@/lib/bookStorage";
import { Book } from "@/types/book";
import { slugify } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface BookDropZoneProps {
  onTextExtracted: (text: string) => void;
  onSaveAudio: () => Promise<string>;
  onBookSaved?: () => void;
  text?: string;
  duration?: number;
  isAudioReady?: boolean;
}

export function BookDropZone({
  onTextExtracted,
  onSaveAudio,
  onBookSaved,
  text,
  duration,
  isAudioReady = false,
}: BookDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const handleSave = async () => {
    if (!text || !selectedFile || isSaved) return;

    setIsSaving(true);
    try {
      const audioUrl = await onSaveAudio();

      const book: Book = {
        id: uuidv4(),
        bookSlug: slugify(selectedFile),
        title: selectedFile.replace(/\.(pdf|epub)$/, ""),
        text,
        audioUrl,
        lengthSeconds: Math.round(duration || 0),
        createdAt: new Date().toISOString(),
      };
      await saveBook(book);
      setIsSaved(true);
      onBookSaved?.();
    } catch (error) {
      console.error("Failed to save book:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
      setProcessingStatus("Extracting text from PDF...");
      const text = await pdfToText(file);

      setProcessingStatus("Cleaning and formatting text...");
      const cleanedText = await cleanTextWithGemini(text);
      console.log("Cleaned text:", cleanedText);
      onTextExtracted(cleanedText);
      setSelectedFile(file.name);
      console.log("Extracted and cleaned text from PDF");
    } catch (error) {
      console.error("Failed to extract text from PDF", error);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const extractTextFromEpub = async (file: File) => {
    try {
      setIsProcessing(true);
      setProcessingStatus("Extracting text from EPUB...");
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

      setProcessingStatus("Cleaning and formatting text...");
      const cleanedText = await cleanTextWithGemini(
        fullText.trim().slice(0, 1000)
      );
      console.log("Cleaned text:", cleanedText);

      onTextExtracted(cleanedText);
      setSelectedFile(file.name);
      console.log("Extracted and cleaned text from EPUB successfully");
    } catch (error) {
      console.error("Failed to extract text from EPUB", error);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
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
    <div className="w-full max-w-2xl">
      {!text ? (
        // Show full drop zone when no text
        <div
          className={cn(
            "w-full aspect-video border-2 border-dashed rounded-2xl",
            "flex flex-col items-center justify-center p-8 bg-white/70",
            "hover:bg-white/90",
            "transition-colors duration-200",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400",
            isProcessing ? "cursor-wait" : "cursor-pointer"
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            !isProcessing && document.getElementById("file-input")?.click()
          }
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.epub"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <div className="text-center">
                <Subheader2 className="text-gray-700">
                  {processingStatus}
                </Subheader2>
              </div>
            </div>
          ) : (
            <>
              <FileUp
                className={cn(
                  "w-12 h-12 mb-4",
                  isDragging ? "text-blue-500" : "text-gray-400"
                )}
              />

              <div className="text-center">
                <Subheader2 className="mb-2 text-gray-700">
                  Drop your book here
                </Subheader2>
                <Paragraph className="text-gray-500">
                  Supports PDF and EPUB formats • Maximum file size: 10MB
                </Paragraph>
              </div>
            </>
          )}
        </div>
      ) : (
        // Show compact view with text when text is present
        <div className="border border-gray-300 rounded-xl bg-white/70 shadow-sm">
          <div className="border-b border-gray-300 p-4 bg-primary-50 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BookOpenIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <Subheader2 className="text-gray-700">
                    {selectedFile || "Uploaded Book"}
                  </Subheader2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || isSaved || !isAudioReady}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                    "transition duration-200",
                    isSaved
                      ? "bg-green-100 text-green-600 cursor-default"
                      : isSaving || !selectedFile || !isAudioReady
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary-100 text-primary-600 hover:bg-primary-200"
                  )}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved to Library
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isSaving
                        ? "Saving..."
                        : !isAudioReady
                        ? "Preparing audio..."
                        : "Save to Library"}
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSaved(false);
                    document.getElementById("file-input")?.click();
                  }}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Upload new file
                </button>
              </div>
            </div>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.epub"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto rounded-lg px-8 my-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      )}

      {(isProcessing || isSaving) && (
        <div className="mt-4 text-center text-gray-500">
          <Paragraph>
            {isProcessing
              ? "Processing your file, this may take a few moments..."
              : "Saving your book..."}
          </Paragraph>
        </div>
      )}
    </div>
  );
}

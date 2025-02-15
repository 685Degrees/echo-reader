import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileUp } from "lucide-react";
import { Subheader2, Paragraph } from "@/components/Typography";
import ePub from "epubjs";
import { ScrollMode, Viewer } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";

interface BookDropZoneProps {
  onTextExtracted: (text: string) => void;
}

export function BookDropZone({ onTextExtracted }: BookDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const thumbnailPluginInstance = thumbnailPlugin();

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
      // Dynamically import react-pdftotext
      const pdfToText = (await import("react-pdftotext")).default;
      const text = await pdfToText(file);
      onTextExtracted(text);
      console.log("Extracted text from PDF:", text);
    } catch (error) {
      console.error("Failed to extract text from PDF", error);
    }
  };

  const extractTextFromEpub = async (file: File) => {
    try {
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

      onTextExtracted(fullText.trim());
      console.log("Extracted text from EPUB successfully");
    } catch (error) {
      console.error("Failed to extract text from EPUB", error);
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
          setPdfUrl(URL.createObjectURL(file));
          extractTextFromPdf(file);
        } else if (
          file.type === "application/epub+zip" ||
          file.name.endsWith(".epub")
        ) {
          setSelectedFile(file.name);
          setPdfUrl(null);
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
        setPdfUrl(URL.createObjectURL(file));
        extractTextFromPdf(file);
      } else if (
        file.type === "application/epub+zip" ||
        file.name.endsWith(".epub")
      ) {
        setSelectedFile(file.name);
        setPdfUrl(null);
        extractTextFromEpub(file);
      } else {
        alert("Please upload a PDF or EPUB file");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div
      className={cn(
        "w-full max-w-2xl aspect-video border-2 border-dashed rounded-lg",
        "flex flex-col items-center justify-center p-8",
        "hover:border-gray-400",
        "transition-colors duration-200",
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
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

      {pdfUrl ? (
        <div className="w-full h-full overflow-hidden">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[thumbnailPluginInstance]}
            defaultScale={0.35}
            scrollMode={ScrollMode.Page}
          />
        </div>
      ) : (
        <>
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
                Drop your book here
              </Subheader2>
              <Paragraph className="text-gray-500">
                Supports PDF and EPUB formats • Maximum file size: 10MB
              </Paragraph>
            </div>
          )}
        </>
      )}
    </div>
  );
}

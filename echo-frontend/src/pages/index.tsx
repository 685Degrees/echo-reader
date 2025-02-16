import { useState, useEffect } from "react";
import { BookDropZone } from "@/components/BookDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Header } from "@/components/Header";
import { Subheader } from "@/components/Typography";
import { BookCard } from "@/components/BookCard";
import { generateSpeech, saveAudioStream } from "@/lib/utils";
import { getBookMetadata, getBookById } from "@/lib/bookStorage";
import { Book } from "@/types/book";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookText, setBookText] = useState("");
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [saveStream, setSaveStream] = useState<ReadableStream | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { isConnected, isConnecting, startSession, stopSession, error } =
    useWebRTC();

  const {
    isPlaying,
    isLoading,
    currentTimeSeconds,
    duration,
    bufferingProgress,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
    setIsPlaying,
    setupAudioStream,
    isAudioReady,
  } = useAudioPlayer();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const metadata = getBookMetadata();
    const fullBooks = metadata
      .map((meta) => {
        const book = getBookById(meta.id);
        return book;
      })
      .filter((book): book is Book => book !== null);
    setBooks(fullBooks);
  };

  const handleBookDelete = () => {
    loadBooks();
  };

  const handleBookUpdate = () => {
    loadBooks();
  };

  const handleTextExtracted = async (text: string) => {
    setBookText(text);
    try {
      const stream = await generateSpeech(text);
      // Clone the stream for potential future saving
      const [playStream, saveStream] = stream.tee();

      // Store the save stream for later use when saving
      setSaveStream(saveStream);

      // Setup audio for preview/playback
      await setupAudioStream(playStream);
    } catch (error) {
      console.error("Error generating speech:", error);
    }
  };

  // Modify handleSaveAudio to accept duration
  const handleSaveAudio = async (duration: number): Promise<string> => {
    if (!saveStream) {
      throw new Error("No audio stream available");
    }

    const bookId = uuidv4();
    const audioUrl = await saveAudioStream(saveStream, bookId);
    return audioUrl;
  };

  const handleDiscussToggle = async () => {
    if (isDiscussing) {
      setIsDiscussing(false);
      setIsPlaying(true);
      stopSession();
    } else {
      setIsDiscussing(true);
      // Pause audio when starting discussion
      if (isPlaying) {
        handlePlayPause();
      }
      if (!isConnected && !isConnecting) {
        await startSession();
      }
    }
  };

  const getButtonText = () => {
    if (isConnecting) return "Connecting...";
    if (isDiscussing) return "Resume listening";
    if (isPlaying) return "Pause & discuss";
    return "Discuss";
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-primary-100 min-h-screen">
      <Header />
      <main className="pt-20 flex flex-col items-center p-8 space-y-12">
        {/* Library Section */}
        <div className="w-full max-w-2xl">
          <Subheader className="text-primary-800 mb-2">Your Library</Subheader>
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 mb-6 rounded-lg border border-primary-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 w-64"
          />
          <div className="relative">
            <div className="overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex space-x-6">
                {filteredBooks.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-[180px] bg-primary-50 rounded-xl border border-primary-200 flex-shrink-0">
                    <p className="text-gray-500 text-center px-4">
                      {books.length === 0
                        ? "No books in your library yet.\nUpload a book below to get started."
                        : "No books match your search."}
                    </p>
                  </div>
                ) : (
                  [...filteredBooks]
                    .reverse()
                    .map((book) => (
                      <BookCard
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        lengthSeconds={book.lengthSeconds}
                        onDelete={handleBookDelete}
                        onUpdate={handleBookUpdate}
                      />
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="w-full max-w-2xl">
          <Subheader className="mb-6 text-primary-800">Upload a book</Subheader>
          <BookDropZone
            onTextExtracted={handleTextExtracted}
            onSaveAudio={() => handleSaveAudio(duration || 0)}
            onBookSaved={loadBooks}
            text={bookText}
            duration={duration}
            isAudioReady={duration !== 0}
          />
        </div>

        {/* Audio Controls Section */}
        {bookText && (
          <div className="w-full max-w-2xl space-y-8 sm:space-y-12 flex flex-col items-center justify-center">
            <AudioProgress
              progressPercent={(currentTimeSeconds / (duration || 1)) * 100}
              bufferingProgress={bufferingProgress}
              duration={duration}
              currentTime={currentTimeSeconds}
              onChange={handleProgressChange}
            />
            <AudioControls
              isPlaying={isPlaying}
              isLoading={isLoading}
              onPlayPause={handlePlayPause}
              onSkipForward={handleSkipForward}
              onSkipBack={handleSkipBack}
            />
            <button
              onClick={handleDiscussToggle}
              disabled={isConnecting}
              className="w-full py-6 sm:py-8 px-4 text-lg sm:text-xl font-medium bg-primary-800 text-white rounded-2xl max-w-sm hover:bg-primary-600 transition duration-200 disabled:bg-primary-400"
            >
              {getButtonText()}
            </button>

            {isDiscussing && error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

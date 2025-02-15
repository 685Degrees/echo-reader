import { useState } from "react";
import { BookDropZone } from "@/components/BookDropZone";
import { AudioProgress } from "@/components/AudioProgress";
import { AudioControls } from "@/components/AudioControls";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function Home() {
  const [bookText, setBookText] = useState("");
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [message, setMessage] = useState("");

  const { isConnected, isConnecting, startSession, sendMessage, error } =
    useWebRTC();

  const {
    isPlaying,
    isLoading,
    currentTimeSeconds,
    duration,
    handlePlayPause,
    handleSkipForward,
    handleSkipBack,
    handleProgressChange,
  } = useAudioPlayer(bookText);

  const handleDiscussToggle = async () => {
    if (isDiscussing) {
      setIsDiscussing(false);
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

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const getButtonText = () => {
    if (isConnecting) return "Connecting...";
    if (isDiscussing) return "Resume listening";
    if (isPlaying) return "Pause & discuss";
    return "Discuss";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8">
      <BookDropZone onTextExtracted={setBookText} />

      {bookText && (
        <div className="w-full max-w-2xl space-y-8 sm:space-y-12 flex flex-col items-center justify-center">
          <AudioProgress
            progress={(currentTimeSeconds / (duration || 1)) * 100}
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
            className="w-full py-6 sm:py-8 px-4 text-lg sm:text-xl font-medium bg-black text-white rounded-2xl max-w-sm hover:bg-gray-700 transition duration-200 disabled:bg-gray-400"
          >
            {getButtonText()}
          </button>

          {isDiscussing && (
            <div className="w-full max-w-2xl space-y-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-4 border border-gray-300 rounded-xl"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !message.trim()}
                  className="px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-700 transition duration-200 disabled:bg-gray-400"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {bookText && (
        <div className="w-full max-w-2xl p-4 border border-gray-300 rounded-xl overflow-auto">
          <p className="text-gray-700 whitespace-pre-wrap">{bookText}</p>
        </div>
      )}
    </div>
  );
}

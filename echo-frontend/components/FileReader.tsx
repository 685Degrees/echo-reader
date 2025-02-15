import { useState, useRef } from "react";

export default function FileReader() {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSpeak = async () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert text to speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to convert text to speech");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Text to Speech Reader</h1>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to be read aloud..."
          className="w-full h-40 p-2 border border-gray-300 rounded-md 
            focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <button
          onClick={handleSpeak}
          disabled={isLoading}
          className="px-4 py-2 bg-violet-600 text-white rounded-md
            hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Converting..." : "Read Aloud"}
        </button>
        <audio ref={audioRef} controls className="w-full" />
      </div>
    </div>
  );
}

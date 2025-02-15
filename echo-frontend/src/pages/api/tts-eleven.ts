import type { NextApiRequest, NextApiResponse } from "next";
import { ElevenLabsClient } from "elevenlabs";

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY environment variable");
}

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Generate audio stream using the ElevenLabs client
    const audioStream = await client.generate({
      voice: "Rachel",
      model_id: "eleven_turbo_v2_5",
      text,
    });

    // Set headers for streaming
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    // Pipe the audio stream directly to the response
    audioStream.pipe(res);

    // Handle any errors that occur during streaming
    audioStream.on("error", (error) => {
      console.error("Streaming error:", error);
      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ error: "Streaming failed" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
}

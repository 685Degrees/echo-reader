import type { NextApiRequest, NextApiResponse } from "next";
import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";
import { v4 as uuid } from "uuid";

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY environment variable");
}

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const chunkText = (text: string, maxLength: number = 200): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += sentence;
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body;

  if (!text) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  try {
    // Set headers before starting stream
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    // Split text into manageable chunks
    const textChunks = chunkText(text);

    // Generate and stream audio for each text chunk
    for (const textChunk of textChunks) {
      const audioStream = await client.generate({
        voice: "Rachel",
        model_id: "eleven_turbo_v2",
        text: textChunk,
      });

      // Stream each audio chunk to the client
      for await (const chunk of audioStream) {
        res.write(chunk);
      }
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate speech" });
    } else {
      res.end();
    }
  }
}

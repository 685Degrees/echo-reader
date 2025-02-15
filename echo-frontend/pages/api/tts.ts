import { CartesiaClient } from "@cartesia/cartesia-js";
import { NextApiRequest, NextApiResponse } from "next";

const client = new CartesiaClient({
  apiKey: process.env.CARTESIA_API_KEY,
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

    const audioBuffer = await client.tts.bytes({
      modelId: "sonic-english",
      transcript: text,
      voice: {
        mode: "id",
        id: "694f9389-aac1-45b6-b726-9d9369183238", // Default voice ID
      },
      language: "en",
      outputFormat: {
        container: "wav",
        sampleRate: 44100,
        encoding: "pcm_f32le",
      },
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "attachment; filename=speech.wav");
    return res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("TTS Error:", error);
    return res.status(500).json({ error: "Failed to convert text to speech" });
  }
}

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint to create a new WebRTC session
app.post("/session", async (req, res) => {
  try {
    console.log("Creating new WebRTC session...");
    const requestBody = {
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
    };
    console.log("Request to OpenAI:", requestBody);

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to create session: ${errorText}`);
    }

    const data = await response.json();
    console.log("Session created successfully:", {
      sessionId: data.id,
      expiresAt: data.expires_at,
    });
    res.json(data);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

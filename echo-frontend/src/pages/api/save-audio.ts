import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), "public", "audio"),
      keepExtensions: true,
    });

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "audio");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    const file = files.audio?.[0];

    if (!file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Generate the public URL for the saved file
    const audioUrl = `/audio/${path.basename(file.filepath)}`;

    res.status(200).json({ audioUrl });
  } catch (error) {
    console.error("Error saving audio file:", error);
    res.status(500).json({ error: "Failed to save audio file" });
  }
}

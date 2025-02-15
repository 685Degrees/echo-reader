import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

const modelName = "gemini-2.0-flash";
const generationConfig = {
  temperature: 0,
  max_output_tokens: 4096,
  response_mime_type: "text/plain",
};

const model = genAI.getGenerativeModel({
  model: modelName,
  generationConfig,
});

// Function to split text into chunks while preserving sentence boundaries
function splitTextIntoChunks(text: string): string[] {
  const MIN_WORDS_PER_CHUNK = 1000;
  const MAX_CHUNKS = 10;

  // Helper to compress whitespace
  const compressWhitespace = (text: string): string =>
    text.replace(/\s+/g, " ").trim();

  // Split text into paragraphs and normalize whitespace
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(compressWhitespace)
    .filter((p) => p);

  // Calculate total word count
  const totalWords = paragraphs.reduce(
    (count, p) => count + p.split(" ").length,
    0
  );

  // Calculate target words per chunk (at least MIN_WORDS_PER_CHUNK)
  const targetWordsPerChunk = Math.max(
    MIN_WORDS_PER_CHUNK,
    Math.ceil(
      totalWords /
        Math.min(MAX_CHUNKS, Math.ceil(totalWords / MIN_WORDS_PER_CHUNK))
    )
  );

  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphWordCount = paragraph.split(" ").length;

    // If adding this paragraph would exceed our target and we already have content,
    // start a new chunk (unless this is a single large paragraph)
    if (
      currentWordCount + paragraphWordCount > targetWordsPerChunk * 1.2 &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.join("\n\n"));
      currentChunk = [];
      currentWordCount = 0;
    }

    // Handle very large single paragraphs by splitting into sentences
    if (paragraphWordCount > targetWordsPerChunk) {
      const sentences = (paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph]).map(
        compressWhitespace
      );
      let sentenceChunk: string[] = [];
      let sentenceWordCount = 0;

      for (const sentence of sentences) {
        const sentenceWords = sentence.split(" ").length;

        if (
          sentenceWordCount + sentenceWords > targetWordsPerChunk &&
          sentenceChunk.length > 0
        ) {
          if (currentChunk.length > 0) {
            chunks.push(
              [...currentChunk, sentenceChunk.join(" ")].join("\n\n")
            );
          } else {
            chunks.push(sentenceChunk.join(" "));
          }
          currentChunk = [];
          sentenceChunk = [];
          currentWordCount = 0;
          sentenceWordCount = 0;
        }

        sentenceChunk.push(sentence);
        sentenceWordCount += sentenceWords;
      }

      if (sentenceChunk.length > 0) {
        currentChunk.push(sentenceChunk.join(" "));
        currentWordCount += sentenceWordCount;
      }
    } else {
      currentChunk.push(paragraph);
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk if there's anything left
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n\n"));
  }

  // Final pass to ensure all chunks have compressed whitespace
  return chunks.map(compressWhitespace);
}

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Process chunks with rate limiting
async function processChunksWithRateLimit(chunks: string[]): Promise<string[]> {
  const results: string[] = [];
  const CONCURRENT_REQUESTS = 3; // Process 3 chunks at a time
  const DELAY_BETWEEN_BATCHES = 500; // 0.5 second delay between batches

  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += CONCURRENT_REQUESTS) {
    const batch = chunks.slice(i, i + CONCURRENT_REQUESTS);
    const batchPromises = batch.map((chunk) => cleanTextChunk(chunk));

    console.log("Processing chunk:", i);

    // Process current batch
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay before next batch (unless it's the last batch)
    if (i + CONCURRENT_REQUESTS < chunks.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  return results;
}

async function cleanTextChunk(chunk: string): Promise<string> {
  try {
    const textCleaningPrompt = `You are a text cleaning specialist. Your task is to transform messy, uncleaned text chunk into clean, well-formatted content while keeping the original text. If text is already clean, preserve it exactly as is.

Follow these rules precisely:
1. Remove header/footer artifacts and page numbers
2. Fix hyphenation and line breaks
3. Maintain chapter and section hierarchy
4. Remove publishing information
5. Remove footnotes
6. Fix awkward line breaks between words (e.g. "h ello" -> "hello")
7. Output only the cleaned text without explanations
8. Never add new content or change the wording
9. Keep text exactly as is if it's already clean

Example:
<uncleaned_text>
THINKING, FAST AND SLOW
              
THINKING, FAST AND SLOW
Daniel Kahneman

Published by Farrar, Straus and Giroux
New York, NY
Copyright © 2011

Library of Congress Control Number: 2011024765
ISBN: 978-0374275631

First Edition
Printed in the United States of America

                 INTRODUCTION

     Every au  thor, I sup pose, has in 
mind a setting in which readers of his
or her work could benefit from read-
ing it. In writing Think ing, Fast and
Slow, I hoped to improve the abi lity
to identify and understand errors of
judgment and choice, in others and
eventually in ourselv es.¹                 33

_________________
¹ This goal was shared by many of my col-
leagues in the judgment and decision-making
community who have spe nt their careers
studying human irrationality.
</uncleaned_text>

<cleaned_text>
THINKING, FAST AND SLOW

INTRODUCTION

Every author, I suppose, has in mind a setting in which readers of his or her work could benefit from reading it. In writing Thinking, Fast and Slow, I hoped to improve the ability to identify and understand errors of judgment and choice, in others and eventually in ourselves.
</cleaned_text>


-- 
Here's the text you need to clean:
<input>
${chunk}
</input>

Output ONLY the cleaned text.
`;

    const result = await model.generateContent(textCleaningPrompt);
    const response = result.response.text();

    // Extract the cleaned text between <cleaned_text> tags
    const cleanedMatch = response.match(
      /<cleaned_text>([\s\S]*?)<\/cleaned_text>/
    );
    if (cleanedMatch && cleanedMatch[1]) {
      return cleanedMatch[1].trim();
    }

    // If no tags found, return the full response
    return response.trim();
  } catch (error) {
    console.error("Error cleaning text chunk with Gemini:", error);
    return chunk; // Return original chunk if cleaning fails
  }
}

export async function cleanTextWithGemini(text: string): Promise<string> {
  try {
    // Split text into chunks
    const chunks = splitTextIntoChunks(text);
    console.log("Chunks:", chunks[3], chunks[4]);
    const string = "sadsadsdasd";
    console.log("ads", string.slice(0, 100));

    console.log("Number of chunks:", chunks.length);
    console.log(
      "Average chunk size (words):",
      Math.round(
        chunks.reduce((sum, chunk) => sum + chunk.split(/\s+/).length, 0) /
          chunks.length
      )
    );

    // Process chunks with rate limiting
    const cleanedChunks = await processChunksWithRateLimit(chunks);

    // Join the cleaned chunks with appropriate spacing
    return cleanedChunks
      .map((chunk) => chunk.trim())
      .join("\n\n")
      .trim();
  } catch (error) {
    console.error("Error in parallel text cleaning:", error);
    return text; // Return original text if the parallel processing fails
  }
}

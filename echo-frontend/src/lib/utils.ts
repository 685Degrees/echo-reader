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

export async function cleanTextWithGemini(text: string): Promise<string> {
  try {
    const textCleaningPrompt = `You are a text cleaning specialist. Your task is to transform messy, uncleaned text into clean, well-formatted content while keeping the original text. If text is already clean, preserve it exactly as is.

Follow these rules precisely:
1. Remove header/footer artifacts and page numbers
2. Fix hyphenation and line breaks
4. Maintain chapter and section hierarchy
5. Remove publishing information
5. Remove footnotes
6. Output only the cleaned text without explanations
7. Never add new content or change the wording
8. Keep text exactly as is if it's already clean

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

     Every author, I suppose, has in 
mind a setting in which readers of his
or her work could benefit from read-
ing it. In writing Thinking, Fast and
Slow, I hoped to improve the ability
to identify and understand errors of
judgment and choice, in others and
eventually in ourselves.¹                 33

_________________
¹ This goal was shared by many of my col-
leagues in the judgment and decision-making
community who have spent their careers
studying human irrationality.
</uncleaned_text>

<cleaned_text>
THINKING, FAST AND SLOW

INTRODUCTION

Every author, I suppose, has in mind a setting in which readers of his or her work could benefit from reading it. In writing Thinking, Fast and Slow, I hoped to improve the ability to identify and understand errors of judgment and choice, in others and eventually in ourselves.
</cleaned_text>

Input Format:
<uncleaned_text>
${text}
</uncleaned_text>

Output Format:
<cleaned_text>
[your cleaned output goes here]
</cleaned_text>
</cleaned>`;

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
    console.error("Error cleaning text with Gemini:", error);
    return text; // Return original text if cleaning fails
  }
}

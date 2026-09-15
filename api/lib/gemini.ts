import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function gemini(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured on this server.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export async function callGemini(args: {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: unknown;
  model: string;
  referenceParts?: GeminiPart[];
}): Promise<string> {
  const parts: GeminiPart[] = [
    { text: args.userPrompt },
    ...(args.referenceParts ?? []),
  ];

  const res = await gemini().models.generateContent({
    model: args.model,
    contents: { parts },
    config: {
      systemInstruction: args.systemInstruction,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: args.responseSchema as any,
    },
  });

  return res.text || "";
}

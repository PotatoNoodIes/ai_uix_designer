import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "[gemini] GEMINI_API_KEY is not set — /generate will fail. " +
      "Check that pm2 loads the .env file for this process."
  );
}

const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export async function callGemini(args: {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: unknown;
  model: string;
  referenceParts?: GeminiPart[];
}): Promise<string> {
  if (!client) {
    throw new Error("AI is not configured on this server.");
  }

  const parts: GeminiPart[] = [
    { text: args.userPrompt },
    ...(args.referenceParts ?? []),
  ];

  const res = await client.models.generateContent({
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

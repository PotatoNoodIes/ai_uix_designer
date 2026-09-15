import { GoogleGenAI } from "@google/genai";
import { redact } from "./redact.ts";

export class ProviderError extends Error {
  constructor(public safeMessage: string, public status?: number) {
    super(safeMessage);
    this.name = "ProviderError";
  }
}

function describe(status: number | undefined): string {
  if (status === 401 || status === 403) {
    return "The AI provider rejected this server's credentials. The API key may be invalid, suspended, or missing billing.";
  }
  if (status === 429) {
    return "The AI provider is rate limiting requests. Try again shortly.";
  }
  if (status !== undefined && status >= 500) {
    return "The AI provider is temporarily unavailable. Try again shortly.";
  }
  return "Generation failed. Please try again.";
}

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

  try {
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
  } catch (err) {
    const status = (err as { status?: number })?.status;
    console.error(`[gemini] request failed (${status ?? "no status"}):`, redact(err));
    throw new ProviderError(describe(status), status);
  }
}

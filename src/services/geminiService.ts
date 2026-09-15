import { GoogleGenAI } from "@google/genai";
import { requestGeneration } from "./aiClient";
import {
  buildProductPrompt,
  buildNewScreenPrompt,
  buildModifyScreenPrompt,
} from "@api/shared/prompts";
import {
  PRODUCT_SCHEMA,
  NEW_SCREEN_SCHEMA,
  MODIFY_SCREEN_SCHEMA,
} from "@api/shared/schemas";
import { DEFAULT_MODEL } from "@api/shared/models";
import type {
  ChatMessage,
  ReferenceAsset,
  GeneratedUI,
  ScreenSummary,
  ScreenResult,
} from "@api/shared/types";

export type { ChatMessage, ReferenceAsset, GeneratedUI };

type Provider = "gemini" | "openrouter";

async function callWithUserKey(
  systemInstruction: string,
  userPrompt: string,
  responseSchema: unknown,
  model: string,
  apiKey: string,
  provider: Provider,
  referenceParts: unknown[] = []
): Promise<string> {
  if (provider === "openrouter") {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter Error: ${err}`);
    }
    const json = await response.json();
    return json.choices[0].message.content;
  }

  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: userPrompt }, ...referenceParts] as any },
    config: {
      systemInstruction,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
    },
  });
  return res.text || "";
}

function imageParts(referenceAssets?: ReferenceAsset[]) {
  const parts: { inlineData: { mimeType: string; data: string } }[] = [];
  referenceAssets?.forEach((asset) => {
    if (asset.type === "image") {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: asset.data.split(",")[1] || asset.data,
        },
      });
    }
  });
  return parts;
}

export async function generateProductArtifacts(
  prompt: string,
  theme: "light" | "dark",
  config: {
    architecture: "web" | "app";
    referenceAssets?: ReferenceAsset[];
    chatHistory?: ChatMessage[];
    existingScreens?: ScreenSummary[];
    model?: string;
    apiKey?: string;
    provider?: Provider;
  }
): Promise<GeneratedUI> {
  const userKey = config.apiKey?.trim();

  if (!userKey) {
    return requestGeneration<GeneratedUI>({
      intent: "product",
      prompt,
      theme,
      architecture: config.architecture,
      model: config.model,
      existingScreens: config.existingScreens,
      chatHistory: config.chatHistory,
      referenceImages: imageParts(config.referenceAssets).map((p) => p.inlineData),
    });
  }

  const { systemInstruction, userPrompt } = buildProductPrompt({
    prompt,
    theme,
    architecture: config.architecture,
    existingScreens: config.existingScreens,
    chatHistory: config.chatHistory,
  });

  const text = await callWithUserKey(
    systemInstruction,
    userPrompt,
    PRODUCT_SCHEMA,
    config.model || DEFAULT_MODEL,
    userKey,
    config.provider ?? "gemini",
    imageParts(config.referenceAssets)
  );
  return JSON.parse(text);
}

export async function generateNewScreen(
  purpose: string,
  designSystem: any,
  architecture: "web" | "app",
  projectContext: {
    overview: any;
    existingScreens: ScreenSummary[];
    chatHistory?: ChatMessage[];
  },
  model: string = DEFAULT_MODEL,
  apiKey?: string,
  provider: Provider = "gemini"
): Promise<ScreenResult> {
  const userKey = apiKey?.trim();

  if (!userKey) {
    return requestGeneration<ScreenResult>({
      intent: "newScreen",
      purpose,
      architecture,
      designSystem,
      overview: projectContext.overview,
      existingScreens: projectContext.existingScreens,
      chatHistory: projectContext.chatHistory,
      model,
    });
  }

  const { systemInstruction, userPrompt } = buildNewScreenPrompt({
    purpose,
    designSystem,
    overview: projectContext.overview,
    existingScreens: projectContext.existingScreens,
  });

  const text = await callWithUserKey(
    systemInstruction,
    userPrompt,
    NEW_SCREEN_SCHEMA,
    model,
    userKey,
    provider
  );
  return JSON.parse(text);
}

export async function modifyScreen(
  screenName: string,
  currentMarkup: string,
  instruction: string,
  designSystem: any,
  chatHistory?: ChatMessage[],
  model: string = DEFAULT_MODEL,
  apiKey?: string,
  provider: Provider = "gemini"
): Promise<ScreenResult> {
  const userKey = apiKey?.trim();

  if (!userKey) {
    return requestGeneration<ScreenResult>({
      intent: "modifyScreen",
      screenName,
      currentMarkup,
      instruction,
      designSystem,
      chatHistory,
      model,
    });
  }

  const { systemInstruction, userPrompt } = buildModifyScreenPrompt({
    screenName,
    instruction,
    currentMarkup,
    chatHistory,
  });

  const text = await callWithUserKey(
    systemInstruction,
    userPrompt,
    MODIFY_SCREEN_SCHEMA,
    model,
    userKey,
    provider
  );
  return JSON.parse(text);
}

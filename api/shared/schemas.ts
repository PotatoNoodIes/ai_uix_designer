/** Gemini responseSchema definitions, moved off the client with the prompts. */
import { Type } from "@google/genai";

export const PRODUCT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        targetUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["name", "description", "targetUsers"],
    },
    designSystem: {
      type: Type.OBJECT,
      properties: {
        colors: {
          type: Type.OBJECT,
          properties: {
            primary: { type: Type.STRING },
            secondary: { type: Type.STRING },
            background: { type: Type.STRING },
            surface: { type: Type.STRING },
            text: { type: Type.STRING },
            accent: { type: Type.STRING },
            muted: { type: Type.STRING },
            border: { type: Type.STRING },
          },
          required: [
            "primary",
            "secondary",
            "background",
            "surface",
            "text",
            "accent",
            "muted",
            "border",
          ],
        },
        radius: { type: Type.STRING },
        font: { type: Type.STRING },
      },
      required: ["colors", "radius", "font"],
    },
    screens: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          purpose: { type: Type.STRING },
          markup: { type: Type.STRING },
        },
        required: ["id", "name", "purpose", "markup"],
      },
    },
    assistantMessage: {
      type: Type.STRING,
      description: "Briefly explain what screens or updates were synthesized.",
    },
  },
  required: ["overview", "designSystem", "screens", "assistantMessage"],
};

export const NEW_SCREEN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    markup: { type: Type.STRING },
    summary: {
      type: Type.STRING,
      description: "A one sentence summary of what this new screen contains.",
    },
  },
  required: ["name", "markup", "summary"],
};

export const MODIFY_SCREEN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    markup: { type: Type.STRING },
    summary: {
      type: Type.STRING,
      description:
        "A brief summary of what specific parts of the screen were changed.",
    },
  },
  required: ["name", "markup", "summary"],
};

/**
 * Types shared between the browser client and the Bun API server.
 * Lives under api/ because the deploy workflow ships api/* to the server,
 * while Vite bundles it into the client via the @api alias.
 */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ReferenceAsset = {
  type: "image" | "html";
  data: string;
  name?: string;
};

export type ScreenSummary = {
  id: string;
  name: string;
  purpose: string;
  markup: string;
};

export type GeneratedUI = {
  overview: {
    name: string;
    description: string;
    targetUsers: string[];
  };
  designSystem: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      accent: string;
      muted: string;
      border: string;
    };
    radius: string;
    font: string;
  };
  screens: {
    id: string;
    name: string;
    purpose: string;
    markup: string;
    position?: { x: number; y: number };
  }[];
  connections?: {
    from: string;
    to: string;
    label: string;
  }[];
  assistantMessage: string;
};

export type ScreenResult = { name: string; markup: string; summary: string };

/** Discriminated union of everything the /generate route accepts. */
export type GenerateRequest =
  | {
      intent: "product";
      prompt: string;
      theme: "light" | "dark";
      architecture: "web" | "app";
      model?: string;
      existingScreens?: ScreenSummary[];
      chatHistory?: ChatMessage[];
      referenceImages?: { mimeType: string; data: string }[];
    }
  | {
      intent: "newScreen";
      purpose: string;
      architecture: "web" | "app";
      designSystem: unknown;
      overview: { name: string; [k: string]: unknown };
      existingScreens: ScreenSummary[];
      chatHistory?: ChatMessage[];
      model?: string;
    }
  | {
      intent: "modifyScreen";
      screenName: string;
      currentMarkup: string;
      instruction: string;
      designSystem: unknown;
      chatHistory?: ChatMessage[];
      model?: string;
    };

/** Usage counters returned alongside every generation so the UI can render quota. */
export type UsageInfo = {
  used: number;
  limit: number;
  isSignedIn: boolean;
};

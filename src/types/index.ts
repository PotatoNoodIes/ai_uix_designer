import type { ChatMessage } from "@/services/geminiService";

export type Breakpoint = "mobile" | "tablet" | "desktop";
export type AIProvider = "gemini" | "openrouter";

export interface Notification {
  message: string;
  type: "success" | "error";
}

export interface ScreenData {
  id: string;
  name: string;
  purpose: string;
  markup: string;
  position?: { x: number; y: number };
  locked?: boolean;
  justCreated?: boolean;
}

export interface ScreenNodeData extends ScreenData {
  designSystem: any;
  currentBreakpoint: Breakpoint;
  isLive: boolean;
  isModifying: boolean;
  isAiBusy: boolean;
  modifyInput: string;
  onModifyInputChange: (v: string) => void;
  onHandleModify: () => void;
  onDeselect: () => void;
  onToggleLive: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export interface ProjectData {
  screens: ScreenData[];
  designSystem: any;
  overview: any;
  architecture?: "web" | "app";
  connections?: { from: string; to: string; label: string }[];
  assistantMessage?: string;
}

export interface Project {
  id: string;
  name: string;
  timestamp: number;
  themePreference: "light" | "dark";
  chatHistory: ChatMessage[];
  data: ProjectData;
}

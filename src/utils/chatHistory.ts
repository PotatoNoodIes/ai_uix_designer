import type { ChatMessage } from "@/services/geminiService";

export function formatChatHistory(history: ChatMessage[] | undefined): string {
  if (!history || history.length === 0) return "";
  return history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
}

import type { ChatMessage } from "@/services/geminiService";

/**
 * Serialises a chat history array into a plain-text block
 * suitable for embedding in an AI prompt.
 * Returns an empty string if history is undefined or empty.
 */
export function formatChatHistory(history: ChatMessage[] | undefined): string {
  if (!history || history.length === 0) return "";
  return history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
}

export const SERVER_ALLOWED_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-flash",
] as const;

export const DEFAULT_MODEL = "gemini-3-flash-preview";

export function resolveServerModel(requested?: string): string {
  if (!requested) return DEFAULT_MODEL;
  return (SERVER_ALLOWED_MODELS as readonly string[]).includes(requested)
    ? requested
    : DEFAULT_MODEL;
}

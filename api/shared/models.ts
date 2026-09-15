/**
 * Models the server will run on OUR key. Anything outside this list is rejected
 * so the proxy can't be used as a general-purpose gateway to arbitrary models.
 *
 * OpenRouter model ids are deliberately absent: those only work on a user's own
 * key and never reach this server.
 */
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

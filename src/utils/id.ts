/**
 * Generates a short random alphanumeric ID, e.g. "k3m9z1a".
 * Used for project and screen IDs.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(7);
}

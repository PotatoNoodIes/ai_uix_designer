/**
 * Performs a deep clone of any serializable value via JSON round-trip.
 * Used for snapshotting undo/redo history entries.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

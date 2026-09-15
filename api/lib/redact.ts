const PATTERNS = [
  /AIza[0-9A-Za-z_-]{10,}/g,
  /AQ\.[0-9A-Za-z_-]{10,}/g,
  /sk_(?:test|live)_[0-9A-Za-z]{10,}/g,
  /\bBearer\s+[0-9A-Za-z._-]{10,}/gi,
];

export function redact(value: unknown): string {
  let text =
    value instanceof Error
      ? `${value.name}: ${value.message}`
      : typeof value === "string"
        ? value
        : (() => {
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          })();

  for (const pattern of PATTERNS) {
    text = text.replace(pattern, "[redacted]");
  }
  return text;
}

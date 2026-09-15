/**
 * Minimal in-memory stand-in for the Upstash REST API, so quota behaviour can
 * be exercised end-to-end without a real Redis.
 *
 * Handles both single commands (["INCR","key"]) and the auto-pipelined batches
 * the client actually sends ([["INCR","k"],["EXPIRE","k","60"]]).
 */
import { createServer } from "node:http";

export function startFakeUpstash(port: number) {
  const store = new Map<string, number>();

  const run = (cmd: unknown[]): { result: unknown } => {
    const op = String(cmd[0] ?? "").toUpperCase();
    const key = String(cmd[1] ?? "");
    switch (op) {
      case "INCR": {
        const next = (store.get(key) ?? 0) + 1;
        store.set(key, next);
        return { result: next };
      }
      case "DECR": {
        const next = (store.get(key) ?? 0) - 1;
        store.set(key, next);
        return { result: next };
      }
      case "GET":
        return { result: store.get(key) ?? null };
      case "SET":
        store.set(key, Number(cmd[2]));
        return { result: "OK" };
      case "EXPIRE":
        return { result: 1 };
      default:
        return { result: null };
    }
  };

  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const raw = Buffer.concat(chunks).toString() || "[]";

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = req.url!.slice(1).split("/").map(decodeURIComponent);
    }

    const isPipeline = Array.isArray(parsed) && Array.isArray(parsed[0]);
    const body = isPipeline
      ? (parsed as unknown[][]).map(run)
      : run(parsed as unknown[]);

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(body));
  });

  return new Promise<{ close: () => void; store: Map<string, number> }>((resolve) => {
    server.listen(port, () => resolve({ close: () => server.close(), store }));
  });
}

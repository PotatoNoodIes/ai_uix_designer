import { startFakeUpstash } from "./fake-upstash.ts";

const redis = await startFakeUpstash(3087);
process.env.UPSTASH_REDIS_REST_URL = "http://localhost:3087";
process.env.UPSTASH_REDIS_REST_TOKEN = "fake";
process.env.GEMINI_API_KEY = "fake-key";
process.env.NODE_ENV = "production";
process.env.GENERATE_HEARTBEAT_MS = "300";
process.env.PORT = "3086";

let pass = 0, fail = 0;
const check = (n: string, c: boolean, d = "") =>
  c ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, console.log(`  FAIL  ${n} ${d}`));

const SLOW_MS = 1800;
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: any, init: any) => {
  if (String(url).includes("generativelanguage")) {
    await new Promise((r) => setTimeout(r, SLOW_MS));
    return new Response("upstream boom", { status: 500 });
  }
  return realFetch(url, init);
}) as typeof fetch;

await import("../api/server.ts");
await new Promise((r) => setTimeout(r, 500));

const started = Date.now();
const res = await realFetch("http://localhost:3086/generate", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": "8.8.8.8" },
  body: JSON.stringify({ intent: "product", prompt: "a fintech app" }),
});
const headersAt = Date.now() - started;

check(`headers arrive before generation finishes (${headersAt}ms, work takes ${SLOW_MS}ms)`,
  headersAt < 600, `${headersAt}ms`);
check("content-type survives the adapter",
  (res.headers.get("content-type") ?? "").includes("text/event-stream"));

const reader = res.body!.getReader();
const dec = new TextDecoder();
let firstChunkAt = 0;
const arrivals: number[] = [];
let raw = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const t = Date.now() - started;
  if (!firstChunkAt) firstChunkAt = t;
  arrivals.push(t);
  raw += dec.decode(value, { stream: true });
}
const total = Date.now() - started;

check(`first body chunk arrives early (${firstChunkAt}ms, not ${total}ms)`, firstChunkAt < 600, `${firstChunkAt}ms`);
check(`chunks arrive over time, not all at once (${arrivals.length} chunks)`, arrivals.length >= 3, `${arrivals.length}`);
check(`last chunk is near the end (${arrivals.at(-1)}ms of ${total}ms)`, (arrivals.at(-1) ?? 0) > SLOW_MS - 400);

const beats = (raw.match(/: keepalive/g) ?? []).length;
check(`heartbeats delivered through the adapter (${beats})`, beats >= 3, `got ${beats}`);

const dataLine = raw.split("\n").find((l) => l.startsWith("data:"));
check("data frame delivered", Boolean(dataLine));

redis.close();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);

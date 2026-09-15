import { startFakeUpstash } from "./fake-upstash.ts";

const redis = await startFakeUpstash(3088);
process.env.UPSTASH_REDIS_REST_URL = "http://localhost:3088";
process.env.UPSTASH_REDIS_REST_TOKEN = "fake";
process.env.GEMINI_API_KEY = "fake-key";
process.env.NODE_ENV = "production";
process.env.GENERATE_HEARTBEAT_MS = "300";

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

const { handleGenerate } = await import("../api/routes/generate.ts");

const started = Date.now();
const res = await handleGenerate(
  new Request("http://localhost/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
    body: JSON.stringify({ intent: "product", prompt: "a fintech app" }),
  })
);

check("responds 200 immediately", res.status === 200, `got ${res.status}`);
check("content-type is text/event-stream",
  (res.headers.get("content-type") ?? "").includes("text/event-stream"));
check("X-Accel-Buffering: no (stops nginx buffering the stream)",
  res.headers.get("x-accel-buffering") === "no");

const reader = res.body!.getReader();
const dec = new TextDecoder();
let firstByteAt = 0, raw = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  if (!firstByteAt) firstByteAt = Date.now() - started;
  raw += dec.decode(value, { stream: true });
}
const total = Date.now() - started;

check(`first byte arrives immediately (${firstByteAt}ms, not ${total}ms)`, firstByteAt < 400, `${firstByteAt}ms`);
check("stream opens with a comment frame", raw.startsWith(": open"));

const beats = (raw.match(/: keepalive/g) ?? []).length;
check(`heartbeats sent during the ${SLOW_MS}ms wait (${beats} of them)`, beats >= 3, `got ${beats}`);

const dataLine = raw.split("\n").find((l) => l.startsWith("data:"));
check("a data frame terminates the stream", Boolean(dataLine));
const payload = JSON.parse(dataLine!.slice(5).trim());
check("upstream failure is reported in the payload", typeof payload.error === "string", JSON.stringify(payload).slice(0, 60));

const { peekQuota } = await import("../api/lib/quota.ts");
const q = await peekQuota({ kind: "anon", ip: "9.9.9.9" });
check("failed generation was refunded", q.used === 0, JSON.stringify(q));

redis.close();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);

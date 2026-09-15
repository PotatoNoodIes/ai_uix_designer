import "./env.ts";
import { reportEnv } from "./env.ts";
import { handleRequest } from "./app.ts";

reportEnv();

const PORT = Number(process.env.PORT ?? 3001);

declare const Bun: { serve: (opts: any) => { port: number } } | undefined;

if (typeof Bun !== "undefined") {
  const server = Bun.serve({ port: PORT, fetch: handleRequest });
  console.log(`[api] listening on port ${server.port} (bun)`);
} else {
  const { createServer } = await import("node:http");

  createServer(async (nodeReq, nodeRes) => {
    const chunks: Buffer[] = [];
    for await (const chunk of nodeReq) chunks.push(chunk as Buffer);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const req = new Request(`http://localhost:${PORT}${nodeReq.url ?? "/"}`, {
      method: nodeReq.method,
      headers: nodeReq.headers as Record<string, string>,
      body: nodeReq.method === "GET" || nodeReq.method === "HEAD" ? undefined : body,
    });

    const res = await handleRequest(req);

    nodeRes.statusCode = res.status;
    res.headers.forEach((value, key) => nodeRes.setHeader(key, value));
    nodeRes.end(Buffer.from(await res.arrayBuffer()));
  }).listen(PORT, () => {
    console.log(`[api] listening on port ${PORT} (node)`);
  });
}

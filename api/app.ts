import { handleGenerate } from "./routes/generate.ts";
import { handleDemoCheck } from "./routes/demo-check.ts";
import { handleUsage } from "./routes/usage.ts";

type Handler = (req: Request) => Promise<Response>;

const routes: Record<string, Handler> = {
  "/generate": handleGenerate,
  "/demo-check": handleDemoCheck,
  "/usage": handleUsage,
};

export async function handleRequest(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  const path = pathname.replace(/^\/uix\/api/, "").replace(/^\/api/, "") || "/";

  if (path === "/health") {
    return Response.json({ ok: true });
  }

  const handler = routes[path];
  if (!handler) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return await handler(req);
  } catch (err) {
    console.error(`[api] unhandled error on ${path}:`, err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

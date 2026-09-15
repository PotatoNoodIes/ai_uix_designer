import { handleGenerate } from "./routes/generate.ts";
import { handleDemoCheck } from "./routes/demo-check.ts";
import { handleUsage } from "./routes/usage.ts";
import { redisStatus } from "./lib/quota.ts";

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
    const redis = await redisStatus();
    return Response.json(
      {
        ok: redis === "ok",
        redis,
        gemini: Boolean(process.env.GEMINI_API_KEY),
        clerk: Boolean(process.env.CLERK_SECRET_KEY),
      },
      { status: redis === "ok" ? 200 : 503 }
    );
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

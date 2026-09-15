/**
 * POST /generate — the only path that spends our Gemini key.
 *
 * Accepts an *intent*, never a raw prompt or response schema: if callers could
 * supply their own systemInstruction this endpoint would be a free
 * general-purpose LLM running on our key.
 */
import { callGemini, type GeminiPart } from "../lib/gemini.ts";
import { getUserId } from "../lib/clerk.ts";
import {
  consumeQuota,
  refundQuota,
  getClientIp,
  type QuotaIdentity,
} from "../lib/quota.ts";
import { resolveServerModel } from "../shared/models.ts";
import {
  buildProductPrompt,
  buildNewScreenPrompt,
  buildModifyScreenPrompt,
} from "../shared/prompts.ts";
import {
  PRODUCT_SCHEMA,
  NEW_SCREEN_SCHEMA,
  MODIFY_SCREEN_SCHEMA,
} from "../shared/schemas.ts";
import type { GenerateRequest } from "../shared/types.ts";

const MAX_REFERENCE_IMAGES = 4;
const MAX_PROMPT_CHARS = 8000;

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function handleGenerate(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (!body || typeof body !== "object" || !("intent" in body)) {
    return badRequest("Missing intent.");
  }

  const model = resolveServerModel(body.model);

  // Build the prompt server-side from the intent.
  let systemInstruction: string;
  let userPrompt: string;
  let responseSchema: unknown;
  const referenceParts: GeminiPart[] = [];

  switch (body.intent) {
    case "product": {
      if (typeof body.prompt !== "string" || !body.prompt.trim()) {
        return badRequest("A prompt is required.");
      }
      if (body.prompt.length > MAX_PROMPT_CHARS) {
        return badRequest("Prompt is too long.");
      }
      ({ systemInstruction, userPrompt } = buildProductPrompt({
        prompt: body.prompt,
        theme: body.theme === "light" ? "light" : "dark",
        architecture: body.architecture === "app" ? "app" : "web",
        existingScreens: body.existingScreens,
        chatHistory: body.chatHistory,
      }));
      responseSchema = PRODUCT_SCHEMA;

      for (const img of (body.referenceImages ?? []).slice(0, MAX_REFERENCE_IMAGES)) {
        if (!img?.data) continue;
        referenceParts.push({
          inlineData: {
            mimeType: img.mimeType || "image/png",
            data: img.data.split(",")[1] || img.data,
          },
        });
      }
      break;
    }

    case "newScreen": {
      if (typeof body.purpose !== "string" || !body.purpose.trim()) {
        return badRequest("A purpose is required.");
      }
      ({ systemInstruction, userPrompt } = buildNewScreenPrompt({
        purpose: body.purpose,
        designSystem: body.designSystem,
        overview: body.overview ?? { name: "Untitled" },
        existingScreens: body.existingScreens ?? [],
      }));
      responseSchema = NEW_SCREEN_SCHEMA;
      break;
    }

    case "modifyScreen": {
      if (typeof body.instruction !== "string" || !body.instruction.trim()) {
        return badRequest("An instruction is required.");
      }
      ({ systemInstruction, userPrompt } = buildModifyScreenPrompt({
        screenName: body.screenName,
        instruction: body.instruction,
        currentMarkup: body.currentMarkup ?? "",
        chatHistory: body.chatHistory,
      }));
      responseSchema = MODIFY_SCREEN_SCHEMA;
      break;
    }

    default:
      return badRequest("Unknown intent.");
  }

  // Identify the caller, then meter before spending anything.
  const userId = await getUserId(req);
  const identity: QuotaIdentity = userId
    ? { kind: "user", userId }
    : { kind: "anon", ip: getClientIp(req) };

  const isDev = process.env.NODE_ENV === "development";

  let quota;
  if (!isDev) {
    try {
      quota = await consumeQuota(identity);
    } catch (err) {
      // Fail CLOSED: unlike the gate screen, this endpoint spends money.
      console.error("[generate] quota check failed:", err);
      return Response.json(
        { error: "Usage limits are unavailable right now. Try again shortly." },
        { status: 503 }
      );
    }

    if (!quota.allowed) {
      return Response.json(
        {
          error: "limit_reached",
          limitType: identity.kind === "user" ? "free" : "demo",
          usage: {
            used: quota.used - 1,
            limit: quota.limit,
            isSignedIn: quota.isSignedIn,
          },
        },
        { status: 429 }
      );
    }
  }

  try {
    const text = await callGemini({
      systemInstruction,
      userPrompt,
      responseSchema,
      model,
      referenceParts,
    });

    return Response.json({
      result: JSON.parse(text),
      usage: quota
        ? { used: quota.used, limit: quota.limit, isSignedIn: quota.isSignedIn }
        : null,
    });
  } catch (err) {
    // Don't charge for our own failure.
    if (quota) await refundQuota(identity);
    console.error("[generate] generation failed:", err);
    return Response.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}

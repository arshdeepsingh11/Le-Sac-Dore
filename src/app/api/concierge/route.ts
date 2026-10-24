import Anthropic from "@anthropic-ai/sdk";
import { fallbackAnswer, systemPrompt, type ChatContext, type ChatMessage } from "@/lib/concierge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 16;
const MAX_CHARS = 2000;

function sanitize(body: unknown): { messages: ChatMessage[]; context: ChatContext } | null {
  if (!body || typeof body !== "object") return null;
  const { messages, context } = body as { messages?: unknown; context?: unknown };
  if (!Array.isArray(messages) || !messages.length) return null;
  const clean = messages
    .filter((m): m is ChatMessage => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  // The API requires the conversation to start with a user turn.
  while (clean.length && clean[0].role !== "user") clean.shift();
  if (!clean.length || clean.at(-1)!.role !== "user") return null;
  const ctx = (context && typeof context === "object" ? context : {}) as ChatContext;
  return {
    messages: clean,
    context: {
      path: typeof ctx.path === "string" ? ctx.path.slice(0, 120) : undefined,
      viewing: typeof ctx.viewing === "string" ? ctx.viewing.slice(0, 60) : undefined,
      bag: Array.isArray(ctx.bag) ? ctx.bag.slice(0, 12) : undefined,
    },
  };
}

const encoder = new TextEncoder();
const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };

/** Streams a pre-written answer in small chunks so the offline concierge feels alive. */
function streamText(text: string) {
  const parts = text.match(/\S+\s*|\s+/g) ?? [text];
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const p of parts) {
        controller.enqueue(encoder.encode(p));
        await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = sanitize(await req.json());
  } catch {
    parsed = null;
  }
  if (!parsed) return new Response("Invalid request.", { status: 400 });
  const { messages, context } = parsed;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(streamText(fallbackAnswer(messages, context)), { headers: { ...headers, "X-Concierge-Mode": "offline" } });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.CONCIERGE_MODEL || "claude-sonnet-5-5";

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model,
          max_tokens: 600,
          system: systemPrompt(context),
          messages,
        });
        req.signal.addEventListener("abort", () => stream.abort());
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("[concierge]", err);
        // Graceful degradation: answer from the built-in catalogue assistant.
        controller.enqueue(encoder.encode(fallbackAnswer(messages, context)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { ...headers, "X-Concierge-Mode": "claude" } });
}

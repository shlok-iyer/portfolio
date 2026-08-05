import { GoogleGenAI } from "@google/genai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SYSTEM_PROMPT } from "@/content/systemPrompt";

/* Region is pinned in vercel.json ("regions": ["iad1"]) rather than here —
   Next 16 deprecated the preferredRegion segment config in favour of
   platform-level configuration. */
export const dynamic = "force-dynamic";

/* gemini-3.6-flash is the current lightweight model and the one Google's own
   quickstart uses. Swap the string to move up or down the range — nothing else
   in this file depends on which model it is. */
const MODEL = "gemini-3.6-flash";

const MAX_MESSAGE_CHARS = 500;
const MAX_TURNS = 10;

type ClientMessage = { role: "user" | "assistant"; content: string };

/* Constructed lazily, not at module scope. The SDK validates the key when you
   build the client, so a module-level `new GoogleGenAI()` runs during `next
   build` (noisy) and, in a deploy where the env var is missing, would throw at
   import time — taking the route down before the friendly 503 below ever runs.
   Memoised so we still build it once per warm instance. */
let client: GoogleGenAI | null = null;
function getClient() {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/* Rate limiting is optional at dev time but the endpoint must not ship without
   it: a public LLM endpoint with no limiter is an open invoice. If Upstash
   isn't configured we fail closed in production and open in development.

   Keys are namespaced with `prefix`, so this can share one Redis database with
   other apps — you do not need a dedicated one. */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "ama",
      analytics: false,
    })
  : null;

function bad(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

/* The Gemini SDK hides the useful text on err.body — err.message is only
   "400 API error occurred: {...}", which tells you nothing. Log the body so a
   bad key, a wrong model name, or a quota trip is readable in Vercel's logs
   instead of turning into a debugging session. */
function describe(err: unknown): unknown {
  if (err && typeof err === "object" && "body" in err) {
    return (err as { body: unknown }).body;
  }
  return err;
}

/* Usage is not reported on one fixed event: step.delta carries a running total
   in metadata, step.stop carries a final `usage`, and interaction.completed
   carries it on the interaction. Read whichever is present so the cache signal
   below is never silently null. */
function usageFrom(event: unknown): unknown {
  if (!event || typeof event !== "object") return null;
  const e = event as {
    usage?: unknown;
    metadata?: { total_usage?: unknown };
    interaction?: { usage?: unknown };
  };
  return e.usage ?? e.interaction?.usage ?? e.metadata?.total_usage ?? null;
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return bad(503, "The chat isn't configured right now. Email me instead.");
  }

  if (!ratelimit && process.env.NODE_ENV === "production") {
    return bad(503, "The chat is temporarily unavailable. Email me instead.");
  }

  if (ratelimit) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return bad(
        429,
        "That's the hourly limit for this chat. Email me and I'll answer properly.",
      );
    }
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return bad(400, "Malformed request.");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return bad(400, "No messages supplied.");
  }

  /* Guards run BEFORE the model call, not after: truncate history, cap the
     message length, and drop anything malformed. This bounds the cost of a
     single request no matter what the client sends. */
  const messages: ClientMessage[] = [];
  for (const raw of body.messages.slice(-MAX_TURNS)) {
    if (typeof raw !== "object" || raw === null) continue;
    const { role, content } = raw as Partial<ClientMessage>;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (text) messages.push({ role, content: text });
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return bad(400, "Expected a user message.");
  }

  /* The Interactions API takes a "step list", not a list of role/content turns.
     The SDK's InteractionsInput type also permits the turn form
     ({role, content}), but this API version rejects it at runtime with
     "use step_list input format instead of turn_list" — so the permissive type
     is not a guide to what the server accepts. */
  const input = messages.map((m) =>
    m.role === "assistant"
      ? {
          type: "model_output" as const,
          content: [{ type: "text" as const, text: m.content }],
        }
      : {
          type: "user_input" as const,
          content: [{ type: "text" as const, text: m.content }],
        },
  );

  try {
    const stream = await getClient().interactions.create({
      model: MODEL,
      /* store: false keeps this stateless — we send the whole history each
         time and Google retains nothing. The default is true, which would
         persist every visitor's conversation server-side. Not our data to keep. */
      store: false,
      system_instruction: SYSTEM_PROMPT,
      generation_config: {
        max_output_tokens: 1024,
        /* Lowercase is required — the API rejects "LOW". The SDK's type is
           `"minimal" | "low" | "medium" | "high" | (string & {})`, and that
           trailing `(string & {})` means TypeScript accepts any string, so a
           wrong case compiles fine and only fails at runtime.
           Latency lever: raise to "medium" if answers get sloppy about the
           "don't invent anything" rule. */
        thinking_level: "low",
      },
      input,
      stream: true,
    });

    /* Pull events until the FIRST token before returning a Response.
       Provider errors (bad key, quota, wrong model name) surface on the first
       read, not at construction. If we streamed immediately, those would land
       after the headers were already sent — the client would see a dead socket
       instead of our fallback card, which is exactly the case graceful
       degradation exists for. */
    const iterator = stream[Symbol.asyncIterator]();
    let firstText = "";
    let usage: unknown = null;

    try {
      for (;;) {
        const { value, done } = await iterator.next();
        if (done) break;
        usage = usageFrom(value) ?? usage;
        if (
          value.event_type === "step.delta" &&
          value.delta.type === "text" &&
          value.delta.text
        ) {
          firstText = value.delta.text;
          break;
        }
      }
    } catch (err) {
      console.error("[ama] model call failed before first token", describe(err));
      return bad(502, "The chat backend didn't respond. Email me instead.");
    }

    const encoder = new TextEncoder();
    const outStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (firstText) controller.enqueue(encoder.encode(firstText));

          for (;;) {
            const { value, done } = await iterator.next();
            if (done) break;
            usage = usageFrom(value) ?? usage;
            if (
              value.event_type === "step.delta" &&
              value.delta.type === "text" &&
              value.delta.text
            ) {
              controller.enqueue(encoder.encode(value.delta.text));
            }
          }

          /* Watch total_cached_tokens here. Gemini caches implicitly rather
             than via an explicit breakpoint, but it still keys on a stable
             prompt prefix — so if this stays 0 across consecutive requests,
             something non-deterministic has crept into systemPrompt.ts and the
             cache is silently dead. */
          console.log("[ama] usage", usage);
        } catch (err) {
          /* Headers are long gone by now, so there is no status code left to
             send. Finish the message in-band rather than erroring the stream:
             the reader keeps the partial answer and sees why it stopped. */
          console.error("[ama] stream failed mid-response", describe(err));
          controller.enqueue(
            encoder.encode(
              "\n\n[The answer was cut off — the connection dropped. Ask again, or email me.]",
            ),
          );
        } finally {
          controller.close();
        }
      },
      cancel() {
        void iterator.return?.();
      },
    });

    return new Response(outStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[ama] request failed", describe(err));
    return bad(502, "The chat backend didn't respond. Email me instead.");
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SYSTEM_PROMPT } from "@/content/systemPrompt";

/* Region is pinned in vercel.json ("regions": ["iad1"]) rather than here —
   Next 16 deprecated the preferredRegion segment config in favour of
   platform-level configuration.

   The reasoning is unchanged: put the function near Anthropic's API rather
   than near the visitor. Time-to-first-token is dominated by the model
   round-trip, not by the browser→Vercel hop, so US-East beats Mumbai. Worth
   re-measuring once there's real traffic. */
export const dynamic = "force-dynamic";

const MAX_MESSAGE_CHARS = 500;
const MAX_TURNS = 10;

type ClientMessage = { role: "user" | "assistant"; content: string };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* Rate limiting is optional at dev time but the endpoint must not ship without
   it: a public LLM endpoint with no limiter is an open invoice. If Upstash
   isn't configured we fail closed in production and open in development. */
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

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
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

  try {
    const stream = anthropic.messages.stream({
      model: "claude-opus-5",
      max_tokens: 1024,
      /* Adaptive thinking stays ON. Disabling it on Opus 5 is a documented
         source of <thinking> tags leaking into visible output; effort is the
         correct latency/cost lever here. */
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    /* Pull events until the FIRST token before returning a Response.
       Anthropic errors (bad key, overloaded, rate limited) surface on the
       first read, not at construction. If we streamed immediately, those would
       land after the headers were already sent — the client would see a dead
       socket ("Failed to fetch") instead of our fallback card, which is
       exactly the case graceful degradation exists for. Buying one round-trip
       here means every pre-token failure is a clean JSON error. */
    const iterator = stream[Symbol.asyncIterator]();
    let firstText = "";

    try {
      for (;;) {
        const { value, done } = await iterator.next();
        if (done) break;
        if (
          value.type === "content_block_delta" &&
          value.delta.type === "text_delta"
        ) {
          firstText = value.delta.text;
          break;
        }
      }
    } catch (err) {
      console.error("[ama] model call failed before first token", err);
      stream.abort();
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
            if (
              value.type === "content_block_delta" &&
              value.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(value.delta.text));
            }
          }

          const final = await stream.finalMessage();
          /* Watch this in the logs. If cache_read stays 0 across consecutive
             requests, something non-deterministic has crept into
             systemPrompt.ts and the cache is silently dead. */
          console.log("[ama] usage", {
            input: final.usage.input_tokens,
            output: final.usage.output_tokens,
            cache_write: final.usage.cache_creation_input_tokens,
            cache_read: final.usage.cache_read_input_tokens,
            stop: final.stop_reason,
          });
        } catch (err) {
          /* Headers are long gone by now, so there is no status code left to
             send. Finish the message in-band rather than erroring the stream:
             the reader keeps the partial answer and sees why it stopped. */
          console.error("[ama] stream failed mid-response", err);
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
        stream.abort();
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
    console.error("[ama] request failed", err);
    return bad(502, "The chat backend didn't respond. Email me instead.");
  }
}

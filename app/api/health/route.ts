import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

/**
 * Uptime-monitor target.
 *
 * Plain GET is cheap and reports only whether env vars are *present* — that's
 * what the 5-minute uptime check wants.
 *
 * `?deep=1` additionally PINGs Redis, because "present" and "correct" are
 * different things: a wrong or quote-wrapped Upstash token passes the presence
 * check and then fails at request time with WRONGPASS buried in the function
 * logs. Deep mode surfaces that from a URL instead.
 */
export async function GET(req: Request) {
  const deep = new URL(req.url).searchParams.get("deep") === "1";

  const body: Record<string, unknown> = {
    ok: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    chatConfigured: Boolean(process.env.GEMINI_API_KEY),
    rateLimiterConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL),
  };

  if (deep) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      body.redis = "not configured — both UPSTASH_REDIS_REST_URL and _TOKEN must be set";
    } else {
      try {
        const pong = await Redis.fromEnv().ping();
        body.redis = `ok (${pong})`;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        body.redis = `FAILED — ${msg}`;
        /* The two mistakes that produce this, in order of likelihood:
           quotes pasted around the value in the Vercel dashboard, or a token
           copied from a different database. */
        if (/WRONGPASS|unauthor/i.test(msg)) {
          body.redisHint =
            "Token rejected. Check the Vercel env var has no surrounding quotes and came from this same database's REST API section.";
        }
        body.ok = false;
      }
    }
  }

  return Response.json(body, { status: body.ok ? 200 : 503 });
}

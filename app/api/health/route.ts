export const dynamic = "force-dynamic";

/** Uptime-monitor target. Reports build identity and whether chat is wired up. */
export function GET() {
  return Response.json({
    ok: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    chatConfigured: Boolean(process.env.GEMINI_API_KEY),
    rateLimiterConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL),
  });
}

# Shlok Iyer — portfolio + "Ask me anything" chatbot

A portfolio laid out as an **engineering drawing set**. Every page is a numbered
sheet with a real title block; the home page is an exploded parts diagram with
hairline leader lines running from the photo to each nav destination.

Sheets: `A-0` Cover · `A-2` Projects · `A-3` Experience · `A-4` Contact · `A-5` Ask me anything.

Next.js 16 (App Router) · React 19 · Tailwind v4 · Google Gen AI SDK (Gemini). Deploys to Vercel.

---

## Run it

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill it in to enable the chat. Without a
key the site still renders completely — only the chat degrades to an inline
"email me instead" card.

---

## Before this goes live

Everything below is marked `TODO(shlok)` in the source.

1. **Photo** — drop it at `public/shlok.jpg`, then set `photo: "/shlok.jpg"` in
   `content/profile.ts`. Until then a registration-marked placeholder holds the
   exact same footprint, so the layout is already final.
2. **Hobbies** — `profile.hobbies` is an empty array. It feeds both the site and
   the chatbot, so anything wrong there becomes something the bot confidently
   tells a recruiter. While it's empty the bot correctly says it doesn't know.
3. **Links** — confirm the GitHub and LinkedIn URLs resolve, and fill in the
   HireOn live-demo URL and the per-project repo links.
4. **Résumé PDF** — drop it at `public/shlok-iyer-resume.pdf`.
5. **`lastRevised`** — bump it when you change content. It's what the title
   block prints.

---

## How the content works

`content/profile.ts` is the **single source of truth**. Every page reads from
it, and `content/systemPrompt.ts` serialises the same object into the chatbot's
system prompt. That's deliberate: the bot cannot contradict the site, because
they are the same data. Editing the site means editing that one file.

### Don't break the prompt cache

The serialised profile is the prefix of every chat request. Gemini caches
implicitly — there's no breakpoint to set — but it still keys on a byte-stable
prefix. Anything that varies per request (a timestamp, a shuffled key order, a
random id) silently kills the cache: the bot gets slower and more expensive,
with no error to tell you.

The route logs usage on every reply:

```
[ama] usage { total_input_tokens, total_output_tokens, total_cached_tokens, ... }
```

**If `total_cached_tokens` stays 0 across consecutive requests, the cache is
dead.** Look for non-determinism in `systemPrompt.ts` first.

---

## Architecture notes

**No RAG, no vector DB, no LangChain.** The whole corpus is a few thousand
tokens and fits in context on every request, so retrieval would add latency and
a service to maintain in exchange for nothing. The profile goes in
`system_instruction` instead. (Same call Shlok made on the YouTube Transcript
Analyzer: the transcript fit the context window, so RAG got skipped.)

**The chat is stateless.** `store: false` means Google keeps no copy of visitor
conversations — the full history is sent each request and nothing is retained
server-side. The SDK's default is `true`.

**The site survives the chat being down.** All four content sheets are
prerendered static and served from the CDN. If the API key is wrong, Anthropic
is down, or the rate limit trips, the portfolio is untouched and only the chat
shows a fallback card. That's a design property, not a promise — `npm run build`
must keep showing `○ (Static)` for `/`, `/projects`, `/experience`, `/contact`.

**Failures return JSON, never a dead socket.** The route pulls the first token
*before* returning a Response, so pre-token errors (bad key, overload, rate
limit) arrive as a proper status the UI can render. Once streaming has started
there's no status code left to send, so a mid-stream drop finishes the message
in-band instead.

**Leader lines measure, they don't hardcode.** `components/LeaderLines.tsx`
reads the photo anchor and each card's edge, then draws. One code path serves
all three compositions. Mode is chosen with the *same* media query the CSS uses
(`min-width: 640px`) — deriving it from container width looks equivalent but
desynchronises between 640–711px, where the container is narrower than the
viewport by the page padding.

---

## Responsive

| Range | Composition |
|---|---|
| `< 640px` | Vertical diagram — photo on top, cards stacked, alternating 16px indent, leader lines running downward |
| `640–1023px` | Two-column — photo left, cards right, short horizontal leader lines |
| `≥ 1024px` | The full scattered cluster |

The diagram **rotates** on small screens; it is never deleted. Chat is a corner
panel ≥768px and a full-screen `100dvh` sheet below that, because a floating
corner card is unusable on a phone.

Nothing is hover-revealed — hover doesn't exist on touch. All tap targets ≥44px.

---

## Deploy (Vercel)

1. Push to GitHub, import the repo at vercel.com.
2. Set env vars from `.env.example`: `GEMINI_API_KEY`,
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
3. `vercel.json` pins the chat function to `iad1` — near Anthropic's API rather
   than near the visitor, because time-to-first-token is dominated by the model
   round-trip. Worth re-measuring once there's real traffic.
4. Point an uptime monitor at `/api/health`.

**The rate limiter is not optional in production.** The route refuses to serve
chat if Upstash isn't configured when `NODE_ENV=production` — a public LLM
endpoint with no limiter is an open invoice. The free tier is enough.

**You don't need a dedicated Redis.** The limiter namespaces every key with an
`ama:` prefix, so it happily shares one Upstash database with other projects —
which matters because the free tier only allows one.

Cost is bounded by: 20 messages/hour/IP, a 500-character message cap, 10 turns
of history, `max_tokens: 1024`, and prompt caching.

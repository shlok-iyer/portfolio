import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Nonce-based CSP: script-src stays strict (no 'unsafe-inline'), which is
   what actually blocks an injected <script> from executing. This requires
   every page to render dynamically (see AGENTS.md — read the Next 16 CSP
   guide before touching this file), since a nonce has to be fresh per
   request and can't live in a pre-built static HTML file.

   style-src gets 'unsafe-inline' rather than a nonce: several components
   (ChatDock, NavCard, SpecRecord, LeaderLines) use React's `style={{...}}`
   prop, which renders as a `style="..."` HTML attribute. CSP nonces only
   apply to <style> elements, not style attributes — allowing them requires
   either 'unsafe-inline' or CSP3's 'unsafe-hashes' with a hash per literal
   value, which isn't practical here since some of those values are computed
   at render time (env(safe-area-inset-bottom) math). CSS-only injection is a
   much weaker primitive than script injection (no arbitrary code execution),
   so this is the standard accepted compromise even in strict CSPs. */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );

  /* X-Content-Type-Options: stops the browser from "sniffing" a response's
     content type and running it as something more dangerous than what the
     server declared (e.g. treating an uploaded file as HTML/JS because it
     guessed instead of trusting Content-Type). No downside to always
     setting this. */
  response.headers.set("X-Content-Type-Options", "nosniff");

  /* Referrer-Policy: when someone clicks a link from this site to somewhere
     else, browsers by default hand the destination your full URL (path,
     query string) as the Referer header. This trims it to just the origin
     on cross-site navigations, and the full URL only for same-site ones —
     nothing here is sensitive today, but it's a free default to not leak
     more than necessary. */
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  /* Permissions-Policy: explicitly turns off browser APIs this site never
     uses (camera, mic, geolocation, etc.), so an injected script — or a
     third-party script added carelessly later — can't invoke them even if
     it otherwise got past the CSP. */
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  /* Strict-Transport-Security (HSTS): tells the browser "only ever talk to
     this site over HTTPS, for the next 2 years, including subdomains" —
     browsers ignore this header entirely unless it arrived over HTTPS
     already, so it's safe to always send. Without it, a visitor who types
     the bare domain or follows an old http:// link could be served one
     plaintext response before any redirect happens, which is the narrow
     window this closes. */
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

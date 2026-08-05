import type { Metadata } from "next";
import Link from "next/link";
import ChatTranscript from "@/components/ChatTranscript";
import CometUnderline from "@/components/CometUnderline";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Ask me anything — ${profile.name.full}`,
  description: `Chat with a bot that knows ${profile.name.first}'s work history and projects.`,
};

/**
 * SHEET A-5 — ASK ME ANYTHING.
 *
 * The full-page chat. Fills the viewport with 100dvh so the composer stays put
 * when the iOS URL bar collapses, and reuses the same transcript component as
 * the dock so behaviour can't drift between them.
 */
export default function Ama() {
  return (
    <main className="relative flex h-[100dvh] flex-col">
      <div className="sheet-frame" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-0 w-full max-w-[820px] flex-1 flex-col px-4 pt-7 pb-4 sm:px-9 sm:pt-9">
        <div className="flex shrink-0 items-baseline justify-between gap-4">
          <p className="u-mono">Sheet A-5 · Ask me anything</p>
          <Link
            href="/"
            className="u-mono inline-flex min-h-[44px] shrink-0 items-center text-ink"
          >
            <span className="border-b border-ink pb-px">← A-0 Cover</span>
          </Link>
        </div>

        <div className="mt-5 flex shrink-0 items-end justify-between gap-4 border-b border-ink pb-4">
          <h1 className="relative inline-block pb-3 font-mono text-[30px] leading-[0.9] font-bold tracking-tight text-ink uppercase sm:text-[40px]">
            ASK ME
            <br />
            ANYTHING
            <CometUnderline />
          </h1>
          <p className="u-mono mb-1 text-right">
            AI trained
            <br />
            on my resume
          </p>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col border border-ink bg-card">
          <ChatTranscript autoFocus />
        </div>

        <p
          className="u-mono mt-3 shrink-0"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          Answers come from what I&apos;ve written down. Anything else —{" "}
          <a
            href={`mailto:${profile.email}`}
            className="border-b border-ink pb-px text-ink"
          >
            {profile.email}
          </a>
        </p>
      </div>
    </main>
  );
}

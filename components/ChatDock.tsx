"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatTranscript from "./ChatTranscript";

/**
 * The chat entry point, present on every sheet except A-5 (which IS the chat).
 *
 * Two different shells below and above 768px, not just two sizes of the same
 * one:
 *   < 768px   an edge-to-edge bottom bar that's a plain link to /ama. It used
 *             to open a fixed, full-screen in-place sheet instead, but a
 *             `position: fixed` sheet opened from a page scrolled to the
 *             bottom renders against a stale scroll offset on some mobile
 *             browsers — it painted clipped to a sliver of the screen
 *             instead of covering it. A real navigation sidesteps the whole
 *             class of bug, and a phone had no room for a transcript and a
 *             keyboard in a small panel anyway.
 *   ≥ 768px   a corner paper card that expands into a panel, in place —
 *             unaffected, since it was never the full-screen fixed sheet.
 */
export default function ChatDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sheet A-5 IS the chat, so the dock hides there.
  const hidden = pathname === "/ama";
  const showPanel = open && !hidden;

  useEffect(() => {
    if (!showPanel) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPanel]);

  if (hidden) return null;

  const barContent = (
    <>
      <span className="font-mono text-[15px] text-blue">›</span>
      <span className="text-[15px] font-semibold text-ink">
        Ask me anything
      </span>
      <span
        className="ml-2 size-[6px] rounded-full bg-yellow"
        aria-hidden="true"
      />
    </>
  );

  return (
    <>
      <Link
        href="/ama"
        className="paper fixed right-0 bottom-0 left-0 z-40 flex min-h-[56px] items-center gap-2 px-5 md:hidden"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingTop: "0.75rem",
        }}
      >
        {barContent}
      </Link>

      {!showPanel ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="paper fixed right-6 bottom-6 z-40 hidden min-h-[52px] items-center gap-2 px-4 md:flex"
        >
          {barContent}
        </button>
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ask me anything"
          className="fixed right-6 bottom-6 z-50 hidden h-[min(560px,74dvh)] w-[380px] flex-col border border-ink bg-card shadow-[3px_3px_0_var(--color-ink)] md:flex"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink px-4 py-3">
            <div>
              <p className="font-mono text-[15px] font-bold tracking-tight text-ink uppercase">
                ASK ME ANYTHING
              </p>
              <p className="u-mono mt-0.5">
                Sheet A-5 · AI trained on my resume
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="paper flex size-11 shrink-0 items-center justify-center text-[18px] leading-none text-ink"
            >
              ×
            </button>
          </div>

          <ChatTranscript autoFocus />
        </div>
      )}
    </>
  );
}

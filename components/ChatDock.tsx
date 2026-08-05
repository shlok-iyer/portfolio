"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ChatTranscript from "./ChatTranscript";

/**
 * The chat entry point, present on every sheet except A-5 (which IS the chat).
 *
 * Two shells, one transcript:
 *   < 768px   an edge-to-edge bottom bar that opens a FULL-SCREEN sheet.
 *             A floating corner card is unusable on a phone — there is no room
 *             for a transcript and a keyboard at once.
 *   ≥ 768px   a corner paper card that expands into a panel.
 *
 * Height uses 100dvh, not 100vh: on iOS the URL bar collapses and 100vh would
 * push the input off-screen. Safe-area padding keeps the bar clear of the home
 * indicator.
 */
export default function ChatDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* Sheet A-5 IS the chat, so the dock hides there. Deriving `showPanel`
     rather than resetting state in an effect matters: the scroll lock below
     keys on this, so navigating to A-5 with the panel open still unlocks the
     body. Keying it on `open` alone would leave the page locked. */
  const hidden = pathname === "/ama";
  const showPanel = open && !hidden;

  useEffect(() => {
    if (!showPanel) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);

    // Lock the page behind the full-screen sheet only — on desktop the panel
    // is small and locking scroll would be obnoxious.
    const small = window.matchMedia("(max-width: 767px)").matches;
    const prev = document.body.style.overflow;
    if (small) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showPanel]);

  if (hidden) return null;

  if (!showPanel) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="paper fixed right-0 bottom-0 left-0 z-40 flex min-h-[56px] items-center gap-2 px-5 md:right-6 md:bottom-6 md:left-auto md:min-h-[52px] md:px-4"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingTop: "0.75rem",
        }}
      >
        <span className="font-mono text-[15px] text-blue">›</span>
        <span className="text-[15px] font-semibold text-ink">
          Ask me anything
        </span>
        <span
          className="ml-2 size-[6px] rounded-full bg-yellow"
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ask me anything"
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col border-ink bg-card md:inset-auto md:right-6 md:bottom-6 md:h-[min(560px,74dvh)] md:w-[380px] md:border md:shadow-[3px_3px_0_var(--color-ink)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink px-4 py-3">
        <div>
          <p className="font-mono text-[15px] font-bold tracking-tight text-ink uppercase">
            ASK ME ANYTHING
          </p>
          <p className="u-mono mt-0.5">Sheet A-5 · AI trained on my resume</p>
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
  );
}

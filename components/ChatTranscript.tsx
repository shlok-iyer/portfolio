"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { useChatStream } from "./useChatStream";

const SUGGESTIONS = [
  "What did you do at Seedling Labs?",
  "How did you cut token usage by 90%?",
  "What are you looking for next?",
];

/**
 * The transcript itself — shared by the desktop dock, the mobile sheet and
 * sheet A-5, so all three behave identically and there is one place to fix.
 */
export default function ChatTranscript({
  autoFocus = false,
  className = "",
}: {
  autoFocus?: boolean;
  className?: string;
}) {
  const { messages, streaming, error, send } = useChatStream();
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, error]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft;
    setDraft("");
    void send(text);
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div
        ref={logRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {messages.length === 0 && !error && (
          <div className="space-y-4">
            <p className="u-body">
              Ask me about my work, my projects, or what I&apos;m looking for.
              I answer from what I&apos;ve actually written down — if I
              haven&apos;t, I&apos;ll say so.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="paper min-h-[44px] px-3 py-2 text-left text-[14px] text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <p
              key={i}
              className="ml-auto max-w-[85%] border border-ink bg-ink px-3 py-2 text-[14px] leading-relaxed text-paper"
            >
              {m.content}
            </p>
          ) : (
            <div key={i} className="max-w-[92%]">
              <p className="u-mono mb-1.5">Shlok</p>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-ink">
                {m.content}
                {streaming && i === messages.length - 1 && (
                  <span className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px] bg-yellow align-baseline" />
                )}
              </p>
            </div>
          ),
        )}

        {error && (
          <div className="border border-ink bg-card p-3">
            <p className="u-mono mb-1.5">Chat unavailable</p>
            <p className="text-[14px] leading-relaxed text-ink">{error}</p>
            <a
              href={`mailto:${profile.email}`}
              className="u-mono inline-flex min-h-[44px] items-center text-ink"
            >
              <span className="border-b border-ink pb-px">{profile.email}</span>
            </a>
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="flex shrink-0 items-stretch gap-2 border-t border-ink px-3 py-3"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="Ask me anything…"
          aria-label="Ask me anything"
          className="min-h-[44px] min-w-0 flex-1 border border-ink bg-card px-3 text-[16px] text-ink placeholder:text-annot"
        />
        <button
          type="submit"
          disabled={streaming || !draft.trim()}
          className="paper min-h-[44px] shrink-0 px-4 text-[14px] font-semibold text-ink disabled:opacity-40"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}

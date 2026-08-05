"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { useChatStream } from "./useChatStream";

/** Small stroke glyphs, drawn in the site's own square-cap line style
 * rather than borrowed from an icon set — a briefcase, a bolt, a compass. */
function IconBriefcase({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.25" y="5.5" width="11.5" height="7.75" />
      <path d="M6 5.5V4.25a2 2 0 0 1 2-2 2 2 0 0 1 2 2V5.5" />
      <path d="M2.25 9.25h11.5" />
    </svg>
  );
}

function IconBolt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.7 1.2 3 9.3h4.1l-1 5.5 5.9-8.6H8l1.7-5Z" />
    </svg>
  );
}

function IconCompass({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M10.3 5.7 8.8 8.8 5.7 10.3 7.2 7.2Z" />
    </svg>
  );
}

const SUGGESTIONS = [
  { text: "What did you do at Seedling Labs?", Icon: IconBriefcase },
  { text: "How did you cut token usage by 90%?", Icon: IconBolt },
  { text: "What are you looking for next?", Icon: IconCompass },
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
          <p className="u-body">
            Ask me about my work, my projects, or what I&apos;m looking for. I
            answer from what I&apos;ve actually written down — if I
            haven&apos;t, I&apos;ll say so.
          </p>
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

      {messages.length === 0 && !error && (
        <div className="flex shrink-0 flex-wrap gap-2 px-4 pt-3">
          {SUGGESTIONS.map(({ text, Icon }) => (
            <button
              key={text}
              type="button"
              onClick={() => void send(text)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-rule bg-card px-3.5 py-1.5 text-left text-[13px] leading-snug text-ink transition-colors hover:border-ink"
            >
              <Icon className="size-3.5 shrink-0 text-annot" />
              {text}
            </button>
          ))}
        </div>
      )}

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

"use client";

import { useCallback, useRef, useState } from "react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Minimal streaming chat client.
 *
 * The route streams plain UTF-8 text, so this is just fetch + a reader — no
 * stream protocol to keep in sync between client and server, and nothing extra
 * in the bundle. That directly serves the low-latency goal.
 */
export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || streaming) return;

      setError(null);
      const history = [...messages, { role: "user" as const, content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error ?? "Something went wrong reaching the chat.",
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: acc }]);
        }

        if (!acc.trim()) {
          throw new Error("The chat came back empty. Try again?");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Drop the empty assistant bubble; the error card replaces it.
        setMessages(history);
        setError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  return { messages, streaming, error, send, reset };
}

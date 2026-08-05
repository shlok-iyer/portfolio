"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Seg = { d: string; len: number; a: [number, number]; b: [number, number] };

/**
 * The signature element: hairline leader lines running from the photo to each
 * nav card, so the home page reads as an exploded parts diagram.
 *
 * This MEASURES rather than hardcodes. It finds the element marked
 * data-leader="anchor" and every data-leader="target" inside its container,
 * then draws orthogonal elbows between them. That is what lets the same code
 * serve all three compositions:
 *
 *   ≥ 640px   lines fan RIGHT from the photo's right edge to each card's left edge
 *   < 640px   the diagram rotates 90° — lines fan DOWN from the photo's bottom
 *             edge to each card's top edge
 *
 * The alternative (three hardcoded path sets) breaks the moment any type or
 * spacing changes. Measuring is correct by construction.
 */
export default function LeaderLines() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const host = hostRef.current;
    const container = host?.parentElement;
    if (!host || !container) return;

    const anchor = container.querySelector<HTMLElement>('[data-leader="anchor"]');
    const targets = Array.from(
      container.querySelectorAll<HTMLElement>('[data-leader="target"]'),
    );
    if (!anchor || targets.length === 0) return;

    const c = container.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();

    /* Mode MUST be driven by the same thing the CSS switches on — the viewport,
       via Tailwind's `sm:` (min-width: 640px). Deriving it from the container's
       own width instead looks equivalent but isn't: the container is narrower
       than the viewport by the page padding, so between 640px and ~711px the
       CSS would be in two-column mode while the lines were still drawing the
       rotated vertical diagram. Same query, same answer, always. */
    const vertical = !window.matchMedia("(min-width: 640px)").matches;

    const next = targets.map((t, i) => {
      const r = t.getBoundingClientRect();

      if (vertical) {
        // Rotated diagram: one trunk drops from the photo's bottom edge and
        // branches off just above each card. Reads as a cable run, not a list.
        const ax = a.left - c.left + a.width / 2;
        const ay = a.bottom - c.top;
        const bx = r.left - c.left + r.width / 2;
        const by = r.top - c.top;
        const mid = Math.max(ay + 8, by - 12);
        return {
          d: `M ${ax} ${ay} L ${ax} ${mid} L ${bx} ${mid} L ${bx} ${by}`,
          len: Math.abs(mid - ay) + Math.abs(bx - ax) + Math.abs(by - mid),
          a: [ax, ay] as [number, number],
          b: [bx, by] as [number, number],
        };
      }

      // Horizontal fan. Each line turns in its own channel (24 + i*12) so the
      // elbows nest instead of overlapping — and, critically, every vertical
      // run happens LEFT of the card cluster, so no line ever crosses a card.
      const ax = a.right - c.left;
      const ay = a.top - c.top + a.height / 2;
      const bx = r.left - c.left;
      const by = r.top - c.top + r.height / 2;
      const mid = Math.min(ax + 24 + i * 12, bx - 12);
      return {
        d: `M ${ax} ${ay} L ${mid} ${ay} L ${mid} ${by} L ${bx} ${by}`,
        len: Math.abs(mid - ax) + Math.abs(by - ay) + Math.abs(bx - mid),
        a: [ax, ay] as [number, number],
        b: [bx, by] as [number, number],
      };
    });

    setBox({ w: c.width, h: c.height });
    setSegs(next);
  }, []);

  useEffect(() => {
    measure();

    const container = hostRef.current?.parentElement;
    if (!container) return;

    // Re-measure on any layout change: viewport resize, font swap, or a card
    // reflowing because its label wrapped.
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    container
      .querySelectorAll('[data-leader="target"], [data-leader="anchor"]')
      .forEach((el) => ro.observe(el));

    /* Belt and braces. ResizeObserver delivery is tied to the rendering
       lifecycle, so a tab that isn't painting (backgrounded, or an embedded
       pane that isn't compositing) can stop receiving callbacks entirely and
       leave the diagram drawn against stale geometry. resize/orientationchange
       are not gated the same way, so between them the lines always catch up. */
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    // Fonts land after first paint and change every box; re-measure when they do.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {box.w > 0 && (
        /* Sized by CSS to fill the host, never by measured pixels. If the
           geometry is ever momentarily stale (a resize we haven't caught yet),
           the worst case is a slightly-scaled diagram — it can no longer push
           the page wider than the viewport and create a horizontal scrollbar. */
        <svg
          viewBox={`0 0 ${box.w} ${box.h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {segs.map((s, i) => (
            <g key={i}>
              <path
                className="leader-path"
                d={s.d}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth={1}
                style={
                  {
                    "--len": s.len,
                    "--delay": `${240 + i * 90}ms`,
                  } as React.CSSProperties
                }
              />
              <circle
                className="leader-dot"
                cx={s.a[0]}
                cy={s.a[1]}
                r={3}
                fill="var(--color-ink)"
                style={
                  { "--dot-delay": `${240 + i * 90}ms` } as React.CSSProperties
                }
              />
              <circle
                className="leader-dot"
                cx={s.b[0]}
                cy={s.b[1]}
                r={2.5}
                fill="var(--color-ink)"
                style={
                  {
                    "--dot-delay": `${860 + i * 90}ms`,
                  } as React.CSSProperties
                }
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

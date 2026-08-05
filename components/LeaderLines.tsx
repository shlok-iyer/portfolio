"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTER_DOTS } from "./RouterGlyph";

type Seg = {
  d: string;
  len: number;
  a: [number, number];
  b: [number, number];
  color: string;
  delay: number;
  dotDelay: number;
};

const TRUNK_COLOR = "var(--color-ink)";
const DRAW_MS = 620;

/**
 * The signature element: hairline leader lines running from the photo to each
 * nav card, so the home page reads as an exploded parts diagram.
 *
 * This MEASURES rather than hardcodes. It finds data-leader="anchor" (the
 * photo), data-leader="router" (the network glyph, desktop only) and every
 * data-leader="target" (a card), then draws orthogonal elbows between them.
 *
 *   ≥ 1024px   photo → router in black, then router → each card in that
 *              card's own accent, shortest branch first — a network diagram
 *   640–1023   photo fans directly to each card, still per-card coloured,
 *              no router (there isn't room to make one read as a diagram)
 *   < 640px    the diagram rotates 90° — same direct fan, running downward
 *
 * Measuring rather than hardcoding three path sets is what lets the same
 * code stay correct when type or spacing changes.
 */
export default function LeaderLines() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [trunk, setTrunk] = useState<Seg | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const host = hostRef.current;
    const container = host?.parentElement;
    if (!host || !container) return;

    const anchor = container.querySelector<HTMLElement>('[data-leader="anchor"]');
    const router = container.querySelector<HTMLElement>('[data-leader="router"]');
    const targets = Array.from(
      container.querySelectorAll<HTMLElement>('[data-leader="target"]'),
    );
    if (!anchor || targets.length === 0) return;

    const c = container.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();

    /* Mode MUST be driven by the same thing the CSS switches on — the
       viewport, via Tailwind's `sm:`/`lg:` breakpoints. Deriving it from the
       container's own width instead looks equivalent but isn't: the
       container is narrower than the viewport by the page padding, so near
       a breakpoint edge the CSS and the measured geometry would disagree
       for a frame. Same query, same answer, always. */
    const horizontal = window.matchMedia("(min-width: 640px)").matches;
    const lg = window.matchMedia("(min-width: 1024px)").matches;
    const routed = horizontal && lg && !!router && router.getClientRects().length > 0;

    if (routed && router) {
      const r = router.getBoundingClientRect();

      // Trunk: photo → router, in ink, drawn first.
      const tax = a.right - c.left;
      const tay = a.top - c.top + a.height / 2;
      const tbx = r.left - c.left;
      const tby = r.top - c.top + r.height / 2;
      const tmid = (tax + tbx) / 2;
      setTrunk({
        d: `M ${tax} ${tay} L ${tmid} ${tay} L ${tmid} ${tby} L ${tbx} ${tby}`,
        len: Math.abs(tmid - tax) + Math.abs(tby - tay) + Math.abs(tbx - tmid),
        a: [tax, tay],
        b: [tbx, tby],
        color: TRUNK_COLOR,
        delay: 0,
        dotDelay: DRAW_MS,
      });

      // Branches: each leaves from the router's own port dot matching its
      // card's accent, so the "line splits into that colour" reads as
      // literally coming off that port, not an arbitrary shared point.
      const branches = targets.map((t, i) => {
        const rect = t.getBoundingClientRect();
        const accentName = t.dataset.accent || "orange";
        const dot =
          ROUTER_DOTS.find((d) => d.accent === accentName) ?? ROUTER_DOTS[0];
        const ax = r.left - c.left + dot.xFrac * r.width;
        const ay = r.top - c.top + dot.yFrac * r.height;
        const bx = rect.left - c.left;
        const by = rect.top - c.top + rect.height / 2;
        const mid = Math.min(ax + 20 + i * 12, bx - 12);
        return {
          d: `M ${ax} ${ay} L ${mid} ${ay} L ${mid} ${by} L ${bx} ${by}`,
          len: Math.abs(mid - ax) + Math.abs(by - ay) + Math.abs(bx - mid),
          a: [ax, ay] as [number, number],
          b: [bx, by] as [number, number],
          color: `var(--color-${accentName})`,
        };
      });

      // The closest card's branch should visibly arrive first — rank by
      // actual path length, not DOM order, and start every branch only
      // once the trunk has finished drawing.
      const byLength = [...branches].sort((p, q) => p.len - q.len);
      setSegs(
        branches.map((br) => {
          const rank = byLength.indexOf(br);
          const delay = DRAW_MS + rank * 110;
          return { ...br, delay, dotDelay: delay + DRAW_MS };
        }),
      );
      setBox({ w: c.width, h: c.height });
      return;
    }

    setTrunk(null);

    const next = targets.map((t, i) => {
      const r = t.getBoundingClientRect();
      // Each card owns one accent (NavCard's `accent` prop, mirrored here as
      // a data attribute); its leader line is traced in the same colour.
      const color = `var(--color-${t.dataset.accent || "orange"})`;
      const delay = 240 + i * 90;

      if (!horizontal) {
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
          color,
          delay,
          dotDelay: delay + DRAW_MS,
        };
      }

      // Horizontal fan (tablet, no router). Each line turns in its own
      // channel so the elbows nest instead of overlapping.
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
        color,
        delay,
        dotDelay: delay + DRAW_MS,
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
      .querySelectorAll(
        '[data-leader="target"], [data-leader="anchor"], [data-leader="router"]',
      )
      .forEach((el) => ro.observe(el));

    /* Belt and braces. ResizeObserver delivery is tied to the rendering
       lifecycle, so a tab that isn't painting (backgrounded, or an embedded
       pane that isn't compositing) can stop receiving callbacks entirely and
       leave the diagram drawn against stale geometry. resize/orientationchange
       are not gated the same way, so between them the lines always catch up. */
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    // Fired by a dragging NavCard once per animation frame — the card's own
    // position updates via a direct DOM style write (not React state), so
    // this is what tells the wires a card actually moved.
    window.addEventListener("leaderlines:update", measure);

    // Fonts land after first paint and change every box; re-measure when they do.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("leaderlines:update", measure);
    };
  }, [measure]);

  const renderSeg = (s: Seg, key: string, aR: number, bR: number) => (
    <g key={key}>
      <path
        className="leader-path"
        d={s.d}
        fill="none"
        stroke={s.color}
        strokeWidth={1.25}
        style={
          {
            "--len": s.len,
            "--delay": `${s.delay}ms`,
            "--leader-color": s.color,
          } as React.CSSProperties
        }
      />
      <circle
        className="leader-dot"
        cx={s.a[0]}
        cy={s.a[1]}
        r={aR}
        fill={s.color}
        style={{ "--dot-delay": `${s.delay}ms` } as React.CSSProperties}
      />
      <circle
        className="leader-dot"
        cx={s.b[0]}
        cy={s.b[1]}
        r={bR}
        fill={s.color}
        style={{ "--dot-delay": `${s.dotDelay}ms` } as React.CSSProperties}
      />
    </g>
  );

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
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {trunk && renderSeg(trunk, "trunk", 3, 2)}
          {segs.map((s, i) => renderSeg(s, `branch-${i}`, 2, 2.5))}
        </svg>
      )}
    </div>
  );
}

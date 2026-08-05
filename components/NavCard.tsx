"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Accent = "orange" | "cyan" | "green" | "red" | "yellow";

type Props = {
  href: string;
  /** Sheet number, printed small in the corner like a part number. */
  sheetRef: string;
  label: string;
  sub: string;
  /**
   * The AMA card is the blue one — the one live surface on the sheet.
   * Contact me is the gold one — a solid shine, not just an accent, since
   * it's the one click every visitor should actually make.
   */
  variant?: "paper" | "blue" | "gold";
  /** Renders the yellow live dot. Yellow appears nowhere else. */
  live?: boolean;
  /** Colours this card's pixel LEDs and its leader line. */
  accent?: Accent;
  className?: string;
};

type DragState = {
  startX: number;
  startY: number;
  baseX: number;
  baseY: number;
  moved: boolean;
};

/**
 * A nav destination, drawn as a plotted part — and a part you can pick up
 * and move, at any screen size. On the desktop diagram that means anywhere
 * on the board; below lg, where cards are stacked in normal document flow,
 * it lifts out of the stack instead (the slot it left stays reserved,
 * since a transform doesn't pull an element out of flow the way lg's
 * position: absolute does).
 *
 * Dragging writes --drag-x/--drag-y straight to the DOM node (not React
 * state) on every pointermove, then fires "leaderlines:update" once per
 * animation frame so LeaderLines re-measures against the card's real,
 * current position. State only gets touched once, on drop — that's what
 * keeps the drag itself smooth instead of round-tripping through React on
 * every pixel of movement.
 *
 * Everything is visible without hover: the label, the sub-label and the shadow
 * are all present by default, because hover does not exist on touch. The card
 * presses in on :active so a tap gets real feedback.
 */
export default function NavCard({
  href,
  sheetRef,
  label,
  sub,
  variant = "paper",
  live = false,
  accent = "orange",
  className = "",
}: Props) {
  const blue = variant === "blue";
  const gold = variant === "gold";
  // Stagger each card's LED blink off its sheet number (A-2, A-3, …) so the
  // cluster reads as one board rather than four cards ticking in lockstep.
  const baseDelay = (parseInt(sheetRef.replace(/\D/g, ""), 10) || 0) * 220;

  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const rafRef = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const applyTransform = (x: number, y: number, instant = false) => {
    const el = linkRef.current;
    if (!el) return;
    if (!instant) {
      el.style.setProperty("--drag-x", `${x}px`);
      el.style.setProperty("--drag-y", `${y}px`);
      return;
    }
    // Used for restoring a position (mount, or a breakpoint crossing),
    // never for a live drag: .paper's own transform transition would
    // otherwise animate this jump into place over 120ms, during which
    // getBoundingClientRect() reports the mid-animation position, not
    // the final one — and since nothing re-measures once the transition
    // actually finishes, the leader line was left permanently pointing
    // at wherever it was measured mid-flight. A live drag doesn't hit
    // this: .dragging already sets transition: none for its whole
    // duration, so every frame's measurement is already the true one.
    const prevTransition = el.style.transition;
    el.style.transition = "none";
    el.style.setProperty("--drag-x", `${x}px`);
    el.style.setProperty("--drag-y", `${y}px`);
    void el.offsetHeight; // force layout before re-enabling the transition
    el.style.transition = prevTransition;
  };

  // Restore this card's last dropped position — or, the very first time,
  // scatter it off the tidy row and remember *that* as its place. Desktop
  // only: below lg the cards are in normal document flow (the mobile/tablet
  // stack), and any offset there would shove them off their in-flow
  // position and pile them on top of each other. A matchMedia listener
  // (not just a check at mount) also zeroes the offset out live if the
  // window crosses the breakpoint — e.g. rotating a tablet — and restores
  // it again crossing back up, without re-scattering or touching storage.
  useEffect(() => {
    const key = `nav-pos:${href}`;
    const mq = window.matchMedia("(min-width: 1024px)");

    const settle = () => {
      if (!mq.matches) {
        applyTransform(0, 0, true);
        setDrag({ x: 0, y: 0 });
        window.dispatchEvent(new Event("leaderlines:update"));
        return;
      }

      let next: { x: number; y: number } | null = null;
      try {
        const saved = window.localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : null;
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          next = parsed;
        }
      } catch {
        // Storage unavailable (private mode, quota) — scatter fresh below.
      }
      if (!next) {
        next = {
          x: Math.round(-30 + Math.random() * 90),
          y: Math.round(-90 + Math.random() * 200),
        };
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Nothing to do — it'll just scatter again next visit.
        }
      }
      applyTransform(next.x, next.y, true);
      // Syncing from localStorage — a browser-only API the server can't
      // see. SSR has to render the offset-free default, and this is what
      // reconciles the client to the real, remembered value right after
      // hydration (or after a breakpoint crossing brings it back).
      setDrag(next);
      window.dispatchEvent(new Event("leaderlines:update"));
    };

    settle();
    mq.addEventListener("change", settle);
    return () => mq.removeEventListener("change", settle);
    // href is stable for a given card instance; this is a mount-only setup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleLeaderUpdate = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      window.dispatchEvent(new Event("leaderlines:update"));
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    // Picking a card up works at any width, mouse or touch — below lg
    // it just lifts out of the stack rather than off a diagram. Without
    // this the browser reads the drag as a text-selection gesture
    // instead of handing it to us.
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is a nicety (keeps tracking if the cursor leaves
      // the card mid-drag) — if the browser refuses it, still drag.
    }
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: drag.x,
      baseY: drag.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // A few pixels of wobble on a tap shouldn't count as a drag.
    if (!d.moved && Math.hypot(dx, dy) > 4) {
      d.moved = true;
      setIsDragging(true);
    }
    if (d.moved) {
      applyTransform(d.baseX + dx, d.baseY + dy);
      scheduleLeaderUpdate();
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    setIsDragging(false);
    if (d?.moved) {
      const next = {
        x: d.baseX + (e.clientX - d.startX),
        y: d.baseY + (e.clientY - d.startY),
      };
      setDrag(next);
      // Only persisted on the desktop diagram. Below lg it's the same
      // storage key but a completely different coordinate system (a
      // stacked card's offset vs. an absolutely-positioned one) — saving
      // it here would leak a mobile drag into the desktop layout, or
      // vice versa, the next time either is opened on this browser.
      // Below-lg drags are session-only: they reset to neutral on the
      // next load, same as the rest of the stacked layout.
      if (window.matchMedia("(min-width: 1024px)").matches) {
        try {
          window.localStorage.setItem(`nav-pos:${href}`, JSON.stringify(next));
        } catch {
          // Storage unavailable — the new position just won't survive a reload.
        }
      }
      // The click that Link's own handler is about to see is the end of
      // this drag, not a tap — swallow it so it doesn't navigate away.
      suppressClick.current = true;
      window.dispatchEvent(new Event("leaderlines:update"));
      // Belt and braces: an in-flight rAF-throttled update from the last
      // pointermove can occasionally still be pending right as this fires,
      // and React's batching can let that stale run land after this one.
      // A second dispatch next frame — after everything from this drag has
      // definitely settled — guarantees the wires end up on the real,
      // final position rather than whichever update happened to land last.
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("leaderlines:update"));
      });
    }
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (suppressClick.current) {
      e.preventDefault();
      suppressClick.current = false;
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      data-leader="target"
      data-accent={accent}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={onClick}
      style={
        {
          "--drag-x": `${drag.x}px`,
          "--drag-y": `${drag.y}px`,
        } as React.CSSProperties
      }
      className={[
        "paper draggable relative flex min-h-[64px] flex-col justify-center px-4 py-3",
        `accent-${accent}`,
        isDragging ? "dragging" : "",
        blue ? "paper--blue items-center text-center" : "",
        gold ? "paper--gold" : "",
        className,
      ].join(" ")}
    >
      {gold && <span className="shine-sweep" aria-hidden="true" />}

      <span
        className={[
          "u-mono absolute top-1.5 right-2",
          blue ? "sheet-ref--blue" : gold ? "sheet-ref--gold" : "text-rule",
        ].join(" ")}
      >
        {sheetRef}
      </span>

      <span
        className={[
          "font-mono text-[14px] leading-tight font-bold tracking-tight uppercase sm:text-[15px]",
          blue ? "text-card" : gold ? "text-on-gold" : "text-ink",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={[
          "u-mono mt-1",
          blue ? "sub--blue" : gold ? "sub--gold" : "",
        ].join(" ")}
      >
        {sub}
      </span>

      {live && (
        <span
          className="absolute bottom-2.5 left-4 size-[6px] rounded-full bg-yellow"
          aria-hidden="true"
        />
      )}

      {/* Solder-pad LEDs — one per corner, echoing the photo plate's
          registration marks in this card's own accent. */}
      {(
        [
          "-top-[2px] -left-[2px]",
          "-top-[2px] -right-[2px]",
          "-bottom-[2px] -left-[2px]",
          "-bottom-[2px] -right-[2px]",
        ] as const
      ).map((pos, i) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`pixel-led ${pos}`}
          style={{ "--led-delay": `${baseDelay + i * 140}ms` } as React.CSSProperties}
        />
      ))}
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";

// Mirrors :root.dark's --color-paper in globals.css. Kept in sync by hand
// rather than read via getComputedStyle because the mobile browser-chrome
// meta tag needs to update in the same tick as the class, not a frame later.
const PAPER_LIGHT = "#e3e1d8";
const PAPER_DARK = "#14171c";

function setThemeColorMeta(isDark: boolean) {
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", isDark ? PAPER_DARK : PAPER_LIGHT);
}

/**
 * Sun/moon theme switch, drawn in the same pixel language as the router's
 * port LEDs. The moon deliberately has no light/dark-specific styling of
 * its own — it's filled with --color-ink, the same token every other line
 * and letter on the sheet uses, so it goes black-on-cream in light mode and
 * white-on-charcoal in dark mode automatically. The sun stays the fixed
 * spot yellow in both.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Syncing from the DOM class the blocking <head> script already set
    // before paint — same documented exception as NavCard's position
    // restore: the server can't see it, so this reconciles React's state
    // to it right after hydration instead of flipping a frame later.
    const isDark = document.documentElement.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
    setThemeColorMeta(isDark);
  }, []);

  const toggle = () => {
    setDark((was) => {
      const next = !was;
      document.documentElement.classList.toggle("dark", next);
      setThemeColorMeta(next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Preference just won't survive a reload — not worth failing over.
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle paper"
    >
      <svg
        className="theme-toggle-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
        shapeRendering="crispEdges"
      >
        <rect x="5" y="5" width="6" height="6" fill="var(--color-yellow)" />
        <rect x="6" y="0" width="4" height="3" fill="var(--color-yellow)" />
        <rect x="6" y="13" width="4" height="3" fill="var(--color-yellow)" />
        <rect x="0" y="6" width="3" height="4" fill="var(--color-yellow)" />
        <rect x="13" y="6" width="3" height="4" fill="var(--color-yellow)" />
      </svg>

      <span className="theme-toggle-divider" aria-hidden="true" />

      <svg
        className="theme-toggle-icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
        shapeRendering="crispEdges"
      >
        <circle cx="8" cy="8" r="6" fill="var(--color-ink)" />
        <circle cx="11" cy="5.5" r="5" fill="var(--color-card)" />
      </svg>
    </button>
  );
}

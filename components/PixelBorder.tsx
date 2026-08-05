import type { ReactNode } from "react";

/**
 * A box outline with a bright "comet" segment that chases the perimeter —
 * clockwise, then back anti-clockwise — instead of sitting as a flat rule.
 * Scales with the box via a 0–100 viewBox, so it needs no JS measurement.
 */
export default function PixelBorder({
  children,
  className = "",
  comet = "md",
  tone = "gold",
}: {
  children: ReactNode;
  className?: string;
  /** Size of the travelling highlight segment — "sm" for compact chips. */
  comet?: "md" | "sm";
  /** Colour of the travelling segment. */
  tone?: "gold" | "red";
}) {
  return (
    <div
      className={`pixel-border pixel-border--${comet} pixel-border--${tone} relative inline-block ${className}`}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="98" height="98" className="pixel-border-base" />
        <rect x="1" y="1" width="98" height="98" className="pixel-border-comet" />
      </svg>
      {children}
    </div>
  );
}

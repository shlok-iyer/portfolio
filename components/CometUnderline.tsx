/**
 * A heading's own comet trace: a static gold base line with a purple
 * highlight that actually travels its length, back and forth — the same
 * perimeter-chasing trick PixelBorder runs on the nav cards, just laid
 * along a straight line instead of a box. Sits inside a `position:
 * relative` heading with room left at the bottom for it (e.g. `pb-3`).
 */
export default function CometUnderline() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[5px] w-full"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line x1="0" y1="2" x2="100" y2="2" className="comet-underline-base" />
      <line x1="0" y1="2" x2="100" y2="2" className="comet-underline-comet" />
    </svg>
  );
}

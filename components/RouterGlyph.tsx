/**
 * The network switch the diagram routes through: a black pixel-art router
 * with four port LEDs, one per card accent. LeaderLines reads ROUTER_DOTS
 * to know exactly where each colour's branch line should leave the glyph
 * from, so the "port lights up, line splits off" read is literal, not just
 * colour-matched.
 *
 * Dark-mode aware on its own — the body swaps from ink to a light outline
 * under prefers-color-scheme: dark, independent of the (currently
 * light-only) rest of the page.
 */
export const ROUTER_DOTS: { accent: string; xFrac: number; yFrac: number }[] = [
  { accent: "red", xFrac: 19 / 64, yFrac: 53 / 72 },
  { accent: "cyan", xFrac: 29 / 64, yFrac: 53 / 72 },
  { accent: "green", xFrac: 39 / 64, yFrac: 53 / 72 },
  { accent: "yellow", xFrac: 49 / 64, yFrac: 53 / 72 },
];

export default function RouterGlyph({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      data-leader="router"
      aria-hidden="true"
      className={`router-glyph ${className}`}
    >
      <svg viewBox="0 0 64 72" className="h-full w-full" shapeRendering="crispEdges">
        {/* antennae */}
        <rect x="17" y="6" width="6" height="26" className="router-body" />
        <rect x="41" y="6" width="6" height="26" className="router-body" />
        {/* body */}
        <rect x="8" y="32" width="48" height="24" className="router-body" />
        {/* feet */}
        <rect x="14" y="56" width="6" height="4" className="router-body" />
        <rect x="44" y="56" width="6" height="4" className="router-body" />
        {/* port LEDs, one per card accent */}
        {ROUTER_DOTS.map((d) => (
          <rect
            key={d.accent}
            x={d.xFrac * 64 - 3}
            y={d.yFrac * 72 - 3}
            width="6"
            height="6"
            fill={`var(--color-${d.accent})`}
          />
        ))}
      </svg>
    </div>
  );
}

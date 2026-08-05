import Link from "next/link";

type Accent = "gold" | "purple";

type Props = {
  /** Part number, e.g. "P-1" or "R-2". */
  ref_: string;
  title: string;
  subtitle?: string;
  meta: { label: string; value: string }[];
  /** Measured results, rendered as a strip of cells. */
  outcomes?: { label: string; value: string }[];
  bullets?: string[];
  links?: { label: string; href: string }[];
  /**
   * Colours this record's corner LEDs (echoing NavCard's solder pads) and
   * washes its Stack/Period rows in the same accent. Undefined leaves the
   * record in plain ink — the Projects sheet's records aren't tied to a
   * single company colour the way Experience's are.
   */
  accent?: Accent;
  /**
   * Washes just the Stack row in the Projects accent (cyan) — no corner
   * LEDs, no Period row. A lighter touch than `accent`, for the sheet
   * that isn't tied to one company colour per record.
   */
  highlightStack?: boolean;
};

/**
 * One record on a spec sheet.
 *
 * A real table cannot survive 375px, so this never is one: it's a bordered
 * record whose label/value rows use a two-column grid that stays legible all
 * the way down. Same component on A-2 and A-3, so both sheets collapse
 * identically.
 */
export default function SpecRecord({
  ref_,
  title,
  subtitle,
  meta,
  outcomes,
  bullets,
  links,
  accent,
  highlightStack,
}: Props) {
  return (
    <article
      className={[
        "relative border border-ink bg-card",
        accent ? `accent-${accent}` : "",
      ].join(" ")}
    >
      {accent &&
        (
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
            style={{ "--led-delay": `${i * 140}ms` } as React.CSSProperties}
          />
        ))}

      <header className="border-b border-ink px-4 py-3 sm:px-5 sm:py-4">
        <p className="u-mono">{ref_}</p>
        <h3
          className={[
            "mt-1 text-[20px] leading-tight tracking-tight text-ink sm:text-[24px]",
            accent
              ? "font-mono font-bold uppercase"
              : "font-display",
          ].join(" ")}
        >
          {title}
        </h3>
        {subtitle && <p className="u-body mt-2">{subtitle}</p>}
      </header>

      <dl className="grid grid-cols-[minmax(84px,auto)_1fr]">
        {meta.map((m) => {
          const isStackRow = m.label === "Stack";
          const highlighted =
            (accent && (isStackRow || m.label === "Period")) ||
            (highlightStack && isStackRow);
          const rowAccent = accent ?? (highlightStack ? "cyan" : undefined);
          return (
            <div
              key={m.label}
              className={["contents", highlighted ? "highlight-row" : ""].join(
                " ",
              )}
              style={
                highlighted
                  ? ({
                      "--card-accent": `var(--color-${rowAccent})`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <dt className="u-mono border-b border-rule px-4 py-2 sm:px-5">
                {m.label}
              </dt>
              <dd className="u-mono border-b border-l border-rule px-4 py-2 text-ink sm:px-5">
                {m.value}
              </dd>
            </div>
          );
        })}
      </dl>

      {outcomes && outcomes.length > 0 && (
        <div className="grid grid-cols-2 border-b border-rule sm:grid-cols-4">
          {outcomes.map((o, i) => (
            <div
              key={o.label}
              className={[
                "px-4 py-3 sm:px-5",
                i % 2 === 0 ? "border-r border-rule" : "",
                "sm:border-r sm:last:border-r-0",
              ].join(" ")}
            >
              <p className="font-display text-[18px] tracking-tight text-ink">
                {o.value}
              </p>
              <p className="u-mono mt-1">{o.label}</p>
            </div>
          ))}
        </div>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
          {bullets.map((b, i) => (
            <li key={i} className="u-body flex gap-3">
              <span
                className="mt-[0.6em] size-[5px] shrink-0 bg-ink"
                aria-hidden="true"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {links && links.length > 0 && (
        <footer className="flex flex-wrap items-center gap-x-5 border-t border-rule px-4 sm:px-5">
          {links.map((l) =>
            l.href === "#" ? (
              <span
                key={l.label}
                className="u-mono inline-flex min-h-[44px] items-center"
              >
                {l.label} — link pending
              </span>
            ) : (
              <Link
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className={[
                  "u-mono inline-flex min-h-[44px] items-center",
                  l.label === "GitHub" ? "link-glow" : "text-ink",
                ].join(" ")}
              >
                <span
                  className={[
                    "pb-px",
                    l.label === "GitHub"
                      ? "border-b border-current"
                      : "border-b border-ink",
                  ].join(" ")}
                >
                  {l.label} ↗
                </span>
              </Link>
            ),
          )}
        </footer>
      )}
    </article>
  );
}

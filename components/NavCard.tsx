import Link from "next/link";

type Props = {
  href: string;
  /** Sheet number, printed small in the corner like a part number. */
  sheetRef: string;
  label: string;
  sub: string;
  /** The AMA card is the blue one — the one live surface on the sheet. */
  variant?: "paper" | "blue";
  /** Renders the yellow live dot. Yellow appears nowhere else. */
  live?: boolean;
  className?: string;
};

/**
 * A nav destination, drawn as a plotted part.
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
  className = "",
}: Props) {
  const blue = variant === "blue";

  return (
    <Link
      href={href}
      data-leader="target"
      className={[
        "paper relative flex min-h-[64px] flex-col justify-center px-4 py-3",
        blue ? "bg-blue" : "",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "u-mono absolute top-1.5 right-2",
          blue ? "text-blueink/70" : "text-rule",
        ].join(" ")}
      >
        {sheetRef}
      </span>

      <span
        className={[
          "font-body text-[15px] leading-tight font-semibold tracking-tight sm:text-base",
          blue ? "text-card" : "text-ink",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={["u-mono mt-1", blue ? "text-blueink" : ""].join(" ")}
      >
        {sub}
      </span>

      {live && (
        <span
          className="absolute bottom-2.5 left-4 size-[6px] rounded-full bg-yellow"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

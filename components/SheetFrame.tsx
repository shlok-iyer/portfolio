import Link from "next/link";
import TitleBlock from "./TitleBlock";

type Props = {
  /** e.g. "A-2" */
  sheet: string;
  /** e.g. "PROJECTS" — rendered in the eyebrow, uppercase */
  title: string;
  /** Home page suppresses the back link (it is the index). */
  showBack?: boolean;
  scale?: string;
  children: React.ReactNode;
};

/**
 * The sheet: inset frame, eyebrow with the sheet number, content, title block.
 * Every page is one of these, which is what makes the set read as a set.
 */
export default function SheetFrame({
  sheet,
  title,
  showBack = true,
  scale,
  children,
}: Props) {
  return (
    <main className="relative min-h-dvh">
      <div className="sheet-frame" aria-hidden="true" />

      {/* Bottom padding clears the mobile chat bar (and its safe-area inset)
          so the title block is never hidden behind it. */}
      <div className="relative mx-auto max-w-[1180px] px-6 pt-7 pb-[calc(88px+env(safe-area-inset-bottom))] sm:px-9 sm:pt-9 lg:px-12 lg:pb-24">
        <div className="flex items-baseline justify-between gap-4">
          <p className="u-mono">
            Sheet {sheet} · {title}
          </p>
          {showBack && (
            <Link
              href="/"
              className="u-mono inline-flex min-h-[44px] shrink-0 items-center text-ink"
            >
              <span className="border-b border-ink pb-px">← A-0 Cover</span>
            </Link>
          )}
        </div>

        {children}

        <TitleBlock sheet={`${sheet} / ${title}`} scale={scale} />
      </div>
    </main>
  );
}

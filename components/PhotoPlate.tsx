import Image from "next/image";
import PixelBorder from "@/components/PixelBorder";
import { profile } from "@/content/profile";

/**
 * The photo, drawn as a mounted plate with corner registration marks — the
 * anchor of the exploded diagram.
 *
 * Until profile.photo is set this renders a placeholder in the exact same
 * footprint, so the layout (and the leader-line geometry) is already final.
 */
export default function PhotoPlate({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <PixelBorder className="pixel-border--block">
        <div
          data-leader="anchor"
          className="relative aspect-[4/5] w-full bg-[var(--color-plate)]"
        >
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt={`${profile.name.full}, ${profile.role}`}
              fill
              priority
              sizes="(max-width: 639px) 168px, (max-width: 1023px) 200px, 220px"
              className="object-cover"
            />
          ) : (
            <>
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 125"
                aria-hidden="true"
              >
                <path
                  d="M0 0 L100 125 M100 0 L0 125"
                  stroke="var(--color-rule)"
                  strokeWidth="0.5"
                  fill="none"
                />
              </svg>
              <span className="u-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-plate)] px-1.5 py-1 whitespace-nowrap">
                Photo · 4:5
              </span>
            </>
          )}

          {/* Registration marks, one per corner. */}
          {(
            [
              "-top-px -left-px border-t border-l",
              "-top-px -right-px border-t border-r",
              "-bottom-px -left-px border-b border-l",
              "-bottom-px -right-px border-b border-r",
            ] as const
          ).map((pos) => (
            <span
              key={pos}
              aria-hidden="true"
              className={`absolute size-2.5 border-ink ${pos}`}
            />
          ))}
        </div>
      </PixelBorder>

      <figcaption className="relative mt-3">
        {/* Hand-built rather than the font's own ";" — at this size the
            pixel typeface's glyph reads as an ambiguous blob, not a
            semicolon. A dot and a hooked, curling tail read clearly at
            any scale. */}
        <svg
          className="semicolon-glyph"
          viewBox="0 0 20 34"
          aria-hidden="true"
        >
          <rect x="7" y="2" width="7" height="7" />
          <rect x="7" y="13" width="7" height="7" />
          <rect x="4" y="19" width="6" height="6" />
          <rect x="1" y="25" width="5" height="5" />
        </svg>
        <p className="u-mono">
          Fig. 1 — <span className="text-ink">{profile.name.full}</span>
        </p>
        <p className="u-mono mt-1.5 leading-relaxed">
          <span className="highlight-chip">CGPA 8.8</span> ·{" "}
          {profile.projects.length} shipped projects
          <br />
          Python / TypeScript / FastAPI / Docker
        </p>
      </figcaption>
    </figure>
  );
}

import Image from "next/image";
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
      <div
        data-leader="anchor"
        className="relative aspect-[4/5] w-full border border-ink bg-[#d6d4ca]"
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
                stroke="#bfbdb2"
                strokeWidth="0.5"
                fill="none"
              />
            </svg>
            <span className="u-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#d6d4ca] px-1.5 py-1 whitespace-nowrap">
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

      <figcaption className="mt-3">
        <p className="u-mono">
          Fig. 1 — <span className="text-ink">{profile.name.full}</span>
        </p>
        <p className="u-mono mt-1.5 leading-relaxed">
          CGPA 8.8 · {profile.projects.length} shipped projects
          <br />
          Python / TypeScript / FastAPI / Docker
        </p>
      </figcaption>
    </figure>
  );
}

import type { Metadata } from "next";
import CometUnderline from "@/components/CometUnderline";
import SheetFrame from "@/components/SheetFrame";
import SpecRecord from "@/components/SpecRecord";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Experience — ${profile.name.full}`,
  description: "Where I've worked and what I shipped there.",
};

/**
 * SHEET A-3 — EXPERIENCE.
 *
 * A work history is literally a revision history, so it's drawn as one. Below
 * 640px the education block stops being a table and becomes stacked records —
 * a four-column table cannot survive a 375px screen.
 */
export default function Experience() {
  return (
    <SheetFrame sheet="A-3" title="Experience" scale="2 roles">
      <h1 className="relative mt-5 inline-block pb-3 font-mono text-[34px] leading-[0.92] font-bold tracking-tight text-ink uppercase sm:mt-6 sm:text-[46px]">
        EXPERIENCE
        <CometUnderline />
      </h1>
      <p className="u-body mt-4 max-w-[58ch]">
        Two internships so far. Both were production work — real users, real
        deploys, real consequences for getting the schema wrong.
      </p>

      <div className="mt-9 space-y-8 sm:mt-12">
        {profile.experience.map((r) => (
          <SpecRecord
            key={r.org}
            ref_={r.sheetRef}
            title={r.org}
            subtitle={r.title}
            meta={[
              { label: "Period", value: r.period },
              { label: "Stack", value: r.tech.join(" · ") },
            ]}
            bullets={r.bullets}
            links={r.links ? [...r.links] : undefined}
            accent={r.org === "Seedling Labs" ? "gold" : "purple"}
          />
        ))}
      </div>

      <h2 className="font-mono mt-14 text-[24px] font-bold tracking-tight text-ink uppercase sm:text-[28px]">
        EDUCATION
      </h2>

      {/* Stacked records, never a table — this is the block that breaks at
          375px if you try to make it one. */}
      <div className="mt-5 space-y-4">
        {profile.education.map((e) => (
          <div key={e.institution} className="border border-ink bg-card">
            <div className="border-b border-ink px-4 py-3 sm:px-5">
              <p className="u-mono">{e.sheetRef}</p>
              <p className="font-mono mt-1 text-[16px] font-bold tracking-tight text-ink uppercase">
                {e.institution}
              </p>
            </div>
            <dl className="grid grid-cols-[minmax(84px,auto)_1fr]">
              {[
                { label: "Course", value: e.qualification },
                { label: "Period", value: e.period },
                { label: "Result", value: e.result },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={[
                    "contents",
                    row.label === "Result" ? "highlight-row" : "",
                  ].join(" ")}
                >
                  <dt
                    className={`u-mono px-4 py-2 sm:px-5 ${i < arr.length - 1 ? "border-b border-rule" : ""}`}
                  >
                    {row.label}
                  </dt>
                  <dd
                    className={`u-mono border-l border-rule px-4 py-2 text-ink sm:px-5 ${i < arr.length - 1 ? "border-b" : ""}`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <h2 className="font-mono mt-14 text-[24px] font-bold tracking-tight text-ink uppercase sm:text-[28px]">
        SKILLS
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Object.entries(profile.skills).map(([group, items]) => (
          <div key={group} className="border border-ink bg-card px-4 py-3 sm:px-5">
            <p className="u-mono">{group}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              {items.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </SheetFrame>
  );
}

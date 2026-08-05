import type { Metadata } from "next";
import CometUnderline from "@/components/CometUnderline";
import SheetFrame from "@/components/SheetFrame";
import SpecRecord from "@/components/SpecRecord";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Projects — ${profile.name.full}`,
  description: "Things I've built, with the numbers they actually produced.",
};

/** SHEET A-2 — PROJECTS. */
export default function Projects() {
  return (
    <SheetFrame sheet="A-2" title="Projects" scale="3 built">
      <h1 className="relative mt-5 inline-block pb-3 font-mono text-[34px] leading-[0.92] font-bold tracking-tight text-ink uppercase sm:mt-6 sm:text-[46px]">
        PROJECTS
        <CometUnderline />
      </h1>
      <p className="u-body mt-4 max-w-[58ch]">
        Three builds, with the results they actually produced. Where there&apos;s
        a number below, it&apos;s measured — not an estimate.
      </p>

      <div className="mt-9 space-y-8 sm:mt-12">
        {profile.projects.map((p) => (
          <SpecRecord
            key={p.name}
            ref_={p.sheetRef}
            title={p.name}
            subtitle={p.summary}
            meta={[
              ...(p.period ? [{ label: "Period", value: p.period }] : []),
              { label: "Stack", value: p.tech.join(" · ") },
            ]}
            outcomes={p.outcomes}
            bullets={p.bullets}
            links={p.links ? [...p.links] : undefined}
            highlightStack
          />
        ))}
      </div>
    </SheetFrame>
  );
}

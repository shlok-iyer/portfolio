import { profile } from "@/content/profile";
import LeaderLines from "@/components/LeaderLines";
import NavCard from "@/components/NavCard";
import PhotoPlate from "@/components/PhotoPlate";
import PixelBorder from "@/components/PixelBorder";
import PixelGlyph from "@/components/PixelGlyph";
import RouterGlyph from "@/components/RouterGlyph";
import TitleBlock from "@/components/TitleBlock";

/**
 * SHEET A-0 — COVER.
 *
 * Three compositions of the same diagram:
 *   < 640px    vertical — photo centred on top, cards stacked, alternating indent
 *   640–1023   two-column — photo left, cards in a right-hand column
 *   ≥ 1024px   the scattered cluster
 *
 * The nav cards carry lg: absolute coordinates; below lg they fall back into
 * normal flow. LeaderLines measures whatever the result is, so the diagram is
 * correct at every width without a second set of numbers.
 */
export default function Home() {
  return (
    <main className="relative min-h-dvh">
      <div className="sheet-frame" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-7 pb-[calc(88px+env(safe-area-inset-bottom))] sm:px-9 sm:pt-9 lg:px-12 lg:pb-20">
        <PixelGlyph />
        <PixelBorder comet="sm">
          <p className="u-mono badge-chip">
            Sheet A-0 · Cover ·{" "}
            <span className="font-bold text-blue">B.M.S.C.E → 2026</span>
          </p>
        </PixelBorder>

        {/* ---- masthead ---- */}
        <div className="mt-5 sm:mt-6 lg:flex lg:items-start lg:gap-12">
          <PixelBorder className="badge-name" tone="red">
            <h1
              className="font-display leading-[0.86] tracking-[-0.035em] text-ink"
              style={{ fontSize: "clamp(38px, 13vw, 54px)" }}
            >
              {profile.name.first.toUpperCase()}
              <br />
              {profile.name.last.toUpperCase()}
            </h1>
          </PixelBorder>

          <div className="mt-5 max-w-[46ch] border-t border-ink pt-3 lg:mt-2 lg:flex-1">
            <p className="u-body">{profile.tagline}</p>
          </div>
        </div>

        {/* ---- the diagram ---- */}
        <div className="relative mt-10 sm:mt-14 lg:mt-16 lg:h-[340px]">
          <LeaderLines />

          <div className="flex flex-col items-center gap-10 sm:grid sm:grid-cols-[200px_1fr] sm:items-start sm:gap-x-14 sm:gap-y-0 lg:contents">
            <PhotoPlate className="w-[168px] shrink-0 sm:w-[200px] lg:absolute lg:top-10 lg:left-0 lg:w-[220px]" />

            <RouterGlyph className="lg:absolute lg:top-[193px] lg:left-[250px] lg:h-[72px] lg:w-[64px]" />

            {/* Single row, ordered by distance from the router — Contact me
                closest, Ask me anything furthest. LeaderLines draws a black
                trunk from the photo to the router, then a branch per card in
                its own accent, shortest branch first. */}
            <div className="flex w-full flex-col gap-4 sm:gap-5 lg:contents">
              <NavCard
                href="/contact"
                sheetRef="A-4"
                label="Contact me"
                sub={`${profile.location} · open to roles`}
                accent="red"
                className="lg:absolute lg:top-[190px] lg:left-[335px] lg:min-h-[78px] lg:w-[150px]"
              />
              <NavCard
                href="/projects"
                sheetRef="A-2"
                label="My projects"
                sub="HireOn · Waste detection · Sahayak"
                accent="cyan"
                className="max-sm:ml-4 lg:absolute lg:top-[190px] lg:left-[505px] lg:min-h-[78px] lg:w-[160px]"
              />
              <NavCard
                href="/experience"
                sheetRef="A-3"
                label="Experience"
                sub="Seedling Labs · Sigma-Aldrich"
                accent="green"
                className="lg:absolute lg:top-[190px] lg:left-[685px] lg:min-h-[78px] lg:w-[160px]"
              />
              <NavCard
                href="/ama"
                sheetRef="A-5"
                label="Ask me anything"
                sub="Talk to a bot that knows my work"
                accent="yellow"
                variant="blue"
                live
                className="max-sm:ml-4 lg:absolute lg:top-[190px] lg:left-[870px] lg:min-h-[92px] lg:w-[210px]"
              />
            </div>
          </div>
        </div>

        <TitleBlock sheet="A-0 / Cover" />
      </div>
    </main>
  );
}

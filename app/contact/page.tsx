import type { Metadata } from "next";
import CometUnderline from "@/components/CometUnderline";
import PixelBorder from "@/components/PixelBorder";
import SheetFrame from "@/components/SheetFrame";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Contact — ${profile.name.full}`,
  description: `Get in touch with ${profile.name.full}.`,
};

/**
 * SHEET A-4 — CONTACT.
 *
 * No form. A form needs a backend, a spam story and a delivery guarantee;
 * mailto has none of those problems and never goes down with the site.
 */
export default function Contact() {
  const rows: { label: string; value: string; href?: string }[] = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { label: "GitHub", value: profile.links.github, href: profile.links.github },
    {
      label: "LinkedIn",
      value: profile.links.linkedin,
      href: profile.links.linkedin,
    },
    { label: "Location", value: profile.location },
  ];

  return (
    <SheetFrame sheet="A-4" title="Contact" scale="1 : 1">
      <h1 className="relative mt-5 inline-block pb-3 font-mono text-[34px] leading-[0.92] font-bold tracking-tight text-ink uppercase sm:mt-6 sm:text-[46px]">
        CONTACT
        <br />
        ME
        <CometUnderline />
      </h1>

      <p className="u-body mt-5 max-w-[54ch]">{profile.lookingFor}</p>

      <PixelBorder className="pixel-border--block mt-9 max-w-[640px] sm:mt-12">
        <div className="bg-card">
          <dl className="grid grid-cols-[minmax(84px,auto)_1fr]">
            {rows.map((r, i, arr) => (
              <div key={r.label} className="contents">
                <dt
                  className={`u-mono px-4 py-3 sm:px-5 ${i < arr.length - 1 ? "border-b border-rule" : ""}`}
                >
                  {r.label}
                </dt>
                <dd
                  className={`border-l border-rule px-4 py-3 sm:px-5 ${i < arr.length - 1 ? "border-b border-rule" : ""}`}
                >
                  {r.href ? (
                    <a
                      href={r.href}
                      target={r.href.startsWith("http") ? "_blank" : undefined}
                      rel={r.href.startsWith("http") ? "noreferrer" : undefined}
                      className="inline-flex min-h-[44px] items-center text-[15px] break-all text-ink underline decoration-rule underline-offset-4"
                    >
                      {r.value}
                    </a>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center text-[15px] text-ink">
                      {r.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </PixelBorder>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <a
          href={`mailto:${profile.email}`}
          className="paper flex min-h-[56px] items-center px-5 text-[15px] font-semibold text-ink"
        >
          Email me →
        </a>
        <a
          href="/api/resume"
          download
          className="paper paper--gold text-on-gold relative flex min-h-[56px] items-center px-5 text-[15px] font-semibold"
        >
          <span className="shine-sweep" aria-hidden="true" />
          Download résumé ↓
        </a>
      </div>
    </SheetFrame>
  );
}

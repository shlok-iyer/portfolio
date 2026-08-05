import { profile } from "@/content/profile";

type Props = {
  sheet: string;
  /** Overrides the default "1 : 1" — used where a real scale reads better. */
  scale?: string;
};

/**
 * The drawing title block. Every real drawing set has one; ours carries real
 * data (the revision is profile.lastRevised, not a decorative string).
 *
 * One markup, two compositions:
 *   < 1024px  full-width footer strip, fields as a 2×2 mono grid
 *   ≥ 1024px  the 214px bordered block, bottom-right
 */
export default function TitleBlock({ sheet, scale = "1 : 1" }: Props) {
  const fields: [string, string][] = [
    ["Drawn by", `${profile.name.first[0]}. ${profile.name.last}`],
    ["Sheet", sheet],
    ["Revision", profile.lastRevised],
    ["Scale", scale],
  ];

  return (
    <div className="mt-12 w-full border border-ink bg-card lg:mt-16 lg:ml-auto lg:w-[214px]">
      <div className="grid grid-cols-2 lg:grid-cols-1">
        {fields.map(([label, value], i) => (
          <div
            key={label}
            className={[
              "flex items-stretch",
              // Hairline rules between cells, none on the outer edges.
              i < 2 ? "border-b border-rule" : "",
              i % 2 === 0 ? "border-r border-rule lg:border-r-0" : "",
              "lg:border-b lg:last:border-b-0",
            ].join(" ")}
          >
            <span className="u-mono w-[74px] shrink-0 border-r border-rule px-2 py-1.5">
              {label}
            </span>
            <span className="u-mono px-2 py-1.5 text-ink">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

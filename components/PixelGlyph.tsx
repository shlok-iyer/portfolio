/**
 * The background signature: an oversized "<>" set in a pixel typeface,
 * rotated on its side so it runs the sheet's full height behind the
 * diagram — code, drawn as structure. Purely decorative.
 */
export default function PixelGlyph() {
  return (
    <div className="pixel-glyph" aria-hidden="true">
      <div className="pixel-glyph-frame">
        <span>{"<>"}</span>
      </div>
    </div>
  );
}

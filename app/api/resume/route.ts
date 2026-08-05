import { profile } from "@/content/profile";

export const dynamic = "force-dynamic";

/**
 * Proxies the résumé so the download always forces a save-as, even when the
 * file lives on UploadThing rather than this origin. The HTML `download`
 * attribute is only honoured by browsers for same-origin links — cross-
 * origin, they just navigate to the file instead of saving it. Streaming it
 * through our own origin with an explicit Content-Disposition sidesteps
 * that regardless of where the file is actually hosted.
 */
export async function GET(req: Request) {
  const resumeUrl = profile.links.resume;

  // The local public/ fallback is already same-origin — a redirect is
  // enough there, no need to buffer the file through this function.
  if (resumeUrl.startsWith("/")) {
    return Response.redirect(new URL(resumeUrl, req.url));
  }

  const upstream = await fetch(resumeUrl);
  if (!upstream.ok || !upstream.body) {
    return new Response("Résumé unavailable", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": 'attachment; filename="shlok-iyer-resume.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

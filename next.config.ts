import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js sends an "X-Powered-By: Next.js" header on every response by
  // default. It doesn't help a real visitor — it just tells anyone probing
  // the site (or an automated scanner) what framework to look up known
  // issues for. Turning it off costs nothing.
  poweredByHeader: false,
  images: {
    // The portfolio photo is hosted on UploadThing (see NEXT_PUBLIC_PHOTO_URL
    // in .env.example) rather than committed to the repo — next/image needs
    // its host allow-listed to optimize an external image. Both patterns
    // cover UploadThing's per-app subdomain and its older shared domain.
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;

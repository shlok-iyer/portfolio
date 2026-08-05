import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

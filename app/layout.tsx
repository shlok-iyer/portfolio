import type { Metadata, Viewport } from "next";
import { Archivo_Black, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import ChatDock from "@/components/ChatDock";
import "./globals.css";

/* Self-hosted at build time by next/font — no runtime request to Google, so
   the type can't flash and a third-party outage can't touch the page. */
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name.full} — ${profile.role}`,
  description: profile.tagline,
  openGraph: {
    title: `${profile.name.full} — ${profile.role}`,
    description: profile.tagline,
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#e3e1d8",
  width: "device-width",
  initialScale: 1,
  /* viewport-fit=cover is what makes env(safe-area-inset-*) resolve to real
     values on notched phones. Without it the chat bar sits under the home
     indicator. */
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${publicSans.variable} ${plexMono.variable} antialiased`}
    >
      <body className="min-h-dvh">
        {children}
        <ChatDock />
      </body>
    </html>
  );
}

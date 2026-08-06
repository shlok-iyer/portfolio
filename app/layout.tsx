import type { Metadata, Viewport } from "next";
import {
  Archivo_Black,
  Public_Sans,
  IBM_Plex_Mono,
  Press_Start_2P,
} from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import { profile } from "@/content/profile";
import ChatDock from "@/components/ChatDock";
import ThemeToggle from "@/components/ThemeToggle";
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
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

/* The background "<>" glyph only — a true pixel-art face so it reads
   as circuitry, not as decorated body type. */
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading headers() opts this layout (and every page under it) into
  // dynamic rendering, which is required for the per-request CSP nonce set
  // in proxy.ts to work — see the comment there.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${publicSans.variable} ${plexMono.variable} ${pressStart.variable} antialiased`}
      // The theme-init script below deliberately adds .dark to this
      // element before React hydrates, so a returning dark-mode visitor
      // never sees a flash of light mode first — the server, which can't
      // see localStorage, always renders without it. React would treat
      // that intentional mismatch as a bug and warn; this tells it not to.
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        {/* Runs before hydration so a returning dark-mode visitor never
            sees a flash of the light theme first. */}
        <Script id="theme-init" strategy="beforeInteractive" nonce={nonce}>
          {`try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`}
        </Script>
        {children}
        <ThemeToggle />
        <ChatDock />
      </body>
    </html>
  );
}

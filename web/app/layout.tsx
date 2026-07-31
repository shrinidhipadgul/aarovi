import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Preloader from "@/components/preloader";
import ScrollProgress from "@/components/scroll-progress";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const canela = localFont({
  src: "../public/fonts/canela/Canela-Bold.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-canela",
});

const canelaDeck = localFont({
  src: [
    {
      path: "../public/fonts/canela/CanelaDeck-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/canela/CanelaDeck-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-canela-deck",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Aarovi",
    default: "Aarovi | Where style meets your soul",
  },
  description:
    "Discover timeless ethnic wear for women and men at Aarovi. Shop kurtas, lehengas, sarees, and more.",
  applicationName: "Aarovi",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "ethnic wear",
    "Indian fashion",
    "kurtas",
    "lehengas",
    "sarees",
    "Aarovi",
    "handcrafted fashion",
  ],
  openGraph: {
    type: "website",
    siteName: "Aarovi",
    locale: "en_IN",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    site: "@aaroviofficial",
    creator: "@aaroviofficial",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${canela.variable} ${canelaDeck.variable} ${inter.variable} ${cormorantGaramond.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Preloader />
        <ScrollProgress />
        <ScrollToTop />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-primary focus:shadow-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

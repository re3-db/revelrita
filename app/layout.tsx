import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import RevealObserver from "@/components/RevealObserver";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://revelrita.com"),
  title: {
    default: "Revelrita | San Diego's bar cart",
    template: "%s | Revelrita",
  },
  description:
    "Revelrita is a mobile bar cart and bartending service in Cardiff, California. Craft cocktails on wheels for weddings, work parties, backyards and pop-ups across San Diego County.",
  openGraph: {
    siteName: "Revelrita",
    images: "/images/hero-cart-window.jpg",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Loaded exactly as the original design did (same families, weights and optical sizes) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Pages Router rule; the root layout covers every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Serif:ital@0;1&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap"
        />
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}

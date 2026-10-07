import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./proposal.css";

/**
 * Root layout for client proposals (/proposal/[id]) and Helen's admin (/admin). Separate
 * from the marketing site's layout: no nav or footer, and the proposal builder's own
 * stylesheet and fonts, loaded the way the original artifact loaded them.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Revelrita proposal",
  robots: { index: false, follow: false },
};

export default function ProposalsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Pages Router rule; this root layout covers every proposal page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,SOFT,wght,WONK@0,9..144,0..60,400..700,0..1;1,9..144,0..60,400..700,0..1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

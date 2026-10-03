import type { NextConfig } from "next";

/**
 * Pages from the old Squarespace site (revelrita.com before the move to Vercel),
 * sent to their closest match here so search rankings and shared links carry over.
 * Permanent (308) so Google transfers the old page's ranking to the new one.
 */
const squarespaceRedirects: [from: string, to: string][] = [
  ["/home", "/"],
  ["/behind-the-bar", "/#story"],
  ["/menu", "/packages"],
  ["/gallery-1", "/gallery"],
  ["/faqs-1", "/faq"],
  ["/contact-6", "/book"],
  ["/wedding-bar-cart-san-diego", "/events"],
  ["/corporate-event-bar-cart-san-diego", "/events"],
  ["/bridal-shower-mobile-bar-san-diego", "/events"],
  ["/backyard-party-bar-cart-san-diego", "/events"],
  ["/fundraiser-bar-cart-san-diego", "/events"],
  ["/retirement-bar-cart-san-diego", "/events"],
  ["/alloccasions-bar-cart-san-diego", "/events"],
  // Leftover Squarespace template pages, never Revelrita content
  ["/welcome", "/"],
  ["/classes", "/"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return squarespaceRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;

import { press } from "@/lib/press";
import { contact, siteUrl } from "@/lib/site";

/** schema.org description of the business, rendered on every page from the root layout. */
export const businessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#business`,
  name: "Revelrita",
  legalName: "revelrita LLC",
  description:
    "Mobile bar cart and bartending service in Cardiff, California. Craft cocktails, mocktails, beer and wine served from a converted pony trailer at weddings, work parties, birthdays, backyard parties and pop-ups across San Diego County.",
  url: siteUrl,
  logo: `${siteUrl}/images/logo-orange.png`,
  image: `${siteUrl}/images/hero-cart-window.jpg`,
  email: contact.email,
  telephone: "+1-803-207-9491",
  foundingDate: "2024",
  founder: { "@type": "Person", name: "Helen Bowman" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cardiff",
    addressRegion: "CA",
    postalCode: "92007",
    addressCountry: "US",
  },
  areaServed: [
    "Cardiff, CA",
    "Encinitas, CA",
    "Leucadia, CA",
    "Solana Beach, CA",
    "Del Mar, CA",
    "Carlsbad, CA",
    "San Diego County, CA",
  ].map((name) => ({ "@type": "Place", name })),
  knowsAbout: ["Mobile bar service", "Bartending", "Craft cocktails", "Mocktails", "Wedding bar service", "Event bartending"],
  // Profiles of the business elsewhere: Instagram, Google Business Profile, Yelp
  sameAs: [contact.instagramHref, "https://share.google/8c6W75ANGrv326BsR", "https://www.yelp.com/biz/revelrita-cardiff-2"],
  subjectOf: press.map((f) => ({
    "@type": "Article",
    headline: f.title,
    url: f.url,
    publisher: { "@type": "Organization", name: f.outlet },
  })),
};

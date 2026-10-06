import type { CSSProperties } from "react";

export const siteUrl = "https://revelrita.com";

export const contact = {
  email: "fun@revelrita.com",
  phone: "(803) 207-9491",
  phoneHref: "tel:+18032079491",
  instagram: "@revelrita",
  instagramHref: "https://instagram.com/revelrita",
};

/** Every page, in the order the full-screen menu lists them. */
export const pages = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/cart", label: "The cart" },
  { href: "/packages", label: "Packages" },
  { href: "/calculator", label: "Drink calculator" },
  { href: "/gallery", label: "Gallery" },
  { href: "/press", label: "Press" },
  { href: "/faq", label: "FAQ" },
  { href: "/book", label: "Book the cart" },
] as const;

/** Stagger for the scroll-reveal animation: sets the --d delay the CSS reads. */
export function delay(ms: number) {
  return { "--d": `${ms}ms` } as CSSProperties;
}

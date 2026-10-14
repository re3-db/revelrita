import type { PriceLine } from "@/lib/proposals";

/**
 * Everything a client can add on. The Packages page lists these names ("Add ons"), and every
 * new proposal offers them, each with Helen's standard price, on the "Make it yours" slide. She
 * changes a price, drops a line or adds one per proposal in the builder.
 *
 * Prices show exactly as written. One that's a plain number ("200") also adds to the client's
 * running total as they tick it; a rate ("$3 per guest") shows as is. Blank shows no price.
 */
type AddOn = {
  name: string;
  price: string;
  note?: string;
  /** Not on the Packages page */
  site?: false;
  /** Only on the Packages page (proposals split it into lines that each have a price) */
  proposals?: false;
};

// Ice comes from Penny Pound Ice ($15 for 15 rock cubes, $15 for a 20 lb bag of pebble ice, $20
// delivery per order). The rest started from what nearby bars charge (Cheers SD's extra bartender
// and servers, TOAST's $3 champagne toast). Helen set every price.
export const ICED_TEA = "Iced Tea + Lemonade";

export const addOns: AddOn[] = [
  { name: "Custom cups", price: "$2.50 per cup (50 minimum)" },
  { name: "Custom napkins", price: "$85 per 100" },
  { name: "Whiskey blocks", price: "$1.75 per cube", note: "Big clear cubes for drinks served down" },
  { name: "Pebble ice", price: "$35 per 40 drinks", note: "The soft, chewable ice, for the long drinks" },
  { name: "Sodas, seltzers and waters, stocked on ice", price: "$3 per guest" },
  { name: ICED_TEA, price: "$125 per 50 guests", site: false },
  {
    name: "Tray-passed welcome champagne",
    price: "200",
    note: "Passed as guests arrive. The bubbly goes on your alcohol order",
  },
  {
    name: "Champagne toast service",
    price: "$3 per guest",
    note: "Poured and passed for the toast. The bubbly goes on your alcohol order",
  },
  { name: "A zero proof menu alongside", price: "150", note: "Two mocktails, with their syrups and garnish" },
  { name: "Cart styling, flowers or greenery", price: "75" },
  { name: "Commercial grade sound", price: "75" },
  { name: "Extra hours or bartenders", price: "", proposals: false },
  { name: "Extra hour", price: "175", note: "The cart and two bartenders", site: false },
  { name: "Extra bartender", price: "250", site: false },
];

/** The Packages page's list */
export const siteAddOns = addOns.filter((a) => a.site !== false).map((a) => a.name);

/**
 * "Custom menu signage" was an add-on for a day. Helen includes the custom menu (What's included
 * says so), so it's no longer offered, and older proposals lose the line (migrateAddOns).
 */
export const CUSTOM_MENU = "Custom menu signage";

/** The number in "90 guests" or "Roughly 50", or null */
export function guestCount(text: string) {
  const m = text.replace(/,/g, "").match(/\d+/);
  const n = m ? Number(m[0]) : 0;
  return n > 0 ? n : null;
}

/** A new proposal's add-on lines */
export const standardAddOns = (): PriceLine[] =>
  addOns.filter((a) => a.proposals !== false).map((a) => ({ label: a.name, amount: a.price, note: a.note ?? "" }));

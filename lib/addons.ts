import type { PriceLine } from "@/lib/proposals";

/**
 * Everything a client can add on. The Packages page lists these names ("Add ons"), and every
 * new proposal offers them, each with its standard price, on the "Make it yours" slide. Helen
 * changes a price, drops a line or adds one per proposal in the builder.
 *
 * A price that's a number ("150") adds to the client's total as they tick it; anything else
 * ("$3 per guest", "Ask") shows as written. Blank shows no price.
 */
export const addOns: { name: string; price: string; note?: string; site?: false }[] = [
  { name: "Custom cups", price: "" },
  { name: "Custom napkins", price: "" },
  { name: "Custom menu signage", price: "" },
  { name: "Whiskey blocks", price: "" },
  { name: "Pebble ice", price: "" },
  // Helen named it with pebble ice for proposals; the Packages page doesn't list it
  { name: "Cubed ice", price: "", site: false },
  { name: "Sodas, seltzers and waters, stocked", price: "" },
  { name: "Tray-passed welcome champagne", price: "" },
  { name: "Champagne toast service", price: "" },
  { name: "A zero proof menu alongside", price: "" },
  { name: "Cart styling, flowers or greenery", price: "" },
  { name: "Commercial grade sound", price: "" },
  { name: "Extra hours or bartenders", price: "" },
];

/** The Packages page's list */
export const siteAddOns = addOns.filter((a) => a.site !== false).map((a) => a.name);

/** A new proposal's add-on lines */
export const standardAddOns = (): PriceLine[] =>
  addOns.map((a) => ({ label: a.name, amount: a.price, note: a.note ?? "" }));

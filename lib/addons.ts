import type { PriceLine } from "@/lib/proposals";

/**
 * Everything a client can add on. The Packages page lists these names ("Add ons"), and every
 * new proposal offers them, each with its standard price, on the "Make it yours" slide. Helen
 * changes a price, drops a line or adds one per proposal in the builder.
 *
 * A price that's a number ("150") adds to the client's total as they tick it; anything else
 * ("$85 per 100") shows as written. Blank shows no price. Ice is priced from the guest count
 * when the proposal has one, so the client sees a real number.
 */
type AddOn = {
  name: string;
  price: string;
  note?: string;
  /** Price (and note) for a party of this many guests */
  forGuests?: (guests: number) => { price: number; note?: string };
  /** Not on the Packages page */
  site?: false;
  /** Comes with cocktail and mocktail packages (in "What's included"), so only beer and wine offers it */
  inCocktails?: true;
};

/*
 * Ice comes from Penny Pound Ice with a $20 delivery fee per order, folded into these prices so
 * clients never see a delivery line (an order of both pays it once, and Helen keeps the rest).
 * Pebble ice: a 20 lb bag is $15. At about 1.5 lbs a guest that's ~$1.15 a guest, so $2.50 a
 * guest with a $75 minimum covers the ice, the delivery and the handling at any party size.
 * Whiskey blocks: $15 for a bag of 15 ($1 a cube), sold at $45 a bag, one bag per 30 guests
 * (a stirred drink for about half of them).
 */
const PEBBLE_PER_GUEST = 2.5;
const PEBBLE_MIN = 75;
const BLOCKS_PER_BAG = 45;

export const addOns: AddOn[] = [
  { name: "Custom cups", price: "" },
  { name: "Custom napkins", price: "$85 per 100" },
  { name: "Custom menu signage", price: "", inCocktails: true },
  {
    name: "Whiskey blocks",
    price: `$${BLOCKS_PER_BAG} per bag of 15`,
    note: "Big clear cubes for drinks served down",
    forGuests: (guests) => {
      const bags = Math.max(1, Math.ceil(guests / 30));
      return {
        price: bags * BLOCKS_PER_BAG,
        note: `${bags === 1 ? "A bag" : `${bags} bags`} of 15 big clear cubes, for drinks served down`,
      };
    },
  },
  {
    name: "Pebble ice",
    price: `$${PEBBLE_PER_GUEST.toFixed(2)} per guest ($${PEBBLE_MIN} minimum)`,
    note: "The soft, chewable ice, for the long drinks",
    forGuests: (guests) => ({ price: Math.max(PEBBLE_MIN, Math.ceil(guests * PEBBLE_PER_GUEST)) }),
  },
  // Helen named it with pebble ice for proposals; the Packages page doesn't list it
  { name: "Cubed ice", price: "", site: false },
  { name: "Sodas, seltzers and waters, stocked", price: "" },
  { name: "Tray-passed welcome champagne", price: "" },
  { name: "Champagne toast service", price: "" },
  { name: "A zero proof menu alongside", price: "" },
  { name: "Cart styling, flowers or greenery", price: "75" },
  { name: "Commercial grade sound", price: "75" },
  { name: "Extra hours or bartenders", price: "" },
];

/** The Packages page's list */
export const siteAddOns = addOns.filter((a) => a.site !== false).map((a) => a.name);

/** "Custom menu signage" goes in "What's included" for every package but beer and wine */
export const CUSTOM_MENU = "Custom menu signage";

/** The number in "90 guests" or "Roughly 50", or null */
export function guestCount(text: string) {
  const m = text.replace(/,/g, "").match(/\d+/);
  const n = m ? Number(m[0]) : 0;
  return n > 0 ? n : null;
}

/**
 * A proposal's add-on lines: priced for its guest count when there is one, and without the
 * custom menu when its package already includes it.
 */
export function standardAddOns({ guests = null, menuIncluded = true }: { guests?: number | null; menuIncluded?: boolean } = {}): PriceLine[] {
  return addOns
    .filter((a) => !(menuIncluded && a.inCocktails))
    .map((a) => {
      const sized = guests && a.forGuests ? a.forGuests(guests) : null;
      return {
        label: a.name,
        amount: sized ? String(sized.price) : a.price,
        note: sized?.note ?? a.note ?? "",
      };
    });
}

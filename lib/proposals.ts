import { CUSTOM_MENU, guestCount, ICED_TEA, standardAddOns } from "@/lib/addons";
import { hoursBetween, timeRange } from "@/lib/dates";
import { drinkLabels, mockMenu, monthIn } from "@/lib/menu";
import { reviewsBy } from "@/lib/reviews";
import { contact } from "@/lib/site";

/**
 * A proposal Helen sends a client: the same fields as her proposal builder artifact
 * ("Revelrita proposal builder"), now stored on the site instead of inside a link.
 * Multi-line fields keep the artifact's formats ("one per line", "title | sentence").
 * Shared by the admin builder (client) and the server, so nothing server-only here.
 */
export type ProposalContent = {
  /** "Who it's for": the hero says "Hey, <name>." */
  name: string;
  /** Sets the accent color (wedding is peach, the rest orange) and "Hi" vs "Hey" */
  eventType: EventType;
  occasion: string;
  date: string;
  /** "5:00 to 9:00 PM" */
  time: string;
  venue: string;
  guests: string;
  serviceWindow: string;
  /** The opening note under the greeting */
  intro: string;
  packageName: string;
  /** One per line */
  included: string;
  /** The opening statement slide (skipped when both are empty) */
  visionTitle: string;
  visionBody: string;
  /** "What makes Revelrita different": "title | sentence" per line, first four shown */
  different: string;
  /** "question | answer" per line */
  faq: string;
  /** Client quote (slide skipped when empty) */
  quote: string;
  quoteBy: string;
  /** Which photos appear, see `photoKeys` */
  photos: PhotoKey[];
  menuTitle: string;
  /** "name | ingredients" per line; "# Group" starts a group, a name alone joins a dotted line */
  menu: string;
  pricing: PriceLine[];
  /** What the client can tick on the "Make it yours" slide (skipped when empty), see lib/addons.ts */
  addOns: PriceLine[];
  deposit: string;
  holdsFor: string;
  peak: string;
  /** "What's in the number": "title | sentence" per line */
  inTheNumber: string;
  pricingNote: string;
  alcohol: string;
  /** One per line */
  steps: string;
  /** The agreement's key terms: "title | sentence" per line, above the fine print (no agreement without them) */
  terms: string;
  email: string;
  phone: string;
  signOff: string;
};

export type PriceLine = { label: string; amount: string; note: string };

export const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate" },
  { value: "private", label: "Private party" },
  { value: "popup", label: "Pop-up or activation" },
] as const;
export type EventType = (typeof eventTypes)[number]["value"];

/** The builder's photo checkboxes, in the artifact's order. */
export const photoKeys = ["cart", "counter", "bar", "drinks", "toast", "bartender", "helen", "guest", "bottles"] as const;
export type PhotoKey = (typeof photoKeys)[number];

export const photoLabels: Record<PhotoKey, string> = {
  cart: "The cart, wide shot (top of the page)",
  counter: "Counter with flowers and menu",
  bar: "Bar top with wine at dusk",
  drinks: "Margaritas with dried lime (above the menu)",
  toast: "Guests toasting (by the menu)",
  bartender: "Guests lined up at the cart",
  helen: "You with the cart (testimonial slide)",
  guest: "Guest laughing at dusk (what's next)",
  bottles: "Bottles on the bar (the numbers)",
};

export type ProposalStatus = "draft" | "sent";

export type Proposal = {
  id: string;
  status: ProposalStatus;
  createdAt: number;
  updatedAt: number;
  /** Where "Send" emails it. Comes from the inquiry form, editable in the builder. */
  clientEmail: string;
  sentAt?: number;
  sentTo?: string;
  /** The inquiry form answers this draft was made from, shown in the builder for reference */
  inquiry?: { answers: [question: string, answer: string][]; receivedAt: number };
  content: ProposalContent;
  /** The add-ons the client ticked and sent from their page (labels from content.addOns) */
  picks?: { labels: string[]; at: number };
  /** Which standard add-ons it has been brought up to (see ADD_ONS_VERSION) */
  addOnsVersion?: number;
  /** When the client tapped "We want to book!" on their proposal */
  bookingRequest?: { at: number };
  /** When Helen sent (or shared) the agreement: its page opens for the client from then on */
  agreementSentAt?: number;
  /** The client's signature on the agreement (outside content, like picks, so the builder's saves keep it) */
  signature?: Signature;
  /** What the client added or asked to change after signing, oldest first */
  amendments?: Amendment[];
};

/**
 * A client's typed signature, with what they signed: edits after sending show up live on their
 * page, so the proposal, the add-ons they signed for and the fine print are kept as they stood.
 */
export type Signature = {
  name: string;
  at: number;
  ip: string;
  userAgent: string;
  content: ProposalContent;
  picks: string[];
  /** FINE_PRINT as it read when they signed (missing on the first few, which had none) */
  fineprint?: string;
};

/** A change after signing: add-ons they added (each a label from content.addOns) and/or a note */
export type Amendment = { at: number; add: string[]; note: string };

/* ---------- the artifact's standard wording ---------- */

export const DEFAULT_ALCOHOL =
  "Due to CA liquor licensing laws, alcohol has to be purchased under your name, not mine. To make it as easy as possible, here's what we do:\n\nI build the full shopping list down to the bottle, then place and manage the Total Wine order. You either pay at checkout with your card, or log into my Total Wine account and pay there. Anything unopened goes home with you!\n\nThat means two separate payments: the alcohol, paid directly by you, and my service invoice for everything above.";

/** The quote every proposal starts with: the whole experience, from booking to cleanup, in one review */
const [standardQuote] = reviewsBy("Grace Kelly");

/* Helen's "What's in the number" lines that changed (older proposals get them, see withCurrentWording) */
const NUMBER_JUICE =
  "Fresh juice, real citrus, thoughtfully designed drinks | The good stuff costs more than sour mix and a bag from the gas station, and you can taste the difference.";
const NUMBER_CART = "The cart, setup and pack-out, everything you'd need for a bar |";
const NUMBER_ALCOHOL = "The alcohol is separate, and you buy it at store prices |";

const INCLUDED_ALCOHOL = "All of your alcohol ordered, prepared, delivered, and iced down for the event";

/* The first of Helen's next steps. For an hour on Oct 16, 2026, new proposals said STEP_SIGN instead,
   while the agreement was a slide on the proposal; withCurrentWording puts hers back. */
const STEP_AGREEMENT = "Say the word and I'll send the invoice and the agreement";
const STEP_SIGN = "Sign the agreement below, and I'll send the deposit invoice";

/** What every proposal asks the client to agree to when they sign ("title | sentence" per line) */
export const STANDARD_TERMS = [
  "Your date | Signing and paying the deposit holds your date. The deposit isn't refundable, because it turns other parties away.",
  "Final details | Your final guest count, menu and add-ons are due 14 days before the event, along with the balance.",
  "Moving your date | Your deposit moves once to a new date within 12 months, as long as that date is open.",
  "If you cancel | More than 30 days out, you only lose the deposit. Within 30 days, the full service fee is owed, since the date can't be rebooked.",
  "If we can't make it | If an emergency keeps Revelrita from your event, you get back everything you've paid, and I'll help find a replacement.",
  "The alcohol | You buy it, in your name, from the shopping list I build. Anything unopened goes home with you.",
  "Responsible service | We serve guests 21 and over, may ask for ID, and can stop serving anyone who's had too much. That call is ours, for everyone's safety.",
  "Setup | We need a level spot and access about 90 minutes before service. Outdoors, plan shade or cover in case of sun or rain.",
  "Running long | Extra time is billed at the Extra hour price, and only with your OK on the night.",
  "Tips | Gratuity isn't included. A tip jar only goes out if you say so.",
  "Photos | We may share photos of the bar setup. Your guests only with their OK.",
  "Insurance | Revelrita carries $1,000,000 in general liability, and your venue can have a certificate at no cost.",
].join("\n");

/* The standard terms as they first went out (Oct 16, 2026), swapped for the current ones by withCurrentWording */
const FIRST_TERMS = [
  "Your date | Signing and paying the deposit holds your date. Until both are in, it's still open to other parties.",
  "Paying | The deposit is due when you sign. The balance, with any add-ons, is due before the event, and I'll invoice you for both.",
  "If you cancel | The deposit holds your date and turns other parties away, so it isn't refundable.",
  "Changes | Guest count, hours and add-ons can change before the event, and the balance invoice reflects them.",
  "The alcohol | You buy it, in your name, and pay for it separately. Anything unopened goes home with you.",
  "Responsible service | We serve guests 21 and over, may ask for ID, and can stop serving anyone who's had too much.",
  "Insurance | Revelrita carries $1,000,000 in general liability, and your venue can have a certificate at no cost.",
].join("\n");

/**
 * The agreement's fine print, under the key terms: the same for every client, so it lives here,
 * not in the builder. Each signature keeps the version it was signed under. "title | paragraph" per line.
 */
export const FINE_PRINT = [
  "The agreement | This agreement is between Revelrita (Helen Bowman, Cardiff, California) and the client who signs it, for the event described above. With the proposal it comes from, it's the whole agreement. Changes are made in writing, including through this page.",
  "Bar service | Revelrita provides the bar, bartenders, setup and pack-out described above. Revelrita doesn't sell or supply alcohol: the client buys it, owns it, and takes home what's left.",
  "Serving responsibly | Bartenders follow California law. They may refuse service to anyone under 21, anyone without valid ID, or anyone who appears intoxicated, and may end service early if conditions become unsafe, without a refund.",
  "The client's part | The client makes sure the venue allows bar service and outside alcohol, covers any venue fees or permits, and is responsible for guests' conduct and getting them home safely.",
  "Liability | Revelrita carries general liability insurance. The client agrees to hold Revelrita harmless for claims arising from guests' drinking or conduct, except where Revelrita was negligent. Revelrita's liability is limited to the amount paid under this agreement.",
  "Equipment | The client is responsible for damage to Revelrita's trailer, bar or equipment caused by guests, beyond normal wear.",
  "Payment | If the balance isn't paid when it's due, Revelrita may treat the event as cancelled by the client, under the cancellation terms above.",
  "Beyond anyone's control | If severe weather, a natural disaster, a public health order or another emergency outside either side's control stops the event, we'll first try to move it to a new date. If that isn't possible, everything paid beyond the deposit is refunded.",
  "Signing online | Typing a name and signing here has the same effect as signing on paper. Both sides can see and print the signed agreement at its link.",
  "California law | This agreement follows California law, and any dispute will be handled in San Diego County.",
].join("\n");

/** Puts the standard terms on a proposal */
export const withStandardTerms = (c: ProposalContent): ProposalContent => ({ ...c, terms: STANDARD_TERMS });

/**
 * What a booking adds up to: the service lines, the add-ons picked (by label, among those offered),
 * and the total of everything with a plain price. Rates like "$3 per guest" stay as written.
 */
export function bookingTotals(c: ProposalContent, picks: string[]) {
  const service = pricedRows(c.pricing);
  const addOns = pricedRows(c.addOns, "").rows.filter((r) => picks.includes(r.label));
  const counted = [...service.counted, ...addOns.filter((r) => r.num !== null)];
  return {
    service,
    addOns,
    total: counted.reduce((sum, r) => sum + (r.num ?? 0), 0),
    counted: counted.length,
    unpriced: addOns.filter((r) => r.num === null),
  };
}

/** In What's included for every package but beer and wine */
export const MENU_INCLUDED = "Custom menu printed and framed";

/** What every package includes (Helen's list), with the custom menu unless it's beer and wine */
export function standardIncluded(withMenu = true) {
  return [
    "The bar cart, styled and ready to go",
    "4 hours of bar service",
    "Bartending for the full service window",
    INCLUDED_ALCOHOL,
    "Drinkware",
    "Ice",
    "Fresh citrus, herbs and garnishes",
    "Mixers, juices and everything non-alcoholic for the cocktails",
    "Setup and pack-out (we leave it cleaner than we found it)",
    "Your shopping list, built and managed by me so you have the correct amount",
    "Coordination with your planner or venue",
    ...(withMenu ? [MENU_INCLUDED] : []),
  ].join("\n");
}

/** Whether a What's included list has the custom menu (it said "Custom menu signage" for a day) */
export const includesMenu = (included: string) =>
  included.split("\n").some((l) => l.trim() === MENU_INCLUDED || l.trim() === CUSTOM_MENU);

export function defaultContent(): ProposalContent {
  return {
    name: "",
    eventType: "wedding",
    occasion: "",
    date: "",
    time: "",
    venue: "",
    guests: "",
    serviceWindow: "",
    intro: "We can't wait to make your party memorable!",
    packageName: "",
    included: standardIncluded(),
    visionTitle: "It started with 600 cocktails.",
    visionBody:
      "Thanks for thinking of Revelrita for your party! The idea started at my own wedding, where I made all 600 drinks myself and learned that craft cocktails at scale are both doable and delicious, and they keep everyone out of a never ending line at the bar.\n\nSo now I do it for other people's parties. Craft cocktails, beer and wine, mocktails only, it doesn't matter. Every guest gets a drink that's delicious.",
    different: [
      "It's a real miniature horse trailer | Restored and painted sky blue, with a live-edge wood bar. It's hard to get cuter than that!",
      "You pay liquor store prices | I build the shopping list, you pay at checkout. No markup, and unopened bottles go home with you.",
      "Craft cocktails, for real | Cucumber vodka infused overnight. A charcoal margarita. A drink named after the birthday boy. Real juice, the right ice, whatever you dream up.",
      "Electric staff | Fun, personable bartenders who are there to make your night great.",
    ].join("\n"),
    faq: [
      "How much space do you need? | The cart is 67 inches wide and 143 inches long, about 5.5 by 12 feet, and needs a level spot to park with a little room for people to gather. If that won't fit, we bring a smaller bar that will.",
      "How early do you arrive? | Early enough to park, set up and style the bar, and be pouring the minute your bar opens. Usually about ninety minutes ahead.",
      "How far do you travel? | We're based in Cardiff and cover San Diego County. Farther than that is usually still a yes, it just adds a travel fee.",
      "What if we don't want hard liquor? | Beer and wine only, mocktails only, any combination. The care that goes into the drinks doesn't change.",
    ].join("\n"),
    quote: standardQuote.quote,
    quoteBy: `${standardQuote.name}, Google review`,
    photos: [...photoKeys],
    menuTitle: "",
    menu: "",
    pricing: [],
    addOns: standardAddOns(),
    deposit: "",
    holdsFor: "",
    peak: "",
    inTheNumber: [
      NUMBER_JUICE,
      "A prep day before your event | Shopping, batching, ice pickup. Everything ready before we pull up.",
      "Bartenders who are actually good | Paid properly, which is why they're fun.",
      NUMBER_CART,
      NUMBER_ALCOHOL,
    ].join("\n"),
    pricingNote: "",
    alcohol: DEFAULT_ALCOHOL,
    steps: [
      STEP_AGREEMENT,
      "The deposit holds your date",
      "We lock the menu, then I build your shopping list",
      "I show up early, set up, and you go be a guest at your own party",
    ].join("\n"),
    terms: STANDARD_TERMS,
    email: contact.email,
    phone: contact.phone,
    signOff: "Can't wait. Let's make it a party!",
  };
}

/* ---------- pricing ---------- */

export const money = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/**
 * The pricing lines as the client's page shows them (the artifact's rules): amounts that are
 * numbers get formatted and added up, anything else ("Included", "TBD") shows as typed, and a
 * blank one shows `blank`. Add-ons use the same rules, with no "TBD".
 */
export function pricedRows(pricing: PriceLine[], blank = "TBD") {
  const rows = pricing
    .map((row) => {
      const r = { label: row.label.trim(), amount: row.amount.trim(), note: row.note.trim() };
      // "Bar cart, 4 hours: $850" typed all in the first box still counts as an amount
      if (!r.amount) {
        const m = r.label.match(/[:\-\u2013]?\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)\s*\$?\s*$/);
        if (m) {
          r.amount = m[1];
          r.label = r.label
            .slice(0, m.index)
            .replace(/[\s:,\-]+$/, "")
            .trim();
        }
      }
      const raw = r.amount.replace(/[$,\s]/g, "");
      const num = raw !== "" && /^[0-9.]+$/.test(raw) ? parseFloat(raw) : null;
      return { ...r, num, display: num !== null ? money(num) : r.amount || blank };
    })
    .filter((r) => r.label || r.amount);
  const counted = rows.filter((r) => r.num !== null);
  const total = counted.reduce((sum, r) => sum + (r.num ?? 0), 0);
  return { rows, counted, total };
}

/* ---------- every section, every time ---------- */

/** A mock-up menu for this proposal: from its inquiry, or its occasion, event type and date (lib/menu.ts) */
export function menuFor(c: ProposalContent, inquiry?: Proposal["inquiry"]) {
  const said = (question: string) => inquiry?.answers.find(([q]) => q === question)?.[1] ?? "";
  const drinksLabel = said("What are you thinking for drinks?");
  return mockMenu({
    drinks: Object.keys(drinkLabels).find((k) => drinkLabels[k] === drinksLabel) ?? "",
    kind: [said("What kind of event is it?"), c.occasion].join(" "),
    vibe: [said("Where is it, and what's the vibe?"), c.venue].join(" "),
    name: c.name,
    eventType: c.eventType,
    month: monthIn(c.date) ?? monthIn(said("Event date")),
    year: Number(`${c.date} ${said("Event date")}`.match(/\b20\d\d\b/)?.[0]) || null,
  });
}

/**
 * Every proposal shows every section. One missing its quote, its menu or a price line (made
 * before those were standard, or started by hand) gets the standard one when it's opened:
 * Grace Kelly's quote, a mock-up menu from their inquiry (or the event type and date), and a
 * "Bar cart and two bartenders" line for Helen to price. A blank time takes the one from their
 * inquiry, if they gave one (the proposal shows "TBD" otherwise). Clearing one brings it back.
 */
export function withAllSections(content: ProposalContent, inquiry?: Proposal["inquiry"]): ProposalContent {
  const c = { ...content };
  const said = (question: string) => inquiry?.answers.find(([q]) => q === question)?.[1] ?? "";
  if (!c.time.trim()) c.time = said("Event time");
  if (!c.quote.trim()) {
    c.quote = standardQuote.quote;
    c.quoteBy = c.quoteBy.trim() || `${standardQuote.name}, Google review`;
  }
  if (!c.menu.trim()) {
    const menu = menuFor(c, inquiry);
    c.menu = menu.menu;
    c.menuTitle = c.menuTitle.trim() || menu.menuTitle;
  }
  if (!c.pricing.some((r) => r.label.trim() || r.amount.trim())) {
    const hours = c.serviceWindow.trim();
    c.pricing = [{ label: `Bar cart and two bartenders${hours ? `, ${hours}` : ""}`, amount: "", note: "" }];
  }
  return c;
}

/**
 * Standard wording that changed after some proposals were made: Helen rewrote What's included and
 * What's in the number, the sound system, pebble ice and whiskey blocks became add-ons, the
 * agreement's first standard terms were replaced, and the first next step went back to hers. Every proposal, sent ones
 * too (Helen's call), gets the current wording: a What's included that's still one of the old
 * standard lists becomes the new one, and elsewhere old lines are swapped where they're still
 * there word for word. Anything Helen wrote herself stays.
 */
const oldIncluded = (sound: boolean, menu: boolean) =>
  [
    "The bar cart, styled and ready to go",
    "Two bartenders for the full service window",
    "Drinkware",
    "Ice",
    "Fresh citrus, herbs and garnishes",
    "Mixers, juices and everything non-alcoholic",
    ...(menu ? [CUSTOM_MENU] : []),
    ...(sound ? ["Commercial sound system"] : []),
    "Setup and pack-out, we leave it cleaner than we found it",
    "Your shopping list, built and managed by me",
    "Coordination with your planner or venue",
  ].join("\n");
const oldIncludedLists = [true, false].flatMap((sound) => [true, false].map((menu) => oldIncluded(sound, menu)));

const retired: Record<"included" | "inTheNumber", [old: string, now: string | null][]> = {
  included: [
    ["Commercial sound system", null],
    ["All of your alcohol ordered and delivered to the event", INCLUDED_ALCOHOL],
  ],
  inTheNumber: [
    [
      "Fresh juice, real citrus, pebble and block ice | The good stuff costs more than sour mix and a bag from the gas station, and you can taste the difference.",
      NUMBER_JUICE,
    ],
    ["Fresh juice and real citrus | The good stuff costs more than sour mix, and you can taste the difference.", NUMBER_JUICE],
    ["The cart, the sound system, setup and pack-out |", NUMBER_CART],
    ["The cart, setup and pack-out |", NUMBER_CART],
    [
      "The alcohol is separate, and you buy it at store prices | So the total usually lands under what a catered bar charges for the same night.",
      NUMBER_ALCOHOL,
    ],
  ],
};

export function withCurrentWording(content: ProposalContent, inquiry?: Proposal["inquiry"]): ProposalContent {
  const included = content.included
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  if (oldIncludedLists.includes(included)) {
    const drinks = inquiry?.answers.find(([q]) => q === "What are you thinking for drinks?")?.[1];
    const withMenu = includesMenu(included) || drinks !== drinkLabels["beer-wine"];
    content = { ...content, included: standardIncluded(withMenu) };
  }
  const reword = (text: string, swaps: [string, string | null][]) =>
    text
      .split("\n")
      .flatMap((line) => {
        const swap = swaps.find(([old]) => line.trim() === old);
        return !swap ? [line] : swap[1] === null ? [] : [swap[1]];
      })
      .join("\n");
  const terms = content.terms
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  return {
    ...content,
    included: reword(content.included, retired.included),
    inTheNumber: reword(content.inTheNumber, retired.inTheNumber),
    steps: reword(content.steps, [[STEP_SIGN, STEP_AGREEMENT]]),
    // A signed proposal keeps a copy of the terms it was signed under (signature.content), untouched
    terms: terms === FIRST_TERMS ? STANDARD_TERMS : content.terms,
  };
}

/** When add-ons first went live (pushed Oct 14, 2026 at 9:12 AM Pacific) */
export const ADD_ONS_LIVE = Date.UTC(2026, 9, 14, 16, 30);

/**
 * Bumped when the standard add-ons change. A proposal saved at an older version gets
 * migrateAddOns once when read, and is stamped with this version the next time it's saved.
 */
export const ADD_ONS_VERSION = 2;

// Prices the first versions filled in for a party of `g` guests (they multiplied rates out)
const oldPrices: Record<string, (g: number | null) => string[]> = {
  "Whiskey blocks": (g) => ["$45 per bag of 15", ...(g ? [String(45 * Math.max(1, Math.ceil(g / 30)))] : [])],
  "Pebble ice": (g) => ["$2.50 per guest ($75 minimum)", ...(g ? [String(Math.max(75, Math.ceil(g * 2.5)))] : [])],
  "Sodas, seltzers and waters, stocked": (g) => ["$2.50 per guest", ...(g ? [String(Math.ceil(g * 2.5))] : [])],
  "Champagne toast service": (g) => ["$3 per guest", ...(g ? [String(Math.ceil(g * 3))] : [])],
};
const renamed: Record<string, string> = {
  "Sodas, seltzers and waters, stocked": "Sodas, seltzers and waters, stocked on ice",
};
const oldNote = /^(A bag|\d+ bags) of 15 big clear cubes, for drinks served down$/;

/**
 * Brings an older proposal's add-ons up to Helen's current ones: cubed ice and custom menu
 * signage come out; a standard add-on with no price, or a price an earlier version filled in,
 * gets her current price (and name, and note); "Extra hours or bartenders" becomes the extra
 * hour and extra bartender; and Iced Tea + Lemonade is added. Prices she typed stay. A draft
 * from before add-ons existed gets the whole list; a sent one stays as the client saw it.
 */
export function migrateAddOns(p: Proposal): PriceLine[] {
  const c = p.content;
  if (!c.addOns.length) return p.status === "draft" && p.createdAt < ADD_ONS_LIVE ? standardAddOns() : [];
  const standard = standardAddOns();
  const guests = guestCount(c.guests);
  const has = (label: string) => c.addOns.some((r) => r.label.trim() === label);
  const out = c.addOns.flatMap((r): PriceLine[] => {
    const label = r.label.trim();
    const amount = r.amount.trim();
    if (/cubed ice/i.test(label) || label === CUSTOM_MENU) return [];
    if (label === "Extra hours or bartenders") {
      return amount ? [r] : standard.filter((s) => /^Extra (hour|bartender)$/.test(s.label) && !has(s.label));
    }
    const now = standard.find((s) => s.label === (renamed[label] ?? label));
    if (!now || (amount && !(oldPrices[label]?.(guests) ?? []).includes(amount))) return [r];
    const note = !r.note.trim() || oldNote.test(r.note.trim()) ? now.note : r.note;
    return [{ label: now.label, amount: now.amount, note }];
  });
  if (!out.some((r) => r.label.trim() === ICED_TEA)) {
    const sodas = out.findIndex((r) => /^Sodas/.test(r.label.trim()));
    out.splice(sodas >= 0 ? sodas + 1 : out.length, 0, standard.find((s) => s.label === ICED_TEA)!);
  }
  return out;
}

/* ---------- untrusted input (server actions) ---------- */

const text = (value: unknown, max = 5000) => (typeof value === "string" ? value.slice(0, max) : "");

/** Coerces whatever the builder posted into a well-formed ProposalContent. */
export function normalizeContent(input: unknown): ProposalContent {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const base = defaultContent();
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base) as (keyof ProposalContent)[]) {
    if (key === "photos" || key === "pricing" || key === "addOns" || key === "eventType") continue;
    out[key] = text(raw[key]);
  }
  const type = eventTypes.find((t) => t.value === raw.eventType);
  out.eventType = type ? type.value : base.eventType;
  const photos: unknown[] = Array.isArray(raw.photos) ? raw.photos : [];
  out.photos = photoKeys.filter((k) => photos.includes(k));
  const priceLines = (value: unknown): PriceLine[] =>
    Array.isArray(value)
      ? value.slice(0, 30).map((row) => {
          const r = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
          return { label: text(r.label, 300), amount: text(r.amount, 100), note: text(r.note, 300) };
        })
      : [];
  out.pricing = priceLines(raw.pricing);
  // Proposals made before add-ons existed get none (not the standard list): the ones already
  // sent would otherwise change in front of the client. The builder can add the standard list.
  out.addOns = priceLines(raw.addOns);
  return out as ProposalContent;
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/* ---------- inquiry form to draft ---------- */

export type InquiryDetails = {
  name: string;
  email: string;
  /** One per picked day, YYYY-MM-DD (anything else is used as typed) */
  dates: string[];
  /** The visitor is still choosing between the dates */
  flexible: boolean;
  guests: string;
  kind: string;
  /** The form's drinks choice (beer-wine, beer-wine-cocktails, mocktails, unsure) */
  drinks: string;
  /** HH:MM from the form's time inputs, or blank */
  start: string;
  end: string;
  vibe: string;
};

/** "Saturday, June 13, 2027" for a YYYY-MM-DD date, without time zone shifts. */
export function longDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Best guess at the event type from what they typed, for the colors and greeting. */
export function guessEventType(...answers: string[]): EventType {
  const said = answers.join(" ").toLowerCase();
  if (/wedding|bridal|bride|engage|rehearsal|elop|vow/.test(said)) return "wedding";
  if (/corporate|company|work|office|team|client|employee|conference|offsite|holiday party/.test(said)) return "corporate";
  if (/pop-?up|activation|brand|launch|market|festival|grand opening/.test(said)) return "popup";
  if (/birthday|bday|party|shower|anniversary|graduat|retire|backyard|celebrat|reunion|baby/.test(said)) return "private";
  return "wedding";
}

/**
 * A draft proposal for a new inquiry: the builder's defaults, plus everything the form told us,
 * and a mock-up menu built from their drinks choice, date and vibe (lib/menu.ts).
 */
export function contentFromInquiry(inquiry: InquiryDetails): ProposalContent {
  const content = defaultContent();
  const firstName = inquiry.name.split(/\s+/)[0] ?? "";
  const kind = inquiry.kind.trim();
  const guests = inquiry.guests.trim();
  const dates = inquiry.dates.map((d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? longDate(d) : d));

  content.name = firstName;
  content.eventType = guessEventType(kind, inquiry.vibe);
  content.occasion = kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : "";
  content.date = inquiry.flexible ? (dates.length ? dates.join(" or ") : "") : (dates[0] ?? "");
  content.guests = /^\d[\d,]*$/.test(guests) ? `${guests} guests` : guests;
  content.time = timeRange(inquiry.start, inquiry.end);
  content.serviceWindow = hoursBetween(inquiry.start, inquiry.end);
  // Cocktail and mocktail packages come with a custom menu sign; beer and wine can add one
  const menuIncluded = inquiry.drinks !== "beer-wine";
  if (!menuIncluded) content.included = standardIncluded(false);
  Object.assign(
    content,
    mockMenu({
      drinks: inquiry.drinks,
      kind,
      vibe: inquiry.vibe,
      name: firstName,
      eventType: content.eventType,
      date: inquiry.dates[0],
    }),
  );
  return content;
}

/* ---------- sending ---------- */

export function defaultSubject(content: ProposalContent) {
  return `Your Revelrita proposal${content.date.trim() ? ` for ${content.date.trim()}` : ""}`;
}

export function defaultMessage(content: ProposalContent) {
  return [
    `Hi ${content.name.trim() || "there"},`,
    "Thank you so much for thinking of Revelrita! I put together a proposal with everything in one place: what's included, the drinks and the numbers.",
    "Have a look and let me know what you think. Happy to change anything.",
    "Cheers,\nHelen",
  ].join("\n\n");
}

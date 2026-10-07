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
  deposit: string;
  holdsFor: string;
  peak: string;
  /** "What's in the number": "title | sentence" per line */
  inTheNumber: string;
  pricingNote: string;
  alcohol: string;
  /** One per line */
  steps: string;
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
};

/* ---------- the artifact's standard wording ---------- */

export const DEFAULT_ALCOHOL =
  "Due to CA liquor licensing laws, alcohol has to be purchased under your name, not mine. To make it as easy as possible, here's what we do:\n\nI build the full shopping list down to the bottle, then place and manage the Total Wine order. You either pay at checkout with your card, or log into my Total Wine account and pay there. Anything unopened goes home with you!\n\nThat means two separate payments: the alcohol, paid directly by you, and my service invoice for everything above.";

export function defaultContent(): ProposalContent {
  return {
    name: "",
    eventType: "wedding",
    occasion: "",
    date: "",
    venue: "",
    guests: "",
    serviceWindow: "",
    intro: "We can't wait to make your party memorable!",
    packageName: "",
    included: [
      "The bar cart, styled and ready to go",
      "Two bartenders for the full service window",
      "Glassware",
      "Ice",
      "Fresh citrus, herbs and garnishes",
      "Mixers, juices and everything non-alcoholic",
      "Commercial sound system",
      "Setup and pack-out, we leave it cleaner than we found it",
      "Your shopping list, built and managed by me",
      "Coordination with your planner or venue",
    ].join("\n"),
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
    quote: "",
    quoteBy: "",
    photos: [...photoKeys],
    menuTitle: "",
    menu: "",
    pricing: [],
    deposit: "",
    holdsFor: "",
    peak: "",
    inTheNumber: [
      "Fresh juice, real citrus, pebble and block ice | The good stuff costs more than sour mix and a bag from the gas station, and you can taste the difference.",
      "A prep day before your event | Shopping, batching, ice pickup. Everything ready before we pull up.",
      "Bartenders who are actually good | Paid properly, which is why they're fun.",
      "The cart, the sound system, setup and pack-out |",
      "The alcohol is separate, and you buy it at store prices | So the total usually lands under what a catered bar charges for the same night.",
    ].join("\n"),
    pricingNote: "",
    alcohol: DEFAULT_ALCOHOL,
    steps: [
      "Say the word and I'll send the invoice and the agreement",
      "The deposit holds your date",
      "We lock the menu, then I build your shopping list",
      "I show up early, set up, and you go be a guest at your own party",
    ].join("\n"),
    email: contact.email,
    phone: contact.phone,
    signOff: "Can't wait. Let's make it a party!",
  };
}

/* ---------- untrusted input (server actions) ---------- */

const text = (value: unknown, max = 5000) => (typeof value === "string" ? value.slice(0, max) : "");

/** Coerces whatever the builder posted into a well-formed ProposalContent. */
export function normalizeContent(input: unknown): ProposalContent {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const base = defaultContent();
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base) as (keyof ProposalContent)[]) {
    if (key === "photos" || key === "pricing" || key === "eventType") continue;
    out[key] = text(raw[key]);
  }
  const type = eventTypes.find((t) => t.value === raw.eventType);
  out.eventType = type ? type.value : base.eventType;
  const photos: unknown[] = Array.isArray(raw.photos) ? raw.photos : [];
  out.photos = photoKeys.filter((k) => photos.includes(k));
  out.pricing = Array.isArray(raw.pricing)
    ? raw.pricing.slice(0, 30).map((row) => {
        const r = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
        return { label: text(r.label, 300), amount: text(r.amount, 100), note: text(r.note, 300) };
      })
    : [];
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

/** A draft proposal for a new inquiry: the builder's defaults, plus everything the form told us. */
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
